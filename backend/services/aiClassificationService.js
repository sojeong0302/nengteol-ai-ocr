// aiclassificationservice.js
// ------------------------------------------------------------
// 영수증 품목을 클로바 LLM(HCX-005)로 식품/비식품 분류하는 서비스
// - 정식 v3 Chat Completions 엔드포인트 사용
// - Bearer 토큰/REQUEST-ID 헤더 사용
// - 모델 응답이 ```json 코드블록/텍스트 섞임이어도 안전 파싱
// - 대량 품목은 청크로 분할 호출
// - '|| true' 같은 버그 제거 (전부 식품으로 분류되지 않도록)
// ------------------------------------------------------------
import axios from 'axios';

class AIClassificationService {
  constructor() {
    // === CLOVA Studio v3 ===
    this.apiKey = process.env.CLOVA_STUDIO_API_KEY; // 예: nv-XXXX...
    this.requestIdPrefix = process.env.CLOVA_STUDIO_REQUEST_ID || 'food-classifier';
    this.baseUrl = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005';

    // 모델 파라미터 (필요 시 조정)
    this.genParams = {
      topP: 0.8,
      topK: 0,
      maxTokens: 1200,
      temperature: 0.3,
      repetitionPenalty: 1.1,
      stop: [],
      seed: 0
    };

    // 한 번에 모델로 보내는 품목 수 (프롬프트 길이 방지)
    this.itemsPerChunk = parseInt(process.env.FOOD_CLASSIFY_ITEMS_PER_CHUNK || '30', 10);
  }

  /**
   * 메인 함수: LLM을 호출해 식품만 골라내서 반환
   * @param {Array<{name:string, quantity?:number, unit?:string, price?:number}>} items
   * @returns {Promise<Array<object>>} 식품으로 판정된 품목 목록 (원본 + category/aiReason/classifiedBy)
   */
  async classifyFoodItems(items) {
    if (!Array.isArray(items) || items.length === 0) return [];

    // 키 없으면 규칙기반 폴백
    if (!this.apiKey) {
      console.warn('[AIClassificationService] CLOVA_STUDIO_API_KEY 없음 → 규칙기반 폴백으로 진행');
      return this.fallbackClassification(items);
    }

    try {
      // 품목을 청크로 나눠 병렬(or 순차) 호출
      const chunks = this._chunk(items, this.itemsPerChunk);
      console.log(`[AIClassificationService] AI 분류 시작. 전체 ${items.length}개, 청크 ${chunks.length}개 (청크당 최대 ${this.itemsPerChunk})`);
      const resultsAll = [];

      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const reqId = `${this.requestIdPrefix}-${Date.now()}-${idx}`;

        const itemListText = chunk.map(it => {
          const parts = [];
          parts.push(it.name ?? '');
          if (it.quantity != null) parts.push(`${it.quantity}${it.unit || ''}`);
          if (it.price != null) parts.push(`${it.price}원`);
          const detail = parts.slice(1).join(', ');
          return detail ? `${parts[0]} (${detail})` : parts[0];
        }).join('\n');

        console.log(`[AIClassificationService] [${reqId}] 청크 아이템들:`, chunk.map(it => it.name).join(', '));
        console.log(`[AIClassificationService] [${reqId}] 생성된 아이템 리스트:\n${itemListText}`);

        const systemPrompt =
          '당신은 마트 영수증 품목을 식품/비식품으로 분류하는 전문가입니다. 결과는 JSON만 출력하세요.';
        const userPrompt = `다음은 마트 영수증에서 OCR로 인식된 상품들입니다. 
OCR 인식 과정에서 일부 글자가 잘릴 수 있으므로, 상식적으로 판단하여 올바른 상품명으로 정정한 후 분류해주세요.

상품 목록:
${itemListText}

다음 JSON 형식으로만 응답해주세요 (다른 설명/텍스트 없이):
{
  "results": [
    {
      "name": "정정된 상품명",
      "isFood": true/false,
      "category": "유제품|축산품|채소|과일|곡류|조미료|냉동식품|즉석식품|기타식품|비식품",
      "reason": "분류 이유 (간단히)"
    }
  ]
}

텍스트 정정 예시:
- "돈까", "돈가" → "돈까스" 또는 "돈가스"
- "치킨너", "치킨넛" → "치킨너겟"
- "볶음", "김치볶" → "볶음밥", "김치볶음밥"
- "떡볶" → "떡볶이"
- "샌드위" → "샌드위치"

분류 기준:
- 식품: 사람이 먹을 수 있는 모든 음식, 음료, 조리 재료, 즉석식품, 냉동식품
- 비식품: 생활용품, 화장품, 세제, 휴지, 약품, 의류 등
- 애매한 경우에는 "식품"으로 분류하되, reason에 근거를 간단히 기입`;

        const body = {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          ...this.genParams
        };

        const headers = {
          Authorization: `Bearer ${this.apiKey}`, // 'Bearer ' 접두사 없이 키만 env에 넣기
          'X-NCP-CLOVASTUDIO-REQUEST-ID': reqId,
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
        };

        let jsonObj;
        try {
          const res = await axios.post(this.baseUrl, body, { headers, timeout: 30000 });
          const text =
            res.data?.result?.message?.content ??
            res.data?.choices?.[0]?.message?.content ??
            '';
          console.log(`[AIClassificationService] [${reqId}] 모델 응답 상태:`, res.status);
          console.log(`[AIClassificationService] [${reqId}] 모델 응답(앞 300자):\n` + this._truncate(text, 300));
          jsonObj = this._safeExtractJson(text);
        } catch (e) {
          // 429/5xx 등 일시 오류일 수 있어 1회 재시도
          const status = e?.response?.status;
          if (status && (status === 429 || status >= 500)) {
            await this._sleep(800);
            const res2 = await axios.post(this.baseUrl, body, { headers, timeout: 30000 });
            const text2 =
              res2.data?.result?.message?.content ??
              res2.data?.choices?.[0]?.message?.content ??
              '';
            //jsonObj = this._safeExtractJson(text2);
    
            jsonObj = this._safeExtractJson(text2);
          } else {
            throw e;
          }
        }

        const mapped = this._mapAiJsonToFoods(jsonObj, chunk);
        resultsAll.push(...mapped);
      }

      console.log(`[AIClassificationService] 전체 분류 완료 → 최종 식품 개수: ${resultsAll.length}/${items.length}`);
      return resultsAll;
    } catch (err) {
      console.error('[AIClassificationService] LLM 분류 실패 → 폴백 사용:', err?.response?.data || err.message);
      return this.fallbackClassification(items);
    }
  }

  // ---------- 내부 유틸 ----------

  _safeExtractJson(aiText = '') {
    // ```json / ``` 제거
    let t = aiText.replace(/```json\s*|\s*```/g, '').trim();

    // 중괄호 범위만 슬라이스 (앞뒤 설명 제거)
    const s = t.indexOf('{');
    const e = t.lastIndexOf('}');
    if (s !== -1 && e !== -1) t = t.slice(s, e + 1);

    // JSON 파싱
    let obj;
    try {
      obj = JSON.parse(t);
    } catch {
      // 따옴표 정리 등 최소 복구 시도
      t = t.replace(/\r/g, '').replace(/\n/g, ' ').replace(/\t/g, ' ');
      obj = JSON.parse(t);
    }
    return obj;
  }

  _mapAiJsonToFoods(parsed, originalItems) {
    if (!parsed || !Array.isArray(parsed.results)) {
      console.warn('[AIClassificationService] AI JSON 파싱 결과가 비어있음 또는 형식 불일치:', parsed);
      return [];
    }

    const out = [];
    for (const orig of originalItems) {
      const matched = parsed.results.find(r => this._nameLike(r?.name, orig.name));
      if (!matched) {
        continue;
      }
      if (!matched.isFood) {
        continue;
      }

      const category = this._mapCategory(matched.category);
      out.push({
        ...orig,
        category,
        aiReason: matched.reason || '',
        classifiedBy: 'AI'
      });
    }
    return out;
  }

  _nameLike(a = '', b = '') {
    const norm = s => (s || '').replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
    const A = norm(a);
    const B = norm(b);
    if (!A || !B) return false;
    return A.includes(B) || B.includes(A);
  }

  _mapCategory(cand = '') {
    const m = {
      '유제품': '유제품',
      '축산품': '축산품',
      '채소': '채소',
      '과일': '과일',
      '곡류': '곡류',
      '조미료': '조미료',
      '냉동식품': '냉동식품',
      '즉석식품': '즉석식품',
      '기타식품': '기타',
      '비식품': '비식품'
    };
    const key = String(cand || '').trim();
    return m[key] || '기타';
  }

  _chunk(arr, size) {
    if (size <= 0) return [arr];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  _truncate(text, maxLength) {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // ---------- 규칙기반 폴백 ----------

  fallbackClassification(items) {
    // 가능한 보수적으로 식품만 추정
    const foodKeywords = [
      // 면/곡류
      '라면','면','국수','파스타','우동','냉면','비빔면','쌀','밀가루','빵','떡',
      // 육류/어류/해산물
      '돼지','소고기','닭','생선','참치','연어','새우','고기',
      // 유제품
      '우유','치즈','요구르트','버터','크림',
      // 채소/과일
      '양파','당근','배추','오이','토마토','사과','바나나','버섯',
      // 조미료/소스
      '소금','설탕','간장','된장','고추장','식용유','기름',
      // 가공/즉석/반찬
      '만두','떡볶이','김치','반찬','도시락',
      // 음료
      '물','음료','주스','차','커피'
    ];

    const nonFoodKeywords = [
      '세제','샴푸','비누','화장지','휴지','물티슈','치약',
      '화장품','로션','마스크','약','비타민',
      '배터리','전구','볼펜','종이','세탁세제','섬유유연제'
    ];

    const result = [];
    for (const it of items) {
      const name = (it.name || '').toLowerCase();
      if (!name) continue;

      if (nonFoodKeywords.some(k => name.includes(k))) {
        // 비식품으로 강한 신뢰 → 제외
        continue;
      }

      const looksFood = foodKeywords.some(k => name.includes(k));
      if (looksFood) {
        const guessed = this._guessCategory(name);
        result.push({
          ...it,
          category: guessed,
          classifiedBy: 'fallback'
        });
      }
    }
    return result;
  }

  _guessCategory(n) {
    if (n.includes('라면') || n.includes('면') || n.includes('쌀') || n.includes('빵') || n.includes('밀가루') || n.includes('떡')) return '곡류';
    if (n.includes('우유') || n.includes('치즈') || n.includes('요구르트') || n.includes('버터') || n.includes('크림')) return '유제품';
    if (n.includes('돼지') || n.includes('소고기') || n.includes('닭') || n.includes('고기')) return '축산품';
    if (n.includes('양파') || n.includes('당근') || n.includes('배추') || n.includes('오이') || n.includes('토마토') || n.includes('버섯')) return '채소';
    if (n.includes('사과') || n.includes('바나나')) return '과일';
    if (n.includes('소금') || n.includes('설탕') || n.includes('간장') || n.includes('된장') || n.includes('고추장') || n.includes('식용유') || n.includes('기름')) return '조미료';
    if (n.includes('냉동')) return '냉동식품';
    if (n.includes('만두') || n.includes('떡볶이') || n.includes('김치') || n.includes('도시락')) return '즉석식품';
    return '기타';
  }
}
export const aiClassificationService = new AIClassificationService();

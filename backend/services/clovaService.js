import axios from 'axios';

class ClovaService {
  constructor() {
    this.apiKey = process.env.CLOVA_API_KEY;
    this.apigwApiKey = process.env.CLOVA_APIGW_API_KEY;
    this.requestId = process.env.CLOVA_REQUEST_ID;
    this.baseUrl = 'https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003';
  }

  async generateRecipe(ingredients) {
    try {
      const ingredientList = ingredients.map(item => `${item.name} ${item.quantity}${item.unit}`).join(', ');
      
      const prompt = `다음 재료들로 만들 수 있는 맛있는 요리 레시피 3가지를 추천해주세요:
재료: ${ingredientList}

각 레시피마다 다음 형식으로 답변해주세요:
1. 요리명: [요리 이름]
   재료: [필요한 재료들]
   조리법: [간단한 조리 순서]
   예상 조리시간: [시간]
   난이도: [쉬움/보통/어려움]

실제로 만들 수 있는 현실적인 레시피로 추천해주세요.`;

      const requestData = {
        messages: [
          {
            role: 'system',
            content: '당신은 요리 전문가입니다. 주어진 재료를 활용하여 맛있고 실용적인 레시피를 추천해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 1000,
        temperature: 0.5,
        repeatPenalty: 5.0,
        stopBefore: [],
        includeAiFilters: true,
        seed: 0
      };

      const headers = {
        'X-NCP-CLOVASTUDIO-API-KEY': this.apiKey,
        'X-NCP-APIGW-API-KEY': this.apigwApiKey,
        'X-NCP-CLOVASTUDIO-REQUEST-ID': this.requestId,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      };

      const response = await axios.post(this.baseUrl, requestData, { headers });
      
      // 스트리밍 응답 처리 (간단화된 버전)
      let content = '';
      const lines = response.data.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.substring(5));
            if (data.message && data.message.content) {
              content += data.message.content;
            }
          } catch (e) {
            // JSON 파싱 에러 무시
          }
        }
      }

      return this.parseRecipes(content);
      
    } catch (error) {
      console.error('Clova API Error:', error.response?.data || error.message);
      
      // API 호출 실패 시 대체 레시피 반환
      return this.getFallbackRecipes(ingredients);
    }
  }

  parseRecipes(content) {
    // 응답을 파싱하여 구조화된 레시피 데이터로 변환
    const recipes = [];
    const recipeBlocks = content.split(/\d+\.\s*요리명:/);
    
    for (let i = 1; i < recipeBlocks.length; i++) {
      const block = recipeBlocks[i];
      const recipe = {
        id: i,
        name: this.extractValue(block, '', '재료:'),
        ingredients: this.extractValue(block, '재료:', '조리법:'),
        instructions: this.extractValue(block, '조리법:', '예상 조리시간:'),
        cookingTime: this.extractValue(block, '예상 조리시간:', '난이도:'),
        difficulty: this.extractValue(block, '난이도:', null)
      };
      
      recipes.push(recipe);
    }
    
    return recipes.length > 0 ? recipes : this.getFallbackRecipes();
  }

  extractValue(text, startMarker, endMarker) {
    let start = startMarker ? text.indexOf(startMarker) + startMarker.length : 0;
    let end = endMarker ? text.indexOf(endMarker, start) : text.length;
    
    if (start < 0 || (endMarker && end < 0)) return '';
    
    return text.substring(start, end).trim();
  }

  getFallbackRecipes(ingredients = []) {
    // Clova API 실패 시 기본 레시피들
    const baseRecipes = [
      {
        id: 1,
        name: '간단한 볶음밥',
        ingredients: '밥, 계란, 채소, 조미료',
        instructions: '1. ��팬에 기름을 두르고 계란을 볶는다\n2. 밥과 채소를 넣고 볶는다\n3. 조미료로 간을 맞춘다',
        cookingTime: '15분',
        difficulty: '쉬움'
      },
      {
        id: 2,
        name: '계란찜',
        ingredients: '계란, 물, 소금',
        instructions: '1. 계란을 풀어 체에 거른다\n2. 물과 소금을 넣고 섞는다\n3. 전자레인지에 3-4분 돌린다',
        cookingTime: '10분',
        difficulty: '쉬움'
      },
      {
        id: 3,
        name: '샐러드',
        ingredients: '채소, 드레싱',
        instructions: '1. 채소를 깨끗이 씻는다\n2. 적당한 크기로 자른다\n3. 드레싱과 함께 섞는다',
        cookingTime: '5분',
        difficulty: '쉬움'
      }
    ];

    // 재료에 따라 적절한 레시피 필터링
    if (ingredients && ingredients.length > 0) {
      const availableIngredients = ingredients.map(item => item.name.toLowerCase());
      
      return baseRecipes.map(recipe => ({
        ...recipe,
        matchedIngredients: availableIngredients.filter(ing => 
          recipe.ingredients.toLowerCase().includes(ing)
        ).length
      })).sort((a, b) => b.matchedIngredients - a.matchedIngredients);
    }

    return baseRecipes;
  }
}

export const clovaService = new ClovaService();
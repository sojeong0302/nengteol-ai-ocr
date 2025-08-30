// src/Pages/RecipesShow.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Clock, Users, Star, ArrowLeft, Copy } from "lucide-react";

export default function RecipesShow() {
    const navigate = useNavigate();

    const text = `1. 예열 & 파기름: 팬을 중불로 달군 뒤 기름 1큰술, 대파 넣고 30초 볶아 향을 내요.
2. 김치 볶기: 김치 넣고 2–3분 충분히 볶아 물기를 날려요. (신맛 강하면 설탕 ½작은술 추가)
3. 간 맞추기: 간장 1작은술을 팬 가장자리에 둘러 눌어붙듯 졸인 뒤 김치와 섞어요. 매콤하게는 고춧가루 추가.
4. 밥 투입: 밥을 넣고 펼쳐서 30초 두었다가 강불로 비비지 말고 먼저 누르듯 섞어요(수분 날리기 포인트).
5. 마무리 향: 불을 끄기 직전에 참기름 1작은술, 깨 살짝.
6. 계란 토핑(선택): 달걀프라이 하나 얹고 김가루 뿌리면 끝!`;

    // 줄바꿈을 단계 배열로 변환
    const steps = useMemo(
        () =>
            text
                .trim()
                .split("\n")
                .map((line) => line.replace(/^\d+\.\s?/, "").trim()),
        [text]
    );

    const numberedText = useMemo(() => steps.map((s, i) => `${i + 1}. ${s}`).join("\n"), [steps]);

    const [copied, setCopied] = useState(false);
    const copyAll = async () => {
        try {
            await navigator.clipboard.writeText(numberedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex gap-3">
                        <div className="page-icon">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-secondary">김치볶음밥</h1>
                            <p className="text-secondary text-xs">초간단 레시피</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* 요약 카드 */}
            {/* <div className="card">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="badge badge-green">쉬움</span>
                    <span className="badge badge-gray flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        10–15분
                    </span>
                    <span className="badge badge-gray flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        1인분
                    </span>
                    <span className="badge badge-yellow flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        꿀팁: 밥은 되게!
                    </span>
                </div>
            </div> */}
            {/* 단계 카드 */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <div
                        className=" text-lg font-semibold  1. 예열 & 파기름: 팬을 중불로 달군 뒤 기름 1큰술, 대파 넣고 30초 볶아 향을 내요.
2. 김치 볶기: 김치 넣고 2–3분 충분히 볶아 물기를 날려요. (신맛 강하면 설탕 ½작은술 추가)
3. 간 맞추기: 간장 1작은술을 팬 가장자리에 둘러 눌어붙듯 졸인 뒤 김치와 섞어요. 매콤하게는 고춧가루 추가.
4. 밥 투입: 밥을 넣고 펼쳐서 30초 두었다가 강불로 비비지 말고 먼저 누르듯 섞어요(수분 날리기 포인트).
5. 마무리 향: 불을 끄기 직전에 참기름 1작은술, 깨 살짝.
6. 계란 토핑(선택): 달걀프라이 하나 얹고 김가루 뿌리면 끝!"
                    >
                        조리 단계
                    </div>
                    <button
                        onClick={copyAll}
                        className="btn btn-outline btn-sm flex items-center gap-2"
                        title="전체 복사"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? "복사됨" : "전체 복사"}
                    </button>
                </div>

                <ol className="space-y-3">
                    {steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className="text-secondary shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                            </div>
                            <p className="text-secondary leading-relaxed">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
            {/* 하단 액션 */}
            <div className="flex w-full items-center justify-center gap-2">
                {/* 더미 버튼 (완전 숨김) */}
                <button onClick={() => navigate("/MyFridge")} className="btn btn-outline ml-auto">
                    재료보기
                </button>

                {/* 실제 버튼 */}
                <button onClick={() => navigate(-1)} className="btn btn-outline ml-auto">
                    뒤로가기
                </button>
            </div>
        </div>
    );
}

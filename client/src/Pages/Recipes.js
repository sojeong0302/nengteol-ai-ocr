import React, { useState } from "react";
import { ChefHat, Clock, Users, Star } from "lucide-react";

export default function Recipes() {
    const [recipes] = useState([
        {
            id: 1,
            title: "김치볶음밥",
            difficulty: "쉬움",
            cookTime: 15,
            description: "간단하고 맛있는 김치볶음밥",
            ingredients: ["김치", "밥", "달걀", "파"],
        },
        {
            id: 2,
            title: "토마토 계란 볶음",
            difficulty: "쉬움",
            cookTime: 10,
            description: "영양 만점 토마토 계란 볶음",
            ingredients: ["토마토", "달걀", "파", "마늘"],
        },
        {
            id: 3,
            title: "된장찌개",
            difficulty: "보통",
            cookTime: 30,
            description: "구수한 된장찌개",
            ingredients: ["된장", "두부", "감자", "양파"],
        },
    ]);

    const difficultyColors = {
        쉬움: "badge-green",
        보통: "badge-yellow",
        어려움: "badge-red",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex gap-3">
                    <div className="page-icon">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-secondary">레시피 추천</h1>
                        <p className="text-secondary text-md">보유 식재료로 만들 수 있는 요리</p>
                    </div>
                </div>
            </div>

            {/* Recipe Cards */}
            <div className="grid grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="card">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-gray-600">4.5</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className={`badge ${difficultyColors[recipe.difficulty]}`}>
                                    {recipe.difficulty}
                                </span>
                                <span className="badge badge-gray flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {recipe.cookTime}분
                                </span>
                                <span className="badge badge-gray flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    2인분
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm">{recipe.description}</p>

                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-800 text-sm">필요 재료</h4>
                                <div className="flex flex-wrap gap-1">
                                    {recipe.ingredients.map((ingredient, idx) => (
                                        <span key={idx} className="badge badge-gray">
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary w-full">레시피 보기</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

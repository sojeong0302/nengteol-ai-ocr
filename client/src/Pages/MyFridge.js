import React, { useState, useEffect } from "react";
import { FoodItem } from "../entities/FoodItem";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import {
    Drumstick,
    FishSymbol,
    Milk,
    CupSoda,
    Apple,
    Refrigerator,
    Upload,
    AlertTriangle,
    Timer,
    Leaf,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import FoodItemCard from "../components/fridge/FoodItemCard";
import ReceiptUpload from "../components/fridge/ReceiptUpload";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyFridge() {
    const [foodItems, setFoodItems] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [foods, setFoods] = useState([]);
    const [selectedTab, setSelectedTab] = useState("all");
    const navigate = useNavigate();

    const normalizeCategory = (cat) => {
        const map = {
            고기: "고기",
            해산물: "해산물", // 필요하면 FoodItemCard에 seafood 추가 가능
            유제품: "유제품",
            음료: "음료",
            채소: "채소",
            과일: "과일",
        };
        return map[cat] || cat || "other";
    };

    const tabToKey = {
        all: null,
        고기: "고기",
        해산물: "해산물",
        유제품: "유제품",
        음료: "음료",
        채소: "채소",
        과일: "과일",
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/foods/1");
                setFoods(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (err) {
                console.error("데이터 가져오기 실패:", err);
                setFoods([]);
                console.log(foods);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    const loadFoodItems = async () => {
        try {
            const items = await FoodItem.filter({ status: "active" }, "-expiry_date");
            setFoodItems(items);
        } catch (error) {
            console.error("식재료 로딩 실패:", error);
        }
        setLoading(false);
    };

    const categorizeByExpiry = (items) => {
        const today = new Date();
        return items.reduce(
            (acc, item) => {
                const daysUntilExpiry = differenceInDays(parseISO(item.expiry_date), today);

                if (daysUntilExpiry < 0) {
                    acc.expired.push(item);
                } else if (daysUntilExpiry <= 2) {
                    acc.urgent.push(item);
                } else if (daysUntilExpiry <= 5) {
                    acc.soon.push(item);
                } else {
                    acc.fresh.push(item);
                }
                return acc;
            },
            { urgent: [], soon: [], fresh: [], expired: [] }
        );
    };

    const categorized = categorizeByExpiry(foodItems);
    const filterKey = tabToKey[selectedTab];
    const filteredFoods = foods
        .filter((f) => (filterKey ? normalizeCategory(f.category) === filterKey : true))
        .map((f) => ({ ...f, category: normalizeCategory(f.category) }));

    // const handleUpdate = async (food) => {
    //     // try {
    //     //     await axios.delete("http://localhost:5000/api/foods", {
    //     //         data: {
    //     //             user_id: 1,
    //     //             name: food.name,
    //     //             count: 1, // 1개 줄이기
    //     //         },
    //     //     });
    //     //     // 상태 업데이트: 수량 -1, 0이면 제거
    //     //     setFoods(
    //     //         (prev) =>
    //     //             prev
    //     //                 .map((f) => (f._id === food._id ? { ...f, quantity: f.quantity - 1 } : f))
    //     //                 .filter((f) => f.quantity > 0) // 수량 0은 리스트에서 제거
    //     //     );
    //     // } catch (err) {
    //     //     console.error("수정 실패:", err);
    //     // }
    //     alert("추가 되었습니다.");
    // };
    const handleUpdate = (food) => {
        // 상태 업데이트: 해당 food의 quantity +1
        setFoods((prev) => prev.map((f) => (f._id === food._id ? { ...f, quantity: f.quantity + 1 } : f)));
    };

    const handleinc = async (food) => {
        try {
            await axios.post("http://localhost:5000/api/foods", {
                data: {
                    user_id: 1,
                    name: food.name,
                    count: 1, // 1개 줄이기
                },
            });

            // 상태 업데이트: 수량 -1, 0이면 제거
            setFoods(
                (prev) =>
                    prev
                        .map((f) => (f._id === food._id ? { ...f, quantity: f.quantity - 1 } : f))
                        .filter((f) => f.quantity > 0) // 수량 0은 리스트에서 제거
            );
        } catch (err) {
            console.error("수정 실패:", err);
        }
    };

    if (loading) {
        return (
            <div className="page-content">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="page-icon">
                            <Refrigerator className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-secondary">냉장고</h1>
                            <p className="text-secondary text-md">재료 {foods.length}개</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Upload className="w-3 h-3" />
                        영수증 업로드
                    </button>
                </div>
            </div>
            {/* Alert Cards */}{" "}
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="card bg-red-50 btn btn-outline flex items-center gap-2 flex flex-col"
                    onClick={() => navigate("/MyFridgeUpload")}
                >
                    <div className="flex items-center gap-2 mb-2 ">
                        <div className="cursor-pointer font-semibold text-secondary">등록하기</div>
                    </div>
                    <div className="text-secondary">새로운 재료를 등록해주세요!</div>
                </div>
            </div>
            {/* Upload Component */}
            {showUpload && (
                <ReceiptUpload
                    onUploadComplete={() => {
                        setShowUpload(false);
                        loadFoodItems();
                    }}
                />
            )}
            {/* Tabs */}
            <Tabs defaultValue="urgent" className="w-full" value={selectedTab} onValueChange={(v) => setSelectedTab(v)}>
                <div className="tabs-list text-secondary">
                    <TabsTrigger value="고기" className="tab-trigger flex items-center gap-2">
                        <Drumstick className="w-4 h-4" />
                        고기
                    </TabsTrigger>
                    <TabsTrigger value="해산물" className="tab-trigger flex items-center gap-2">
                        <FishSymbol className="w-4 h-4" />
                        해산물
                    </TabsTrigger>
                    <TabsTrigger value="유제품" className="tab-trigger flex items-center gap-2">
                        <Milk className="w-4 h-4" />
                        유제품
                    </TabsTrigger>
                    <TabsTrigger value="음료" className="tab-trigger flex items-center gap-2">
                        <CupSoda className="w-4 h-4" />
                        음료
                    </TabsTrigger>
                    <TabsTrigger value="채소" className="tab-trigger flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        채소
                    </TabsTrigger>
                    <TabsTrigger value="과일" className="tab-trigger flex items-center gap-2">
                        <Apple className="w-4 h-4" />
                        과일
                    </TabsTrigger>
                </div>

                <div className="flex flex-col gap-1 mt-4">
                    {filteredFoods.map((food, idx) => (
                        <FoodItemCard
                            key={food._id ?? idx}
                            item={food}
                            onUse={handleUpdate} // ✅ 추가
                            onDelete={handleinc} // ✅ 사용
                        />
                    ))}
                    {filteredFoods.length === 0 && (
                        <div className="text-sm text-gray-500 p-3">해당 카테고리에 항목이 없어요.</div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

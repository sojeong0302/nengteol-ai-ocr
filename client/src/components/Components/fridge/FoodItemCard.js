import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trash2, CheckCircle2, Snowflake, Package } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import axios from "axios";

// 카테고리별 아이콘 (원하는 이모지/아이콘으로 교체 가능)
const categoryIcons = {
    고기: "🥩",
    해산물: "🦐",
    유제품: "🥛",
    음료: "🥤",
    채소: "🥦",
    과일: "🍎",
    기타: "📦",
};

// 카테고리별 색상
const categoryColors = {
    고기: "bg-red-100 text-red-700 border-red-200",
    해산물: "bg-blue-100 text-blue-700 border-blue-200",
    유제품: "bg-indigo-100 text-indigo-700 border-indigo-200",
    음료: "bg-yellow-100 text-yellow-700 border-yellow-200",
    채소: "bg-green-100 text-green-700 border-green-200",
    과일: "bg-pink-100 text-pink-700 border-pink-200",
    기타: "bg-gray-100 text-gray-700 border-gray-200",
};

// 카테고리 키 정규화
const toKey = (cat) => {
    const known = ["고기", "해산물", "유제품", "음료", "채소", "과일"];
    return known.includes(cat) ? cat : "기타";
};

export default function FoodItemCard({ item, onUse, onDelete }) {
    const key = toKey(item.category);
    const today = new Date();
    const expiryDate = parseISO(item.expiry_date);
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    // 유통기한 상태 계산
    const getExpiryStatus = () => {
        if (daysUntilExpiry < 0) return { status: "expired", color: "bg-red-500", text: "유통기한 지남" };
        if (daysUntilExpiry === 0) return { status: "today", color: "bg-orange-500", text: "오늘까지" };
        if (daysUntilExpiry <= 2) return { status: "urgent", color: "bg-red-400", text: `D-${daysUntilExpiry}` };
        if (daysUntilExpiry <= 5) return { status: "warning", color: "bg-orange-400", text: `D-${daysUntilExpiry}` };
        return { status: "good", color: "bg-green-400", text: `D-${daysUntilExpiry}` };
    };

    const expiryInfo = getExpiryStatus();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        {/* 좌측: 아이콘 + 정보 */}
                        <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">{categoryIcons[key]}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 text-lg truncate">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={categoryColors[key]}>
                                        {item.quantity} {item.unit}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        {item.storage_type === "freezer" && <Snowflake className="w-3 h-3" />}
                                        {item.storage_type === "pantry" && <Package className="w-3 h-3" />}
                                        <Calendar className="w-3 h-3" />
                                        <span>{format(expiryDate, "MM/dd", { locale: ko })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 우측: 유통기한 + 버튼 */}
                        <div className="flex flex-col items-end gap-2">
                            <Badge className={`${expiryInfo.color} text-white border-0 font-semibold px-2 py-1`}>
                                {expiryInfo.text}
                            </Badge>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onUse(item)}
                                    className="h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onDelete(item)}
                                    className="h-8 px-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, FileImage, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { FoodItem } from "@/entities/FoodItem";

const categoryColors = {
    produce: "bg-green-100 text-green-700 border-green-200",
    meat: "bg-red-100 text-red-700 border-red-200",
    dairy: "bg-blue-100 text-blue-700 border-blue-200",
    pantry: "bg-yellow-100 text-yellow-700 border-yellow-200",
    frozen: "bg-cyan-100 text-cyan-700 border-cyan-200",
    other: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ReceiptUpload({ onUploadComplete }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [extractedItems, setExtractedItems] = useState([]);
    const [error, setError] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file.type.startsWith("image/")) {
            setError("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setUploadedFile(file);

        try {
            // 파일 업로드
            const { file_url } = await UploadFile({ file });

            // OCR 처리
            const result = await ExtractDataFromUploadedFile({
                file_url,
                json_schema: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    quantity: { type: "number" },
                                    unit: { type: "string" },
                                    price: { type: "number" },
                                },
                            },
                        },
                    },
                },
            });

            if (result.status === "success" && result.output?.items) {
                // 추출된 데이터를 FoodItem 형식으로 변환
                const foodItems = result.output.items.map((item) => ({
                    name: item.name,
                    category: categorizeItem(item.name),
                    quantity: item.quantity || 1,
                    unit: item.unit || "개",
                    purchase_date: new Date().toISOString().split("T")[0],
                    expiry_date: calculateExpiryDate(item.name),
                    storage_type: "fridge",
                    status: "active",
                }));

                setExtractedItems(foodItems);
            } else {
                setError("영수증에서 정보를 추출할 수 없습니다. 다시 시도해주세요.");
            }
        } catch (err) {
            setError("파일 처리 중 오류가 발생했습니다.");
            console.error(err);
        }

        setIsProcessing(false);
    };

    const categorizeItem = (itemName) => {
        const vegetables = ["상추", "양파", "토마토", "오이", "배추", "무", "당근", "브로콜리"];
        const meats = ["닭고기", "돼지고기", "소고기", "생선", "새우"];
        const dairy = ["우유", "요거트", "치즈", "버터"];

        const name = itemName.toLowerCase();
        if (vegetables.some((v) => name.includes(v))) return "produce";
        if (meats.some((m) => name.includes(m))) return "meat";
        if (dairy.some((d) => name.includes(d))) return "dairy";
        return "other";
    };

    const calculateExpiryDate = (itemName) => {
        // 보수적 유통기한 계산 (구매일 기준)
        const baseDate = new Date();
        const defaultDays = {
            produce: 5, // 채소류 5일
            meat: 3, // 육류 3일
            dairy: 7, // 유제품 7일
            other: 14, // 기타 14일
        };

        const category = categorizeItem(itemName);
        const days = defaultDays[category] || 7;

        baseDate.setDate(baseDate.getDate() + days);
        return baseDate.toISOString().split("T")[0];
    };

    const saveExtractedItems = async () => {
        try {
            for (const item of extractedItems) {
                await FoodItem.create(item);
            }
            onUploadComplete();
            // 초기화
            setUploadedFile(null);
            setExtractedItems([]);
        } catch (err) {
            setError("저장 중 오류가 발생했습니다.");
        }
    };

    if (extractedItems.length > 0) {
        return (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        추출된 식재료 확인
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {extractedItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {item.quantity} {item.unit} | {item.expiry_date}까지
                                    </span>
                                </div>
                                <Badge variant="outline" className={categoryColors[item.category]}>
                                    {item.category}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExtractedItems([]);
                                setUploadedFile(null);
                            }}
                            className="flex-1"
                        >
                            다시 업로드
                        </Button>
                        <Button onClick={saveExtractedItems} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            냉장고에 저장
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    영수증 업로드
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                    }`}
                >
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                            <p className="text-gray-600">영수증을 분석하는 중...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                                <FileImage className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">영수증 사진을 업로드하세요</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    id="receipt-upload"
                                />
                                <Label htmlFor="receipt-upload">
                                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                        <span className="flex items-center gap-2 cursor-pointer">
                                            <Upload className="w-4 h-4" />
                                            파일 선택
                                        </span>
                                    </Button>
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

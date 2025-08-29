import React, { useState } from "react";
import { Upload, X } from "lucide-react";

const ReceiptUpload = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileUpload = async (files) => {
        if (!files.length) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('receipt', files[0]);

            console.log("파일 업로드 시작:", files[0].name);
            
            const response = await fetch('http://localhost:5000/api/receipt/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log("백엔드 응답:", result);

            if (result.success) {
                console.log(`${result.foodItems.length}개의 식품을 발견했습니다:`, result.foodItems);
                alert(`영수증 분석 완료!\n${result.foodItems.length}개의 식품을 발견했습니다.`);
                const user_id = 1;
                for (const food of result.foodItems) {
                    try {
                        const response = await fetch("http://localhost:5000/api/foods", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id, name: food.name, quantity: food.quantity, quantity: food.category }),
                        });

                        const data = await response.json();
                        console.log("응답:", data);
                    } catch (error) {
                        console.error("요청 실패:", error);
                    }
                }
            } else {
                console.error('업로드 실패:', result.error);
                alert('영수증 분석에 실패했습니다: ' + result.error);
            }
        } catch (error) {
            console.error('업로드 에러:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
            onUploadComplete();
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">영수증 업로드</h3>
                <button
                    onClick={() => onUploadComplete()}
                    className="btn btn-outline btn-sm text-gray-500 hover:text-gray-700"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600">영수증을 분석하는 중...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-800 mb-2">
                                영수증을 여기에 드래그하거나 클릭해서 업로드하세요
                            </p>
                            <p className="text-sm text-gray-500">JPG, PNG 파일을 지원합니다</p>
                        </div>
                        <button
                            onClick={() => document.getElementById("file-input").click()}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            파일 선택
                        </button>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-4">* AI가 영수증을 자동으로 분석하여 식재료를 추가합니다</p>
        </div>
    );
};

export default ReceiptUpload;

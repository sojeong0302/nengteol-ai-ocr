import React, { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "토마토",
            price: 3000,
            quantity: 2,
            category: "채소",
        },
        {
            id: 2,
            name: "달걀",
            price: 5000,
            quantity: 1,
            category: "축산품",
        },
    ]);
    const navigate = useNavigate();

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            setCartItems((items) => items.filter((item) => item.id !== id));
        } else {
            setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex justify-between items-star">
                    <div className="page-icon">
                        <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">장바구니</h1>
                        <p className="text-gray-500">{cartItems.length}개 상품</p>
                    </div>
                    <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate("/CartUpload")}>
                        장바구니 업로드
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.category}</p>
                                <p className="text-lg font-medium text-blue-600">{item.price.toLocaleString()}원</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => updateQuantity(item.id, 0)}
                                    className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary w-full">주문하기</button>

            {/* Empty State */}
            {cartItems.length === 0 && (
                <div className="text-center py-12 card">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">장바구니가 비어있습니다</p>
                </div>
            )}
        </div>
    );
}

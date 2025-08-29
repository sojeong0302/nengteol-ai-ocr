import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cart() {
    // 서버에서 받은 값으로 대체할 것이므로 초기값은 빈 배열
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const navigate = useNavigate();

    // 서버 응답 -> 프론트 상태로 안전 매핑
    const mapCartRow = (row, idx) => ({
        id: row.id ?? row.cart_item_id ?? idx, // id가 없으면 index로 fallback
        name: row.name ?? row.item_name ?? "이름없음",
        price: Number(row.price ?? row.unit_price ?? 0),
        quantity: Number(row.quantity ?? row.qty ?? 1),
        category: row.category ?? row.type ?? "기타",
    });

    useEffect(() => {
        (async () => {
            try {
                // TODO: userId나 cartId가 있다면 0 대신 실제 값 사용
                const res = await axios.get(`http://localhost:5000/api/carts/${1}`);
                const rows = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = rows.map(mapCartRow);
                setCartItems(mapped);
            } catch (err) {
                console.error("데이터 가져오기 실패:", err);
                setLoadError("장바구니를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            setCartItems((items) => items.filter((item) => item.id !== id));
        } else {
            setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
        }
        // 필요하면 여기서 서버 PATCH 호출 (낙관적 업데이트)
        // axios.patch(`/api/carts/items/${id}`, { quantity: newQuantity }).catch(...)
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const handleDelete = async (item) => {
        try {
            const res = await axios.delete("http://localhost:5000/api/carts", {
                data: {
                    user_id: 1, // 현재 로그인 유저 ID (예시)
                    name: item.name, // 삭제할 상품명
                    count: 1, // 삭제할 수량
                },
            });

            console.log("삭제 성공:", res.data);

            // 프론트 상태에서도 제거 (낙관적 업데이트)
            setCartItems((prev) => prev.filter((cartItem) => cartItem.name !== item.name));
        } catch (err) {
            console.error("삭제 실패:", err);
            console.log(item.name);
        }
    };
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="page-header">
                    <div className="flex justify-between items-star">
                        <div className="page-icon">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-secondary">장바구니</h1>
                            <p className="text-secondary text-xs">불러오는 중…</p>
                        </div>
                        <button
                            className="btn btn-outline flex items-center gap-2"
                            onClick={() => navigate("/CartUpload")}
                        >
                            장바구니 업로드
                        </button>
                    </div>
                </div>
                <div className="card">로딩 중입니다…</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex gap-3 justify-center">
                    <div className="page-icon">
                        <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-secondary">장바구니</h1>
                        <p className="text-secondary text-md">{cartItems.length}개의 상품</p>
                    </div>
                    <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate("/CartUpload")}>
                        장바구니 업로드
                    </button>
                </div>
            </div>

            {/* 에러 메시지 */}
            {loadError && <div className="card text-red-600">{loadError}</div>}

            {/* Cart Items */}
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-secondary">{item.name}</h3>
                                <p className="text-sm text-secondary">{item.category}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 ">
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"
                                    >
                                        <div className="text-secondary">&lt;</div>
                                    </button>

                                    <span className="w-8 text-center font-medium">{item.quantity}</span>

                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"
                                    >
                                        <div className="text-secondary">&gt;</div>
                                    </button>
                                </div>

                                {/* <button
                                    onClick={() => updateQuantity(item.id, 0)}
                                    className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 합계/주문 버튼 */}

            {/* <button className="btn btn-primary flex w-">등록하기</button> */}

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

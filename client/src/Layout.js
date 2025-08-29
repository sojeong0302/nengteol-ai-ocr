import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import SidebarModal from "./components/SidebarModal/SidebarModal";
import { Refrigerator, ShoppingCart, ChefHat, Soup, NotepadText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navigationItems = [
    {
        title: "냉장고",
        url: "/MyFridge",
        icon: Refrigerator,
        color: "text-emerald-600",
    },
    {
        title: "장바구니",
        url: "/Cart",
        icon: ShoppingCart,
        color: "text-emerald-600",
    },
    {
        title: "레시피",
        url: "/Recipes",
        icon: Soup,
        color: "text-emerald-600",
    },
    {
        title: "기록",
        url: "/DHome",
        icon: NotepadText,
        color: "text-emerald-600",
    },
];

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="w-[100%] min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-3 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* 햄버거 버튼 */}
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center justify-center p-2 bg-transparent border-0 "
                        style={{ backgroundColor: "transparent", WebkitAppearance: "none", appearance: "none" }}
                        aria-label="메뉴 열기"
                    >
                        ☰
                    </button>

                    <div className="flex items-center gap-1 justify-center">
                        <h1
                            onClick={() => navigate("/")}
                            className="text-xl font-bold text-secondary flex items-center gap-1"
                        >
                            <ChefHat className="w-6 h-6" />
                            가난한 요리사들
                        </h1>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="flex-1 overflow-auto p-4">{children}</main>

            {/* 중앙 모달 */}
            <SidebarModal open={open} onClose={() => setOpen(false)} title="메뉴">
                <div className="flex flex-col gap-3 w-[100%] ">
                    {navigationItems.map((item) => (
                        <div
                            key={item.title}
                            className="text-secondary flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition no-underline cursor-pointer"
                            onClick={() => {
                                navigate(item.url); // 클릭 시 라우터 이동
                                setOpen(false); // 모달 닫기
                            }}
                        >
                            {/* 아이콘 */}
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                            {/* 타이틀 */}
                            <div className="no-underline font-medium">{item.title}</div>
                        </div>
                    ))}
                </div>
            </SidebarModal>
        </div>
    );
}

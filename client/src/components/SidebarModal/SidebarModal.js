// src/components/SidebarModal/SidebarModal.js
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function SidebarModal({ open, onClose, title = "메뉴", children }) {
    // 포커스/스크롤/배경 상호작용 차단
    useEffect(() => {
        const appRoot = document.getElementById("root"); // CRA 기본 루트
        if (!open) {
            // 닫힐 때 복구
            appRoot?.removeAttribute("inert");
            appRoot?.removeAttribute("aria-hidden");
            document.body.style.overflow = "";
            return;
        }

        // 열릴 때 적용
        appRoot?.setAttribute("inert", ""); // 마우스/키보드 상호작용 차단
        appRoot?.setAttribute("aria-hidden", "true"); // SR 포커스 차단
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden"; // 스크롤 락

        return () => {
            appRoot?.removeAttribute("inert");
            appRoot?.removeAttribute("aria-hidden");
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    // ESC로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const modal = (
        <div
            className="fixed inset-0 w-[100%]"
            style={{ zIndex: 2147483647 }}
            aria-modal="true"
            role="dialog"
            onMouseDown={(e) => {
                // 오버레이 클릭 시 닫기
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            {/* 배경 오버레이: 클릭 차단 + 흑백 */}
            <div
                className="absolute inset-0 z-10 bg-black/30"
                style={{
                    // 배경만 흑백(모달은 컬러 유지)
                    backdropFilter: "grayscale(100%)",
                    WebkitBackdropFilter: "grayscale(100%)",
                }}
            />

            {/* 모달 본체: 정중앙, 최상단 */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-[100%] max-w-[1200px] p-6"
                style={{
                    position: "fixed",
                    zIndex: 20,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0,
                    animation: "fadeInOnlyOpacity .18s ease-out forwards",
                    willChange: "opacity",
                }}
            >
                {title && <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>}

                <div className=" text-lg">{children}</div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-lg px-6 py-2 rounded-lg transition text-white"
                        style={{ backgroundColor: "#9ab4da", border: "none" }}
                    >
                        닫기
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeInOnlyOpacity {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
        </div>
    );

    const host = document.getElementById("modal-root") ?? document.body;
    return createPortal(modal, host);
}

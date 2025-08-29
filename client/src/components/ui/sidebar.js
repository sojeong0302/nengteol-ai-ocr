import React from "react";

// 간단한 사이드바 컴포넌트들
export const SidebarProvider = ({ children }) => <div className="flex">{children}</div>;

export const Sidebar = ({ children, className = "" }) => <div className={`w-64 h-screen ${className}`}>{children}</div>;

export const SidebarHeader = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;

export const SidebarContent = ({ children, className = "" }) => <div className={`flex-1 ${className}`}>{children}</div>;

export const SidebarGroup = ({ children }) => <div>{children}</div>;

export const SidebarGroupContent = ({ children }) => <div>{children}</div>;

export const SidebarMenu = ({ children, className = "" }) => <nav className={`${className}`}>{children}</nav>;

export const SidebarMenuItem = ({ children }) => <div>{children}</div>;

export const SidebarMenuButton = ({ children, asChild, className = "" }) => (
    <div className={`${className}`}>{children}</div>
);

export const SidebarTrigger = ({ className = "", onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-haspopup="dialog"
        aria-controls="sidebar-modal"
        aria-expanded="false"
        className={`md:hidden ${className}`}
    >
        ☰
    </button>
);

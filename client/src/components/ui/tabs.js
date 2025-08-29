import React, { useState, createContext, useContext } from "react";

const TabsContext = createContext();

export const Tabs = ({ children, defaultValue, className = "" }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className = "" }) => <div className={`tabs-list ${className}`}>{children}</div>;

export const TabsTrigger = ({ children, value, className = "" }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button className={`tab-trigger ${isActive ? "active" : ""} ${className}`} onClick={() => setActiveTab(value)}>
            {children}
        </button>
    );
};

export const TabsContent = ({ children, value, className = "" }) => {
    const { activeTab } = useContext(TabsContext);

    if (activeTab !== value) return null;

    return <div className={className}>{children}</div>;
};

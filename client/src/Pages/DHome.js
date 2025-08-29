// src/Pages/DHome.js
import React, { useState, useEffect } from "react";
import Header from "../components/DiaryComponents/Header";
import Button from "../components/DiaryComponents/Button";
import DiaryList from "../components/DiaryComponents/DiaryList";

const DHome = () => {
    const [pivotDate, setPivotDate] = useState(new Date());
    const headerTitle = `${pivotDate.getFullYear()}년 ${pivotDate.getMonth() + 1}월`;

    const onIncreaseMonth = () => setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 1));
    const onDecreaseMonth = () => setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1, 1));

    useEffect(() => {
        document.title = "일기장";
    }, []);

    return (
        <div>
            <Header
                title={headerTitle}
                leftChild={<Button text={"<"} onClick={onDecreaseMonth} />}
                rightChild={<Button text={">"} onClick={onIncreaseMonth} />}
            />
            {/* UI만: 비어있는 리스트 */}
            <DiaryList data={[]} />
        </div>
    );
};

export default DHome;

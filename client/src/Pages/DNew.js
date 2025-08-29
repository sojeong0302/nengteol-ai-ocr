import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ✅ 경로 정리: components/DiaryComponents
import Button from "../components/DiaryComponents/Button";
import Header from "../components/DiaryComponents/Header";
import Editor from "../components/DiaryComponents/Editor";

// setPageTitle을 쓰고 싶으면 유지, 없으면 document.title로 대체
// import { setPageTitle } from "../util";

const DNew = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    // UI-only: 실제 저장 없이 제출 시 홈으로 이동
    const onSubmit = (data) => {
        console.log("[UI only] submit data:", data);
        navigate("/DDiary", { replace: true });
    };

    useEffect(() => {
        // setPageTitle ? setPageTitle("일기 쓰기") :
        document.title = "일기 쓰기";
    }, []);

    return (
        <div className="flex flex-col gap">
            <Editor onSubmit={onSubmit} />
        </div>
    );
};

export default DNew;

import "./DiaryItem.css";
import { useNavigate } from "react-router-dom";
import { getEmotionImgById } from "../../util";
import Button from "./Button";
import React, { useEffect } from "react";

const DiaryItem = ({ id, emotionId, content, createdAt }) => {
    const navigate = useNavigate();
    const goDetail = () => {
        navigate(`/DDiary/${id}`);
    };
    useEffect(() => {
        console.log("출력" + createdAt);
    });
    return (
        <div className="DiaryItem">
            <div onClick={goDetail} className={["img_section", `img_section_${emotionId}`].join(" ")}>
                <img alt={`emotion${emotionId}`} src={getEmotionImgById(emotionId)} />
            </div>
            <div onClick={goDetail} className="info_section">
                <div className="content_wrapper">{content.slice(0, 25)}</div>
            </div>
        </div>
    );
};

export default React.memo(DiaryItem);

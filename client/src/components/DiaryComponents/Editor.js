import { getFormattedDate, emotionList } from "../../util";
import Button from "./Button.js";
import "./Editor.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmotionItem from "./EmotionItem.js";
import axios from "axios";

const Editor = ({ initData, onSubmit }) => {
    const [name, setName] = useState("");
    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState(3);
    const [emotionId, setEmotionId] = useState(null);

    const handleChangeEmotion = (id, scoreFromOrder) => {
        setEmotionId(id);
        setScore(scoreFromOrder); // 첫번째=1, 두번째=2 ... 다섯번째=5
    };
    const payload = {
        user_id: 1,
        recipe_name: name,
        feedback: feedback,
        score: score,
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/reviews", payload);
            console.log("등록 성공:", res.data);
            navigate(-1);
            console.log(payload);
        } catch (err) {
            console.error(err);
            console.log(payload);
        }
    };

    const navigate = useNavigate();

    const handleOnGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="Editor text-secondary">
            <div className="editor_section">
                <h4>오늘의 날짜</h4>
                <input type="date" />
            </div>
            <div className="editor_section">
                <h4>레시피 이름</h4>
                <input type="string" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="editor_section">
                <h4>평가</h4>
                <div className="input_wrapper emotion_list_wrapper">
                    {emotionList.map((it, idx) => (
                        <EmotionItem
                            key={it.id}
                            {...it}
                            onClick={() => handleChangeEmotion(it.id, idx + 1)}
                            isSelected={emotionId === it.id}
                        />
                    ))}
                </div>
            </div>
            <div className="editor_section">
                <h4>피드백</h4>
                <div className="input_wrapper">
                    <textarea
                        placeholder="오늘은 어땠나요?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </div>
            </div>
            <div className="editor_section">
                <div className="editor_section bottom_section">
                    <Button text={"취소하기"} onClick={handleOnGoBack} />
                    <Button text={"작성 완료"} type={"positive"} onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default Editor;

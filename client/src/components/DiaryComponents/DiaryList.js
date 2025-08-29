import "./DiaryList.css";
import Button from "./Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiaryItem from "./DiaryItem";
import axios from "axios";

const sortOptionList = [
    { value: "latest", name: "최신순" },
    { value: "oldest", name: "오래된 순" },
];

const DiaryList = ({ data }) => {
    const [sortType, setSortType] = useState("latest");
    const [sortedData, setSortedData] = useState([]);
    const [reviews, setReviews] = useState([]);

    const onChangeSortType = (e) => {
        setSortType(e.target.value);
    };

    const navigate = useNavigate();

    const onClickNew = () => {
        navigate("/Dnew");
    };

    useEffect(() => {
        const compare = (a, b) => {
            if (sortType === "latest") {
                return Number(b.date) - Number(a.date);
            } else {
                return Number(a.date) - Number(b.date);
            }
        };
        const copyList = JSON.parse(JSON.stringify(data));
        copyList.sort(compare);
        setSortedData(copyList);
    }, [data, sortType]);

    useEffect(() => {
        const compare = (a, b) => {
            const ad = new Date(a.date).getTime();
            const bd = new Date(b.date).getTime();
            return sortType === "latest" ? bd - ad : ad - bd;
        };
        const copyList = [...reviews];
        copyList.sort(compare);
        setSortedData(copyList);
    }, [reviews, sortType]);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reviews/user/${1}`);

                const rows = Array.isArray(res.data?.data) ? res.data.data : [];
                // 최소 매핑: DiaryItem이 기대하는 키로만 맞춤
                const normalized = rows.map((r) => ({
                    id: r._id ?? r.id,
                    emotionId: r.score,
                    content: r.feedback ?? "",
                    date: r.date ?? r.created_at, // "YYYY-MM-DD" or ISO 지원
                }));
                setReviews(normalized);
                console.log(res.data);
            } catch (err) {
                console.error("데이터 가져오기 실패:", err);
            }
        })();
    }, []);
    return (
        <div className="DiaryList">
            <div className="menu_wrapper">
                <div className="right_col">
                    <Button type={"positive"} text={"새 일기 쓰기"} onClick={onClickNew} />
                </div>
            </div>
            <div className="list_wrapper">
                {sortedData.map((it) => (
                    <DiaryItem key={it.id} {...it} />
                ))}
            </div>
        </div>
    );
};

export default DiaryList;

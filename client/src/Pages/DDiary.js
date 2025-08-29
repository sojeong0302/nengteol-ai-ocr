import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/DiaryComponents/Button";
import Header from "../components/DiaryComponents/Header";
import Viewer from "../components/DiaryComponents/Viewer";
import { getFormattedDate, setPageTitle } from "../util";
import { useEffect, useState } from "react";
import axios from "axios";

const DDiary = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const mapReview = (row) => {
        if (!row) return null;
        return {
            id: row._id ?? id,
            date: row.createdAt ?? row.updatedAt ?? Date.now(),
            emotionId: row.score ?? 3, // Viewer에서 score를 감정처럼 쓰도록 매핑
            content: row.feedback ?? "",
            title: row.recipe_name ?? "제목 없음",
        };
    };

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setLoadError(null);

        (async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reviews/${encodeURIComponent(id)}`);
                console.log("서버 응답:", res.data.data);
                const raw = res.data?.data;
                const mapped = mapReview(raw);
                if (!ignore) setDiary(mapped);
            } catch (e) {
                if (!ignore) setLoadError("일기를 불러오지 못했습니다.");
                console.error(e);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [id]);

    const goBack = () => navigate(-1);

    if (loading) return <div>일기를 불러오고 있습니다...</div>;
    if (loadError) return <div className="text-red-600">{loadError}</div>;
    if (!diary) return <div>해당 ID의 일기를 찾을 수 없습니다.</div>;

    const titleText = `${getFormattedDate(new Date(diary.date))} 기록`;

    return (
        <div>
            <Header title={diary.title || titleText} leftChild={<Button text={"<"} onClick={goBack} />} />
            <Viewer content={diary.content} emotionId={diary.emotionId} />
        </div>
    );
};

export default DDiary;

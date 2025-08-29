import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/DiaryComponents/Button";
import Header from "../components/DiaryComponents/Header";
import Viewer from "../components/DiaryComponents/Viewer";
import { getFormattedDate, setPageTitle } from "../util";
import { useEffect, useState } from "react";
import axios from "axios";

const DDiary = () => {
    const { id } = useParams(); // URL에서 받은 id (문자열)
    const navigate = useNavigate();

    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // 서버 응답 → 화면용 데이터로 매핑 (필드명이 다를 수 있어 안전 매핑)
    const mapReview = (row) => {
        if (!row) return null;
        return {
            // 서버 스키마에 맞게 우선순위로 매핑
            id: row.id ?? row.review_id ?? id,
            date: row.date ?? row.created_at ?? row.createdAt ?? Date.now(),
            emotionId: row.emotionId ?? row.emotion_id ?? 1,
            content: row.content ?? row.text ?? row.body ?? "",
        };
    };

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setLoadError(null);

        (async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reviews/${encodeURIComponent(id)}`);
                // 응답이 { data: {...} } 또는 { data: [ ... ] } 형태일 수 있어 분기
                const raw = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data ?? res.data;
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

    useEffect(() => {
        setPageTitle(`${id}번 일기`);
    }, [id]);

    const goBack = () => navigate(-1);

    if (loading) return <div>일기를 불러오고 있습니다...</div>;
    if (loadError) return <div className="text-red-600">{loadError}</div>;
    if (!diary) return <div>해당 ID의 일기를 찾을 수 없습니다.</div>;

    const title = `${getFormattedDate(new Date(Number(diary.date)))} 기록`;

    return (
        <div>
            <Header title={title} leftChild={<Button text={"< 뒤로가기"} onClick={goBack} />} />
            <Viewer content={diary.content} emotionId={diary.emotionId} />
        </div>
    );
};

export default DDiary;

import { useNavigate, useParams } from "react-router-dom";
import useDiary from "../hooks/useDiary";
import Button from "../components/DiaryComponents/Button";
import Header from "../components/DiaryComponents/Header";
import { getFormattedDate, setPageTitle } from "../util";
import Viewer from "../components/DiaryComponents/Viewer";
import { useEffect } from "react";

const DDiary = () => {
    const { id } = useParams();
    console.log(id);
    const data = useDiary(id);

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const goEdit = () => {
        navigate(`/edit/${id}`);
    };

    useEffect(() => {
        setPageTitle(`${id}번 일기`);
    });

    if (!data) {
        return <div>일기를 불러오고 있습니다...</div>;
    } else {
        const { date, emotionId, content } = data;
        const title = `${getFormattedDate(new Date(Number(date)))} 기록`;

        return (
            <div>
                <Header
                    title={title}
                    leftChild={<Button text={"< 뒤로가기"} onClick={goBack} />}
                    rightChild={<Button text={"수정하기"} onClick={goEdit} />}
                />
                <Viewer content={content} emotionId={emotionId} />
            </div>
        );
    }
};

export default DDiary;

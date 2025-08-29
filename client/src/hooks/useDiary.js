import { useContext, useMemo } from "react";
import { DiaryStateContext } from "../App";

// default export로 내보내기
export default function useDiary(id) {
    const diaryList = useContext(DiaryStateContext) ?? [];
    const safeList = Array.isArray(diaryList) ? diaryList : [];

    return useMemo(() => {
        if (!id) return undefined;
        return safeList.find((it) => String(it.id) === String(id));
    }, [safeList, id]);
}

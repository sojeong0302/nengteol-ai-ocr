import Review from "../model/model.review.js"

export const summaryReivew = async (req, res) => {
  try {
    const { date, score, feedback } = req.body;

    // 필수 값 확인
    if (!date || !score || !feedback) {
      return res.status(400).json({ message: "date, score, review는 필수입니다." });
    }

    const summary = '요약되엇어요';
    // 여기서는 DB 저장 없이 테스트용 요약 응답만 반환
    return res.status(200).json({
      suceess: true,
      data: summary,
      message: '요약성공'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getReview = async (req, res) => {
    try {
        const {id} = req.params;

        const data = await Review.findById(id);

        if(!data) {
            return (
                res.status(500).json({
                    success: false,
                    message: '리뷰아이디없음'
                })
            );
        }

        return res.status(200).json({
            success: true,
            data,
            message: '리뷰조회성공'
        });

    } catch(err) {
    
    }
}

export const setReview = async (req, res) => {
  try {
    const { user_id, recipe_name, feedback, score, date } = req.body;

    // 필수 값 체크
    if (!user_id || !recipe_name || !feedback || !score) {
      return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
    }

    // Review 생성
    const newReview = await Review.create({
      user_id,
      recipe_name,
      feedback,
      score,
    });

    // 생성된 document의 ObjectId 반환
    return res.status(201).json({
      success: true,
      object_id: newReview._id,
      message: "리뷰가 성공적으로 저장되었습니다."
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getUserReview = async (req, res) => {
    try {
        const { id } = req.params; // Path parameter 사용
        
        const data = await Review.find({ user_id: id });
        
        return res.status(200).json({
            success: true,
            data,
            message: '본 유저의 모든 리뷰'
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: '서버 오류 발생'
        });
    }
};

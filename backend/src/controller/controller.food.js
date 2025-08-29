import Food from "../model/model.food.js";

// 모든 음식 조회
export const getFoods = async (req, res) => {
  try {
    const { user_id } = req.params; // GET /foods/:user_id
    const foods = await Food.find({ user_id }).sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      data: foods,
      message: `${user_id}의 모든 음식 조회 성공`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "음식을 불러오는 중 오류 발생",
      error
    });
  }
};

// 단일 음식 조회
export const getFoodById = async (req, res) => {
  try {
    const { user_id, name } = req.params;  // path param

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "음식 이름이 필요합니다."
      });
    }

    const food = await Food.findOne({ user_id: user_id, name: name });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `${name} 음식을 찾을 수 없습니다.`
      });
    }

    res.status(200).json({
      success: true,
      data: food,
      message: "단일 음식 조회 성공"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "음식 조회 중 오류 발생",
      error
    });
  }
};

// 음식 추가 (이미 있으면 +1, 없으면 새로 추가)
export const addFood = async (req, res) => {
  try {
    const { user_id, category, name, ice, count } = req.body;

    let food = await Food.findOne({ user_id, name });

    if (!food) {
      // 음식이 없으면 새로 추가
      const newFood = new Food({
        user_id,
        category,
        name,
        quantity: count || 1,
        ice
      });

      const food = await newFood.save();
      return res.status(201).json({
        success: true,
        data: food,
        message: "새 음식 추가 성공"
      });
    }

    // 이미 존재하면 수량 +1
    food.quantity += count || 1;
    await food.save();

    return res.status(200).json({
      success: true,
      data: food,
      message: `기존 음식 수량 + ${count}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "음식 추가 실패",
      error
    });
  }
};

// 음식 삭제
// 기존 냉장고에 있는 음식들만 조회한다는 가정
// 음식 수량 감소 (0이면 삭제)
export const decreaseFood = async (req, res) => {
  try {
    const { user_id, name, count } = req.body;

    const food = await Food.findOne({ user_id, name });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `${name}-음식을 찾을 수 없습니다.`,
      });
    }

    if (food.quantity > 1) {
      // 수량 1 감소
      food.quantity -= count || 1;
      await food.save();

      return res.status(200).json({
        success: true,
        data: food,
        message: `${name}-음식 수량 ${count} 감소`,
      });
    } else {
      const deleted = await Food.findByIdAndDelete(food._id);

      return res.status(200).json({
        success: true,
        data: deleted,
        message: `${name}-음식 삭제 완료`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "음식 처리 중 오류 발생",
      error,
    });
  }
};

export const getCategory = async (req, res) => {
    try {
        const {user_id} = req.params;
        const {category} = req.query;

        if(!category || !user_id) {
            return (
                res.status(400).json({
                    success: false,
                    message: '카테고리 명시 안함'
                })
            )
        }

        const data = await Food.find({user_id, category});
        res.status(200).json({
            success: true,
            data,
            message: 'category 추출'
        })
    } catch(err) {
        console.error(err);
    }
}
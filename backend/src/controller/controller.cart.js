import Cart from "../model/model.cart.js";

export const getCart = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id) {
            return (
                res.status(400).json({
                    success: false,
                    message: '아이디 전송안됨'
                })
            )
        }

        const data = await Cart.find({user_id: id});

        return (
            res.status(200).json({
                success: true,
                data,
                message: '장바구니 전체 조회 성공'
            })
        )
    } catch(err) {
        res.status(500).json({
            success: false,
            message: '서버오류'
        })
    }
}

// 음식 추가 (이미 있으면 +1, 없으면 새로 추가)
export const addCart = async (req, res) => {
  try {
    const { user_id, category, name, count } = req.body;

    let cart = await Cart.findOne({ user_id, name });

    if (!cart) {
      // 음식이 없으면 새로 추가
      const newCart = new Cart({
        user_id,
        category,
        name,
        quantity: count || 1,
      });

      const cart = await newCart.save();
      return res.status(201).json({
        success: true,
        data: cart,
        message: "새 음식 장바구니에 추가 성공"
      });
    }

    // 이미 존재하면 수량 +1
    cart.quantity += count || 1;
    await cart.save();

    return res.status(200).json({
      success: true,
      data: cart,
      message: `기존 음식 수량 + ${count}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "장바구니 추가 실패",
      error
    });
  }
};

// 음식 삭제
// 음식 수량 감소 (0이면 삭제)
export const decreaseCart = async (req, res) => {
  try {
    const { user_id, name, count } = req.body;

    const cart = await Cart.findOne({ user_id, name });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: `${name}-음식을 찾을 수 없습니다.`,
      });
    }

    if (cart.quantity > 1) {
      // 수량 1 감소
      cart.quantity -= count || 1;
      await cart.save();

      return res.status(200).json({
        success: true,
        data: cart,
        message: `${name}-음식 수량 ${count} 감소`,
      });
    } else {
      const deleted = await Cart.findByIdAndDelete(Cart._id);

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
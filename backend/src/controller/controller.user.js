import User from "../model/model.user.js";
// import jwt from "jsonwebtoken";

// 회원가입
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `${email} - 이미 등록된 이메일입니다.`,
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      data: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
      },
      message: "회원가입 성공",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "회원가입 실패",
      error: err.message,
    });
  }
};

// 로그인
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "이메일을 찾을 수 없습니다.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    // // JWT 발급
    // const token = jwt.sign(
    //   { user_id: user.user_id, email: user.email },
    //   process.env.JWT_SECRET || "secretkey",
    //   { expiresIn: "1h" }
    // );

    res.status(200).json({
      success: true,
      data: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
      },
      message: "로그인 성공",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "로그인 실패",
      error: err.message,
    });
  }
};

// 로그아웃
export const signout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "로그아웃 성공",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "로그아웃 실패",
      error: err.message,
    });
  }
};

// 사용자 정보 업데이트
export const updateUser = async (req, res) => {
  try {
    // user_id 만 받아서 update - 일단
    const { user_id, username, email, password } = req.body;
    // const { username, email, password } = req.body;

    const user = await User.findOne({ user_id: user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${user_id} - 사용자를 찾을 수 없습니다.`,
      });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // 모델에서 해시처리

    await user.save();

    res.status(200).json({
      success: true,
      data: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
      },
      message: "사용자 정보 업데이트 성공",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "사용자 정보 업데이트 실패",
      error: err.message,
    });
  }
};

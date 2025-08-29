import React, { useState } from "react";
import { Button, FormControl, FormLabel, Radio, RadioGroup, Input, InputAdornment, IconButton } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel"; // ⬅️ 별도 임포트
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FoodUpload({ apiUrl }) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [ice, setIce] = useState(false);
    const [category, setCategory] = useState("");
    const navigate = useNavigate();

    const increase = () => setQuantity((prev) => prev + 1);
    const decrease = () => setQuantity((prev) => Math.max(0, prev - 1));

    const handleSubmit = async () => {
        // 간단 검증
        if (!name.trim()) {
            alert("품목 이름을 입력해 주세요.");
            return;
        }
        if (!category) {
            alert("카테고리를 선택해 주세요.");
            return;
        }

        const payload = {
            user_id: 1,
            name: name.trim(),
            count: quantity,
            category,
            ice,
        };

        try {
            const res = await axios.post(apiUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("등록 성공:", res.data);
            alert("등록되었습니다!");
            navigate(-1);
            console.log(payload);
        } catch (err) {
            console.error(err);
            console.log(payload);
        }
    };

    return (
        <div className="space-y-6 p-4 flex flex-col">
            <h2 className="text-xl font-bold">등록</h2>
            <div className="flex flex-col gap-6">
                {/* 기본 인풋 */}
                <Input
                    placeholder="품목 이름"
                    fullWidth
                    value={name} // 상태 연결
                    onChange={(e) => setName(e.target.value)} // 입력 시 업데이트
                />
                {/* 수량 입력 */}
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    fullWidth
                    startAdornment={
                        <InputAdornment position="start">
                            <IconButton onClick={decrease}>
                                <RemoveIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={increase}>
                                <AddIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                    inputProps={{ min: 0 }}
                />
                <FormControl>
                    <FormLabel id="category-label">카테고리</FormLabel>
                    <RadioGroup
                        aria-labelledby="category-label"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <FormControlLabel value="고기" control={<Radio />} label="고기" />
                        <FormControlLabel value="해산물" control={<Radio />} label="해산물" />
                        <FormControlLabel value="유제품" control={<Radio />} label="유제품" />
                        <FormControlLabel value="음료" control={<Radio />} label="음료" />
                        <FormControlLabel value="채소" control={<Radio />} label="채소" />
                        <FormControlLabel value="과일" control={<Radio />} label="과일" />
                    </RadioGroup>
                </FormControl>
                {/* 냉동 여부 라디오 */}
                <FormControl>
                    <FormLabel id="frozen-label">냉동인지?</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="frozen-label"
                        name="frozen"
                        value={ice}
                        onChange={(e) => setIce(e.target.value)}
                    >
                        <FormControlLabel value="yes" control={<Radio />} label="냉동임" />
                        <FormControlLabel value="no" control={<Radio />} label="냉동 아님" />
                    </RadioGroup>
                </FormControl>
            </div>
            <div className="width-full flex justify-center  gap-2">
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    뒤로가기
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    등록하기
                </Button>
            </div>
        </div>
    );
}

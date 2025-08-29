import React from "react";
import { motion } from "framer-motion";

import { differenceInDays, parseISO, format } from "date-fns";
import { Clock, Trash2, CheckCircle, AlertTriangle, Timer } from "lucide-react";
import axios from "axios";
const FoodItemCard = ({ item, onUse, onDelete }) => {
    const handleDelete = async () => {
        try {
            if (item.quantity === 1) {
                const confirmDelete = window.confirm(`${item.name}은 마지막 1개 남아있습니다. 정말 사용하시겠습니까?`);
                if (!confirmDelete) return; // 취소 시 종료
            }
            await axios.delete("http://localhost:5000/api/foods", {
                data: { name: item.name, user_id: 1 },
            });
            alert(`${item.name}이(가) 삭제 완료 되었습니다.`);
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
        >
            <div className="flex items-center justify-between ">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-secondary">{item.name}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-secondary">{item.category}</span>
                        <span className="text-secondary">{item.quantity}개</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUse(item)}
                        className="btn btn-outline btn-sm flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 btn-blue"
                    >
                        <CheckCircle className="w-4 h-4" />
                        추가
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn btn-outline btn-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        사용
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default FoodItemCard;

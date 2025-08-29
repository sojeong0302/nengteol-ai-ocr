import FoodUpload from "../components/FoodUpload/FoodUpload";

export default function MyFridgeUpload() {
    return (
        <div className="space-y-6">
            <FoodUpload apiUrl="http://localhost:5000/api/foods" />
        </div>
    );
}

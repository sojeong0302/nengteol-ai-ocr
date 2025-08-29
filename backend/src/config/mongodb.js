import mongoose, { mongo }  from "mongoose";

const connectMongodb = async () =>{
    try {
        const mongo = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB 연결 성공: ', mongo.connection.host);
    } catch(err) {
        console.error('Mongodb 연결 오류:', err);
    }
}

export default connectMongodb;
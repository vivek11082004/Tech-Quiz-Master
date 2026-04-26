import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://vivekbhai100vk_db_user:GmYid5mKMMofrJga@cluster0.z3dnyru.mongodb.net/TechQuiz").then(() => {
        console.log("Connected to MongoDB");
    })
}
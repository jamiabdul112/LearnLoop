import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongo DB Connected")
    } catch (error) {
        console.log(`error in connecting DB : ${error}`)
        process.exit(1)
    }
}

export default connectDB
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

//connect to MongooDB
const connectDB = async() => {
    try{
      const con = await mongoose.connect(process.env.MONGODB_URI);
      logger.info(`Connected to MongoDB : ${con.connection.host}`);
    }catch(e){
      logger.error(`Failed to connect to MongoDB: ${e.message}`);
      process.exit(1);
    }
  }
  
  export default connectDB;
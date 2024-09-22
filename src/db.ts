
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const URI: string = process.env.MONGO_URI!;
    
    if (!URI) {
      throw new Error('MONGO_URI not found');
    }

    
    await mongoose.connect(URI);

    console.log('MongoDB connected successfully'); 
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
    
  }
};

export default connectDB;

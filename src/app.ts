import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db';
import moragan from 'morgan';
import userRouter from './routes/userRoutes';
import sendMail from './utils/mailer';
import venderRouter from './routes/vendorRoutes';

const app: Express = express();

dotenv.config();
connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.frontEnd_URL,
}))
 
  
app.use(moragan('dev'))
   
app.use('/',userRouter)
app.use('/vendor',venderRouter)


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})



import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db';
import morgan from 'morgan';
import userRouter from './routes/userRoutes';
import sendMail from './utils/mailer';
import venderRouter from './routes/vendorRoutes';
import adminRouter from './routes/adminRoutes';
import fs, { existsSync, unlink } from 'fs'
import { job } from './utils/cronJob';
import path from 'path';

const app: Express = express();

dotenv.config();
connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.frontEnd_URL,
    credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))


const fileName=new Date().toISOString().split('T')[0]
const loginDirectory=path.join(__dirname,'logs')
const appLogStream = fs.createWriteStream(path.join(loginDirectory, `${fileName}.log`), { flags: 'a' })
 

app.use(morgan('combined', { stream: appLogStream }))
app.use(morgan('dev'))
   
app.use('/',userRouter)
app.use('/vendor', venderRouter)
app.use('/admin',adminRouter) 

job.start()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})


 
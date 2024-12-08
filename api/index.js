import express, { urlencoded } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoute from './routes/user-route.js';
import authRouter from './routes/auth-route.js'; 
dotenv.config();

mongoose.connect(process.env.MONGO).then(()=>{
    console.log("connected to the database");
})
.catch((err)=>{
    console.log(err);
})

const app =express();
app.use(express.json());
app.use(urlencoded({extended:true}));

app.listen(3000 ,()=>{
    console.log("server is running on port 3000!");
    
})

app.use('/api/user',userRoute);
app.use('/api/auth', authRouter);


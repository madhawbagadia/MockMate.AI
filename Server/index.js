import express from 'express';
import 'dotenv/config'
import dns from 'dns';
dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
]);
import database from './config/db.js';
import redisClient from './config/redis.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import cors from "cors";
import userRouter from './routes/userRoute.js';
import interviewRouter from "./routes/interviewRoute.js"
import paymentRouter from './routes/paymentRoute.js';


const app = express();

app.use(cors({
    origin:"https://mockmate-client-ouu2.onrender.com",
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);



const PORT = process.env.PORT || 6000;
const InitializeConnection = async ()=>{
    
    try{

        await Promise.all([database(),redisClient.connect()]);
        console.log("DB Connected");
        
        app.listen(PORT, ()=>{
            console.log(`Server listening at port number: ${PORT}`);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}

InitializeConnection();
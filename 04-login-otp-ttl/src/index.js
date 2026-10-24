import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpkey(phone){
    return `otp:${phone}`;
}

app.post("/otp", async(req, res)=>{
    const {phone} = req.body;
    if(!phone){
        res.json({
            success: false,
            message: "Phone does not exits."
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpkey(phone), otp, 'EX', 45); // otp valid for 45 seconds.
    res.json({
        message: "OTP send", 
        otp,
    });
});

app.post("/otp/verify", async(req, res)=>{
    const {phone, otp} = req.body;
    const savedOTP = await redis.get(otpkey(phone));

    if(!savedOTP){
        return res.json({
            success: false, 
            message: "Otp expired or not found"
        });
    }
    if(savedOTP !== otp){
        return res.json({
            success: false,
            message: "Otp does not match",
        });
    }
    await redis.del(otpkey(phone));
    res.json({
        message:"OTP verified successfully."
    });
});

app.get("/otp/:phone/ttl", async (req, res)=>{
    const ttl = await redis.ttl(otpkey(req.params.phone)); // ttl -> time to live.
    res.json({ttl});
});


app.listen(3000, ()=>{
    console.log("server is running on port 3000");
});
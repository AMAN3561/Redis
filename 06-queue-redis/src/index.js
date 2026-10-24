const express = require("express");
const Redis = require("ioredis");

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY = 'queue:email';

app.post("/emails", async(req, res)=>{
    const job = {
        to: req.body.to,
        subject : req.body.subject || 'No subject',
        body: req.body.body || 'No body',
        createdAt: new Date().toISOString()
    }
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.json({
        queued: true,
        job
    });
});


app.get("/emails/process-one", async (req, res)=>{
    const raw_job = await redis.rpop(QUEUE_KEY);
    if(!raw_job){
        return res.json({
            message: "No job in queue"
        });
    }
    const job = JSON.parse(raw_job);
    res.json({
        message: "Email send",
        job:job
    });
});

app.listen(3000, ()=>{
    console.log("server is running on port 3000");
});
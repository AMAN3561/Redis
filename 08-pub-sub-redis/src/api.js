const express = require("express");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); 

app.post("/notification", async (req, res)=>{
    const payload = {
        title: req.body.title || "Default title",
        createdAt: new Date().toISOString(),
    }
    const recievers = await publisher.publish("notifications", JSON.stringify(payload));
    res.json({
        message:`notification send to ${recievers} subscribers`,
    });
});
/// incr
/// zincrby
/// zrevrange
/// zrevrank


const express = require("express");
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const app = express();

app.use(express.json());

app.post("/post/:id/view", async (req, res)=>{
    try{
        const {id} = req.params;
        const views = await redis.zincrby(
            "leaderboard:post",
            1,
            `post:${id}`,
        );
        return res.json({
            success: true,
            postId: id,
            views: Number(views),
        });
    }catch(error){
        return res.json({
            success: false,
            message: "Internal server error",
        });
    }
     
});

app.post("/leaderboard/score", async (req, res) => {
    try {
        const { userid, points } = req.body;

        if (!userid || typeof points !== "number" ||
            !Number.isFinite(points) || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid userid and positive points are required"
            });
        }

        const score = await redis.zincrby(
            "leaderboard:users",
            points,
            `user:${userid}`
        );

        return res.json({
            success: true,
            userid: userid,
            score: Number(score)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

app.get("/leaderboard", async (req, res)=>{
    try{
        const scores = await redis.zrevrange(
        "leaderboard:post",
        0,
        10,
        "WITHSCORES",
        );
        if(scores.length === 0){
            return res.json({
                success: false, 
                message: "Leaderboard is empty",
            });
        }
        const leaderboard = [];
        for(let i = 0; i<scores.length; i +=2){
            const post = scores[i];
            const score = Number(scores[i+1]);
            const rank = (i/2) + 1;

            leaderboard.push({
                post:post,
                score: score,
                rank: rank,
            });
        }
        return res.json({
            success: true,
            leaderboard:leaderboard,
        });
    }catch(error){
        return res.json({
            success: false,
            message: "Internal server error while accessing Leaderboard",
        });
    }
});

app.get("/leaderboard/:id/rank", async (req, res) => {
    try {
        const { id } = req.params;

        const key = "leaderboard:post";
        const member = `post:${id}`;

        console.log("Key:", key);
        console.log("Member:", member);

        const score = await redis.zscore(key, member);
        const rank = await redis.zrevrank(key, member);

        const allPosts = await redis.zrevrange(
            key,
            0,
            -1,
            "WITHSCORES"
        );

        console.log("Score:", score);
        console.log("Rank:", rank);
        console.log("All posts:", allPosts);

        if (rank === null) {
            return res.status(404).json({
                success: false,
                message: "Post not found in leaderboard"
            });
        }

        return res.json({
            success: true,
            postId: id,
            rank: rank + 1
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});
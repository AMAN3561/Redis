const express = require("express");
const {emailQueue} = require("./queue.js")

const app = express();
app.use(express.json());

app.post("/welcome-email", async (req, res)=>{
    const job = await emailQueue.add(
        "Send-welcome-email",
        {
            to: req.body.to,
            name: req.body.name || "Learner",
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    );
})

app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});
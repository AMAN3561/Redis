const {Worker} = require("bullmq");
const {connection} = require("./queue.js");

const worker = new Worker(
    "emails",
    async (job)=>{
        console.log("Processing email job..", job.id, job.name, job.data);
        (await new Promise((resolve)=> setTimeout(resolve, 1500)),
            console.log("email job completed!", job.id, job.name, job.data));
    },
    {connection}
);

worker.on("completed", (job)=>{
    console.log("job completed", job.id, job.name, job.data);
});


worker.on("failed", (job, err)=>{
    console.log("job failed", job.id, job.name, job.data);
});

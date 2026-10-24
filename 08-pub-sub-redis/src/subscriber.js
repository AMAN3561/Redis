const Redis = require("ioredis");

const subscriber = new Redis(process.env.REDIS_URL || 'redis://')

subscriber.subscribe('notifications', (err)=>{
    if(err){
        console.error('Failed to subscribe: %s', err.message);
        return
    }
    console.log('subscribed successfully!');
});


subscriber.on('message', (channel, message)=>{
    console.log("Recieved on", channel, ":", JSON.parse(message));
})
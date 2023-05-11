const Queue=require('bull')
const redisClearingQueue=new Queue('sessionID clearing process');
const { createClient }=require('redis');
const client = createClient();
client.connect().then(()=>console.log('client connected'));
redisClearingQueue.process(async (job,done)=>{
    client.del(job.data.sessionID);
    done();
})
module.exports=redisClearingQueue;
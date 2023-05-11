const redisClearingQueue=require('../queues/sessiondeletion');
const {createClient}=require('redis');
const client = createClient();
client.connect();
const expect=require('chai').expect;
it('test if queue clear sessionId from redis',async()=>{
    await client.set('sessionID','adminname');
    redisClearingQueue.add({sessionID:'sessionID'})
    .then(()=>{
        //console.log(client.get(sessionID))
        expect(client.get(sessionID).to.be(null))
    })


})
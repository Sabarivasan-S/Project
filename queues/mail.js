const Queue=require('bull');
const joi=require('joi');
const {User}=require('../models');
const initialVerificationQueue = new Queue('Common emails',{redis:{host:'127.0.0.1',port:6379}});
const pendingVerificationQueue = new Queue('uncommon emails');
const valid={valid:'valid'};
const invalid={valid:'invalid'};
const schema=joi.string().email().custom((value,helpers)=>{
    if(value.endsWith('@gmail.com')|| value.ensWith('@yahoo.com')){
        return null;
    }
    else{
        return helpers.message('added to queue');
    }
})


initialVerificationQueue.process(async(job,done)=>{
    console.log('entered');
    let userDetails=job.data;
    let userEmail=userDetails.email;
    let result=schema.validate(userEmail)
    if(result.error){
        await User.update({valid:'pending'},{where:{userid:userDetails.userid}});
        console.log('moved to secondary queue');
        done();
    }
    else{
        await User.update(valid,{where:{userid:userDetails.userid}});
        console.log('updated')
        done();
    }
})

pendingVerificationQueue.add({},{
    repeat:{
        cron:'* */30 * * *'
    }
})
pendingVerificationQueue.process(async(job,done)=>{
    await User.update(invalid,{where:{valid:'pending'}});
    done();
});


module.exports={initialVerificationQueue};

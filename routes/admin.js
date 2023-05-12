const express=require('express');
const router=express.Router();
const functions=require('./functions');

router.post('/login',async(req,res)=>{
    await functions.adminLogin(req,res);   
})
router.get('/',(req,res)=>{res.send('admin portal')});

const {router:orderRouter}=require('./admin/order.js');
router.use('/order',orderRouter);

const {router:userRouter}=require('./admin/user.js');
router.use('/user',userRouter);

router.delete('/logout',functions.tokenAuthorization,async(req,res)=>{
    await functions.adminLogout(req,res);
})

module.exports={router};

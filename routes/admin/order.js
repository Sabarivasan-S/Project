const express=require('express');
const router=express.Router();
const functions=require('../functions');
router.get('/',functions.tokenAuthorization,async(req,res)=>{
    await functions.getAllOrders(req,res);
})

router.get('/:orderid',functions.tokenAuthorization,async(req,res)=>{
    await functions.getSpecificOrder(req,res);
})

router.delete('/:orderid',functions.tokenAuthorization,async (req,res)=>{
    await functions.deleteSpecificOrder(req,res);
})

module.exports={router};
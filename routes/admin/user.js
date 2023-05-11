const express=require('express');
const router=express.Router();
const functions=require('../functions');

router.get('/',functions.tokenAuthorization,async(req,res)=>{
    await functions.getAllUsers(req,res);
})

router.get('/orders/:userid',functions.tokenAuthorization,async (req,res)=>{
    await functions.getUserOrders(req,res);
})

router.get('/:userid',functions.tokenAuthorization,async(req,res)=>{
    await functions.getSpecificUser(req,res);
})

router.put('/:userid',functions.tokenAuthorization,async (req,res)=>{
    await functions.updateUser(req,res);
})

router.delete('/:userid',functions.tokenAuthorization,async(req,res)=>{
    await functions.deleteSpecificUser(req,res);
})

module.exports={router};
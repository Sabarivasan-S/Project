const express=require('express');
const joi=require('joi');
const {Order,User}=require('./models');

let {authenticateToken}=require('./authenticationserver.js')
const app=express();
require('dotenv').config();
app.use(express.json());

//Route to receive all the orders of user
app.get('/orders',authenticateToken,async (req,res)=>{
    let user=await User.findOne({where:{
        userid:res.userid
    }})
    let orderdetails=await user.getOrders();

    res.send(orderdetails);
});
//Route to get specific order
app.get('/order/:orderid',authenticateToken,async (req,res)=>{
    let orderid=req.params.orderid;
    let orderdetail;
    try{
        orderdetail=await Order.findAll({where:{userid:res.userid,orderid:orderid}});
    }catch(error) {res.status(404).send(error)}
    res.status(200).send(orderdetail);
});
//Route to create order
app.post('/order',authenticateToken,async (req,res)=>{
    try{
        let schema=joi.object({
            product:joi.string().required(),
            price: joi.number().min(1).required()
        })
        let {error}=schema.validate(req.body);
        if(error){
           // console.log(error);
            res.status(400).send('internal error');
        }
        let user=await User.findOne({where:{userid:res.userid}});
        let detail=await user.createOrder(req.body);
        res.send(detail);
    }
    catch(error){
        res.status(400).send('internal error');
    }
});
//Route to update order datails
app.put('/order/:orderid',authenticateToken,async (req,res)=>{
    try{
        let orderid=req.params.orderid;
        let userid=res.userid;
        let schema=joi.object({
            product:joi.string(),
            price: joi.number().min(1)
        })
        let {error}=schema.validate(req.body);
        if(error){
            res.status(400).send('internal error');
        }
        let result=await Order.update(req.body,{where:{orderid,userid}});
        res.send('Updation completed');
    }
    catch(error){
        res.status(400).send(error);
    }
});
//Route to delete order
app.delete('/order/:orderid',authenticateToken,async (req,res)=>{
        let orderid=req.params.orderid;   
        await Order.destroy({where:{userid:res.userid,orderid:orderid}})
        res.status(200).send('Deletion success');
});

app.listen(7000,()=>{console.log('resource server')});

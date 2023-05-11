const {Admin,Order,User,sequelize}=require('../models');
const fs=require('node:fs');
const crypto=require('node:crypto');
const bcrypt=require('bcrypt');
const redisClearingQueue=require('../queues/sessiondeletion');
const { createClient }=require('redis');
const client = createClient();
client.connect().then(()=>console.log('client connected'));
//for admin route
async function adminLogin(req,res){
    if(req.body.adminname==null){
        return res.status(400).send('enter valid adminname');
    }
    const adminname=req.body.adminname;
    const adminDetails=await Admin.findOne({where:{
        adminname:adminname
    }});
    if(req.body.password!=null && await bcrypt.compare(req.body.password,adminDetails.password)){
        admin={adminname:adminname};
        const sessionID=await crypto.randomBytes(64).toString('hex');
        await client.set(sessionID,adminname);
        redisClearingQueue.add({sessionID},{delay:18000000})
        return res.json({sessionID});
    }
    else{
        res.status(400).send('Invalid AdminName or Password');
    }
}

async function adminLogout(req,res){
    const authHeader = req.headers['authorization'];
    const sessionID = authHeader && authHeader.split(' ')[1];
    const receivedName=await client.getDel(sessionID)
    if(receivedName==null){
        res.status(400).send('Invalid SessionID');
    }else{
        return res.send('Logout Successful');
    }
    
}
async function tokenAuthorization(req,res,next){
    const authHeader = req.headers['authorization'];
    const sessionID = authHeader && authHeader.split(' ')[1];
    adminname=await client.get(sessionID);
    if(adminname==null){
        return res.status(400).send('Invalid Admin Token');
    }
    else{
        req.adminname=adminname;
        next();
    }
}
    
//for order route

async function getAllOrders(req,res){
    const orderDetails= await sequelize.query('SELECT * FROM "Orders"',{
        type:sequelize.QueryTypes.SELECT
    });
    res.json(orderDetails);
}

async function getSpecificOrder(req,res){
    const OrderID=req.params.orderid;
    const receivedDetails=await sequelize.query('SELECT * FROM "Orders" WHERE "orderid"=$$1',{
        bind:[OrderID],
        type:sequelize.QueryTypes.SELECT
    })
    if(receivedDetails.length===0){
        return res.send('no data exists');
    }
    res.send(receivedDetails);
}

async function deleteSpecificOrder(req,res){
    const OrderID=req.params.orderid;
    const deletedMeta=await sequelize.query('DELETE FROM "Orders" WHERE "orderid"=?',
    {
        replacements:[OrderID],
    })
    if(deletedMeta[1].rowCount==0){
        return res.status(404).send('no rows deleted');
    }
    res.send('Deletion Success');
}

//for user route

 async function getAllUsers(req,res){
    const allUsers=await sequelize.query('SELECT * FROM "Users"',{
        type:sequelize.QueryTypes.SELECT
    });
    res.send(allUsers);
 }

async function getSpecificUser(req,res){
    const Userid=req.params.userid;
    const specifiedUser=await sequelize.query('SELECT * FROM "Users" WHERE "userid"=:userid',{
        replacements:{userid:Userid},
        type:sequelize.QueryTypes.SELECT
    })
    console.log(specifiedUser)
    if(specifiedUser.length===0){
        return res.status(404).send('User Not Found');
    }
    res.send(specifiedUser);
}

async function updateUser(req,res){
    const Userid=req.params.userid;
    const Updatedrows=await User.update(req.body,{where:{userid:Userid}});
    if(Updatedrows[0]===0){
        return res.status(404).send('User not found')
    }
    return res.status(200).send('updation success');

}
async function getUserOrders(req,res){
    const Userid=req.params.userid;
    const user=await User.findOne({where:{userid:Userid}});
    if(user==null){
        return res.status(404).send('user not found');
    }
    const placedOrders=await user.getOrders();
    res.send(placedOrders);
}

async function deleteSpecificUser(req,res){
    const userId=req.params.userid;
    const deletedMeta=await User.destroy({where:{userid:userId},
    include:{model:Order}});
    if(deletedMeta==0){
        return res.status(404).send('no rows deleted');
    }
    res.send('Deletion Success');
}

module.exports={adminLogin,adminLogout,tokenAuthorization,getAllOrders,getSpecificOrder,getSpecificUser,getAllUsers,updateUser,getUserOrders,deleteSpecificOrder,deleteSpecificUser,client}
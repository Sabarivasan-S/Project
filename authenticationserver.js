//Importing the required modules
const express=require('express');
const {User}=require('./models');
const bcrypt=require('bcrypt');
const joi=require('joi');
const jwt=require('jsonwebtoken');
const {initialVerificationQueue}=require('./queues/mail.js');
require('dotenv').config();
const app=express();
//Calling json middleware
app.use(express.json());
const {router:adminrouter}=require('./routes/admin');
app.use('/admin',adminrouter);
//Connection with database ecommerce
let refreshTokens=[];
refreshTokens.push('sampletoken');
//Route to generate accessToken with refresh token
app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ userid: user.userid })
      res.json({ accessToken: accessToken })
    });
});
//Route to logout and delete refresh token
app.delete('/logout', authenticateToken,(req, res) => {
    if(!refreshTokens.includes(req.body.token)){
        res.status(401);
    }
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.send('logout success')
});
//Route to register user to table
app.post('/register',async (req,res)=>{
    let schema=joi.object({
        username: joi.string().min(3).max(30).required(),
        password: joi.string().min(8).required(),
        email: joi.string().email(),
        phone: joi.string().pattern(new RegExp('^\\d{10}$')).min(10).max(10),
        address:joi.string().min(10)
    });
    let {error}=await schema.validate(req.body);
    if(error){
       res.status(400).send(error);
    }
    const detail=await User.create(req.body);
    req.body.userid=detail.userid;
    initialVerificationQueue.add(req.body,{delay:toMilliSeconds(0,2,0)});
    return res.json({userid:detail.userid});
});
//Route for login of user
app.post('/login',async (req,res)=>{
  const user = await User.findByPk(req.body.userid);
  if(user==null){
    return res.status(400).send('user doesnt exist');
  }
  if(!await bcrypt.compare(req.body.password,user.password)){
      return res.status(401).send('wrong password'); 
  }
  let userid={userid:req.body.userid}
  const refreshToken = await jwt.sign(userid, process.env.REFRESH_TOKEN_SECRET);
  const accessToken=await jwt.sign(userid, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '15m' });
  addrefreshToken(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});
//Route for updating user details
app.put('/update',authenticateToken,async (req,res)=>{
  let schema=joi.object({
    username: joi.string().min(3).max(30),
    password: joi.string().min(8),
    email: joi.string().email(),
    phone: joi.string().pattern(new RegExp('^\\d{10}$')).min(10).max(10),
    address:joi.string().min(10)
  });
  let {error}=await schema.validate(req.body);
  if(error){
    return res.status(400).send(error);
  }
  
  await User.update(req.body,{where:{userid:res.userid}});
  return res.send('update success');
});
//function to generated token
function generateAccessToken(userid) {
    return jwt.sign(userid, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '15m' })
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userid) => {
    if (err) return res.sendStatus(403);
      res.userid=userid.userid;
    next();
  });
  
};
function addrefreshToken(token){
  refreshTokens.push(token);
}
const toMilliSeconds = (hrs,min,sec) => (hrs*60*60+min*60+sec)*1000;
//Making server listen
module.exports={authenticateToken,generateAccessToken,addrefreshToken};

app.listen(6000,()=>console.log('Server started'));
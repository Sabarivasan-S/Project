const functions=require('../routes/functions');
const chai=require('chai');
const expect=chai.expect;
const sinon=require('sinon')
const {createClient}=require('redis');
const testclient=createClient();
testclient.connect()
.then(()=>console.log('test client connected'))
const {Admin,User,Order}=require('../models');
describe('adminLogin',()=>{
    it('test with valid admin details',async()=>{
        let req={
            body:{
                adminname:'primaryadmin',
                password:'adminpassword'
            }
        };
        let res={
            status:function(s){
                this.returnedstatus=s;
                return this;
            },
            json:function(response){
                this.response=response;
                expect(this.response.sessionID).to.be.not.null;
               
            },
        };
        await functions.adminLogin(req,res);

    });
    it('test with empty object',async ()=>{
        let req={
            body:{
                adminname:null,
                password:null
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this;
            },
            send:function(response){
                this.response=response,
                expect(this.statuscode).to.equal(400);
            }
        }
        await functions.adminLogin(req,res);
    })
    it('test with invalid password',async ()=>{
        let req={
            body:{
                adminname:'primaryadmin',
                password:null
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this;
            },
            send:function(response){
                this.response=response,
                expect(this.statuscode).to.equal(400);
            }
        }
        await functions.adminLogin(req,res);
    })
    
})
describe('adminLogout',()=>{
    it('test with valid sessionId',async ()=>{
        //creation of sessionID
        let testsessionId='test';
        testclient.set(testsessionId,'testadminname');
        let req={
            headers:{
                authorization: `Bearer ${testsessionId}`
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this
            },
            send:function(response){
                this.response=response;
                expect(this.response).to.equal('Logout Successful')
            }
        }
        await functions.adminLogout(req,res);
    })
    it('test with invalid sessionID',async ()=>{
        let req={
            headers:{
                authorization: `Bearer InvalidSessionID`
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this
            },
            send:function(response){
                this.response=response;
                expect(this.statuscode).to.equal(400)
            }
        }
        await functions.adminLogout(req,res);
    })
})

describe('tokenAuthorization',()=>{
    it('test with valid sessionId',async ()=>{
        //creation of sessionID
        let testsessionId='test';
        testclient.set(testsessionId,'testadminname');
        let nextstub=sinon.stub();
        let req={
            headers:{
                authorization: `Bearer ${testsessionId}`
            }
        }
        let res={}
        await functions.tokenAuthorization(req,res,nextstub);
        expect(nextstub.calledOnce).to.be.true;
        sinon.restore();
        testclient.del(testsessionId);
    })
    it('test with invalid sessionID',async ()=>{
        let req={
            headers:{
                authorization: `Bearer InvalidSessionID`
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this
            },
            send:function(response){
                this.response=response;
                expect(this.statuscode).to.equal(400)
            }
        }
        await functions.adminLogout(req,res);
    })

})
describe('getAllOrders',()=>{
    it('test has no other variation',async ()=>{
        let res={
            json:function(response){
                expect(this.response).to.be.not.null;
            }
        }
        let req={}
        await functions.getAllOrders(req,res);
    })
})
describe('getSpecificOrder',()=>{
    it('test with valid order id',async ()=>{
        let req={
            params:{
                orderid:1
            }
        }
        let res={
            send:function(response){
                this.response=response;
                expect(this.response).to.be.an('array');
            }
        }
        await functions.getSpecificOrder(req,res);
    })
    it('test with invalid order id',async ()=>{
        let req={
            params:{
                orderid:0
            }
        }
        let res={
            send:function(response){
                this.response=response;
                expect(this.response).to.equal('no data exists');
            }
        }
        await functions.getSpecificOrder(req,res);
    })
})
describe('deleteSpecificOrder',()=>{
    it('test with valid orderid',async()=>{
        //creation of order
        let createdOrder=await Order.create({
            userid:1,
            product:"item1",
            price:100
        })
        let req={
            params:{
                orderid:createdOrder.orderid
            }
        }
        let res={
            send:function(response){
                expect(response).to.equal('Deletion Success');
            }
        }
        await functions.deleteSpecificOrder(req,res);
        let checkDelete=await Order.findOne({where:{orderid:createdOrder.orderid}});
        expect(checkDelete).to.be.null;
    })
    it('test with invalid orderID',async()=>{
        let req={
            params:{
                orderid:0
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this
            },
            send:function(response){
                this.response=response;
                expect(this.response).to.equal('no rows deleted')
                expect(this.statuscode).to.equal(404);
            }
        }
        await functions.deleteSpecificOrder(req,res);
    })

})

describe('getAllUsers',()=>{
    it('has no variation',async()=>{
        let req={}
        let res={
            send:function(response){
                this.response=response;
                expect(this.response).to.be.an('array');
            }
        }
        await functions.getAllUsers(req,res);
    })
})
describe('getSpecificUser',()=>{
    it('test with valid user ID',async()=>{
        let req={
            params:{
                userid:1
            }
        }
        let res={
            send:function(response){
                expect(response).to.be.an('array');
            }
        }
        await functions.getSpecificUser(req,res);
    })
    it('test with invalid user ID',async()=>{
        let req={
            params:{
                userid:0
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this
            },
            send:function(response){
                this.response=response;
                expect(this.response).to.equal('User Not Found');
            }
        }
        await functions.getSpecificUser(req,res);
    })
})

describe('updateUser',()=>{
    it('test with invalid userID',async()=>{
        let req={
            params:{
                userid:0
            },
            body:{
                username:"name2",
                password:"password2",
                email:"name2@myweb.com",
                phone:"1234567890",
                address:"address of name2"
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this;
            },
            send:function(response){
                expect(response).to.equal('User not found');
                expect(this.statuscode).to.equal(404)
            }
        }
        await functions.updateUser(req,res);
    })
    it('test with valid userID',async()=>{
        let createdUser=await User.create({
            username:"name1",
        password:"password1",
        email:"name1@myweb.com",
        phone:"1234567890",
        address:"address of name1"
        })
        let req={
            params:{
                userid:createdUser.userid
            },
            body:{
                username:"name2",
                password:"password2",
                email:"name2@myweb.com",
                phone:"1234567890",
                address:"address of name2"
            }
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this;
            },
            send:function(response){
                expect(response).to.equal('updation success');
                expect(this.statuscode).to.equal(200)
            }
        }
        await functions.updateUser(req,res);
        await User.destroy({where:{userid:createdUser.userid}});
    })
})

describe('getUserOrder',()=>{
    it('test with valid user',async()=>{
        let req={
            params:{userid:1}
        }
        let res={
            send:function(response){
                expect(response).to.be.an('array');
            }
        }
        await functions.getUserOrders(req,res);
    })
    it('test with invalid user',async()=>{
        let req={
            params:{userid:0}
        }
        let res={
            status:function(code){
                this.statuscode=code
                return this
            },
            send:function(response){
                expect(response).to.equal('user not found');
                expect(this.statuscode).to.equal(404);
            }
        }
        await functions.getUserOrders(req,res);
    })
})
describe('deleteSpecificUser',()=>{
    it('delete a valid user',async()=>{
        //create user
        let createdUser=await User.create({
            username:"name1",
        password:"password1",
        email:"name1@myweb.com",
        phone:"1234567890",
        address:"address of name1"
        })
        let req={
            params:{userid:createdUser.userid}
        }
        let res={
            send:function(response){
                expect(response).to.equal('Deletion Success');
            }
        }
        await functions.deleteSpecificUser(req,res);
        await User.destroy({where:{userid:createdUser.userid}});
    })
    it('delete a invalid user',async()=>{
        let req={
            params:{userid:0}
        }
        let res={
            status:function(code){
                this.statuscode=code;
                return this;
            },
            send:function(response){
                expect(response).to.equal('no rows deleted');
                expect(this.statuscode).to.equal(404)
            }
        }
        await functions.deleteSpecificUser(req,res);
    })
})
const functions=require('../routes/functions');
const chai=require('chai');
const expect=chai.expect;
const sinon=require('sinon')
const {createClient}=require('redis');
const testclient=createClient();
testclient.connect()
.then(()=>console.log('test client connected'))
const {Admin,User,Order}=require('../models');
const { before } = require('mocha');
describe('adminLogin',()=>{
    let createdAdmin;
    beforeEach(async ()=>{
         createdAdmin=await Admin.create({
            adminname:'testadmin',
            password:'testpassword'
        })
    })
    afterEach(async()=>{
        await createdAdmin.destroy();
    })
    it('test with valid admin details',async()=>{
        let req={
            body:{
                adminname:createdAdmin.adminanme,
                password:createdAdmin.password
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
                adminname:createdAdmin.password,
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
    let testsessionId;
    beforeEach(async ()=>{
        testsessionId='test';
        await testclient.set(testsessionId,'testadminname');
    })
    afterEach(()=>{
        testclient.del(testsessionId);
    })
    it('test with valid sessionId',async ()=>{
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
    let testsessionId;
    let nextstub;
    beforeEach(async ()=>{
        testsessionId='test';
        await testclient.set(testsessionId,'testadminname');
        nextstub=sinon.stub();
    })
    afterEach(async ()=>{
        await testclient.del(testsessionId);
        sinon.restore();
    })
    it('test with valid sessionId',async ()=>{
        
        let req={
            headers:{
                authorization: `Bearer ${testsessionId}`
            }
        }
        let res={}
        await functions.tokenAuthorization(req,res,nextstub);
        expect(nextstub.calledOnce).to.be.true;
        
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
                expect(this.statuscode).to.equal(400);
                expect(nextstub.called).to.be.false;
            }
        }
        await functions.adminLogout(req,res,nextstub);
    })

})
describe('getAllOrders',()=>{
    let createdOrder;
    beforeEach(async()=>{
        createdOrder=await Order.create({
            userid:1,
            product:'testproduct',
            price:100
        })
    })
    afterEach(async()=>{
        await createdOrder.destroy();
    })
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
    let createdOrder
    beforeEach(async()=>{
        createdOrder=await Order.create({
            userid:1,
            product:'testproduct',
            price:100
        })
    })
    afterEach(async()=>{
        await createdOrder.destroy();
    })
    it('test with valid order id',async ()=>{
        let req={
            params:{
                orderid:createdOrder.orderid
            }
        }
        let res={
            send:function(response){
                this.response=response;
                expect(this.response).to.be.an('array');
                expect(this.response.orderid==createdOrder.orderdid).to.be.true;
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
    let createdOrder;
    beforeEach(async()=>{
        createdOrder=await Order.create({
            userid:1,
            product:'testproduct',
            price:100
        })
    })
    afterEach(async()=>{
        await createdOrder.destroy();
    })
    it('test with valid orderid',async()=>{
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
        let checkDelete=await Order.findOne({where:{orderid:createdOrder.orderid}});
        expect(checkDelete).to.be.not.null;
    })

})

describe('getAllUsers',()=>{
    let createdUser;
    beforeEach(async()=>{
        createdUser=await User.create({
              username: 'testusername',
              password: 'testpassword',
              email: 'test@hotmail.com',
              phone: '4587302939',
              address: 'testaddress'
              
        })
    })
    afterEach(async()=>{
        await createdUser.destroy();
    })
    it('test to receive all users',async()=>{
        let req={}
        let res={
            send:function(response){
                this.response=response;
                expect(this.response).to.be.an('array');
                expect(this.response.length).to.not.equal(0);
            }
        }
        await functions.getAllUsers(req,res);
    })
})
describe('getSpecificUser',()=>{
    let createdUser;
    beforeEach(async()=>{
      createdUser=await User.create({
              username: 'testusername',
              password: 'testpassword',
              email: 'test@hotmail.com',
              phone: '4587302939',
              address: 'testaddress'
              
        })
    })
    afterEach(async()=>{
        await createdUser.destroy();
    })
    it('test with valid user ID',async()=>{
        let req={
            params:{
                userid:createdUser.userid
            }
        }
        let res={
            send:function(response){
                expect(response).to.be.an('array');
                expect(response[0].userid).to.equal(createdUser.userid);
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
    let createdUser;
    beforeEach(async()=>{
        createdUser=await User.create({
              username: 'testusername',
              password: 'testpassword',
              email: 'test@hotmail.com',
              phone: '4587302939',
              address: 'testaddress'
              
        })
    })
    afterEach(async()=>{
        await createdUser.destroy();
    })
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
        let updatedUser=await User.findOne({where:{userid:createdUser.userid}});
        expect(updatedUser.email).to.equal('name2@myweb.com');
        expect(updatedUser.phone).to.equal('1234567890');
        expect(updatedUser.address).to.equal('address of name2');
    })
})

describe('getUserOrder',()=>{
    let createdUser;
    let createdOrder
    beforeEach(async()=>{
         createdUser=await User.create({
            username: 'testusername',
            password: 'testpassword',
            email: 'test@hotmail.com',
            phone: '4587302939',
            address: 'testaddress'
            
      });
      createdOrder=await Order.create({
        product:'mobile',
        price:6000
      })
      await createdUser.addOrder(createdOrder);
    })
    afterEach(async()=>{
       await createdUser.removeOrder(createdOrder);
        await createdOrder.destroy();
        await createdUser.destroy();
    })
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
    let createdUser;
    beforeEach(async()=>{
        createdUser=await User.create({
              username: 'testusername',
              password: 'testpassword',
              email: 'test@hotmail.com',
              phone: '4587302939',
              address: 'testaddress'
              
        })
    })
    afterEach(async()=>{
        await createdUser.destroy();
    })
    it('delete a valid user',async()=>{
        let req={
            params:{userid:createdUser.userid}
        }
        let res={
            send:function(response){
                expect(response).to.equal('Deletion Success');
            }
        }
        await functions.deleteSpecificUser(req,res);
        let deletedUser=await User.findOne({where:{userid:createdUser.userid}});
        expect(deletedUser).to.be.null;
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
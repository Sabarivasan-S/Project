let chai=require('chai');
let chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
require('../authenticationserver');
require('../queues/mail');
require('dotenv').config();
chai.use(chaiHttp);
let {authenticateToken,generateAccessToken,addrefreshToken} = require('../authenticationserver.js');
let expect=chai.expect;
let userid={userid:1}
let refreshtoken=jwt.sign(userid,process.env.REFRESH_TOKEN_SECRET)
addrefreshToken(refreshtoken)
const token = generateAccessToken(userid);
describe('/token',()=>{
    it('test with valid token',(done)=>{
        chai.request('http://localhost:6000')
        .post('/token')
        .send({
            token:refreshtoken
        })
        .end((err,res)=>{
            expect(res).to.have.status(200);
            done();
        })
    });
    it('test with invalid token',(done)=>{
        chai.request('http://localhost:6000')
        .post('/token')
        .send({
            token:"sampletoken"
        })
        .end((err,res)=>{
            expect(res).to.have.status(403);
            done();
        })
    });
    it('test with invalid token',(done)=>{
        chai.request('http://localhost:6000')
        .post('/token')
        .send({
            token:""
        })
        .end((err,res)=>{
            expect(res).to.have.status(403);
            done();
        })
    });
    it('test with no token',(done)=>{
        chai.request('http://localhost:6000')
        .post('/token')
        .end((err,res)=>{
            expect(res).to.have.status(401);
            done();
        })
    });
});
describe('/login',()=>{
    it('test with valid credentials',(done)=>{
        chai.request('http://localhost:6000')
        .post('/login')
        .send({
            userid:1,
            password:"password1"
        })
        .end((err,res)=>{
            expect(res).to.have.status(200);
            done();

        });
    });
    
    it('test with invalid password',(done)=>{
        chai.request('http://localhost:6000')
        .post('/login')
        .send({
            "userid":1,
            "password":"invalidpassword"
        })
        .end((err,res)=>{
            expect(res).to.have.status(401);
            done();

        });
    });
    it('test with unavailable userid',(done)=>{
        chai.request('http://localhost:6000')
        .post('/login')
        .send({
            userid:10000,
            password:"password1"
        })
        .end((err,res)=>{
            expect(res).to.have.status(400);
            done();
        });
    })
})
describe('/logout',()=>{
    it('testing with invalid refreshToken',(done)=>{
        chai.request('http://localhost:6000')
        .delete('/logout')
        .set('authorization', `Bearer ${token}`)
        .send({
            token:""
        })
        .end((err,res)=>{
            expect(res).to.have.status(401);
            done();

        });
    });
    it('testing with valid refreshtoken',(done)=>{
        chai.request('http://localhost:6000')
        .delete('/logout')
        .set('authorization', `Bearer ${token}`)
        .send({
            token:refreshtoken
        })
        .end((err,res)=>{
            expect(res).to.have.status(200);
            done();
        });
    });
})
describe('/register',()=>{
    it('testing with invalid details',(done)=>{
        chai.request('http://localhost:6000')
        .post('/register')
        .send({
            username: 'newusername',
          password: 'newword',
          email: 'newemailexample.com',
          phone: '1234567890',
          address: 'newaddress'
        })
        .end((err,res)=>{
            expect(res).to.have.status(400);
            done();
        });
    })
    it('testing with valid details', (done)=>{
        chai.request('http://localhost:6000')
        .post('/register')
        .send({
            username: 'newusername',
          password: 'newpassword',
          email: 'newemail@example.com',
          phone: '1234567890',
          address: 'newaddress'
        })
        .end((err,res)=>{
            expect(res).to.have.status(200);
            done();
        });
    })
    it('testing with common email details', (done)=>{
      chai.request('http://localhost:6000')
      .post('/register')
      .send({
          username: 'newusername',
        password: 'newpassword',
        email: 'newemail@gmail.com',
        phone: '1234567890',
        address: 'newaddress'
      })
      .end((err,res)=>{
          expect(res).to.have.status(200);
          done();
      });
  })
})

describe('authenticateToken', () => {
    it('should return 401 if no authorization header is present', (done) => {
      const req = {
        headers: {}
      };
      const res = {
        sendStatus: (status) => {
          expect(status).to.equal(401);
          done();
        }
      };
      authenticateToken(req, res, () => {});
    });
  
    it('should return 403 if the token is invalid', (done) => {
      const req = {
        headers: {
          'authorization': 'Bearer invalid_token'
        }
      };
      const res = {
        sendStatus: (status) => {
          expect(status).to.equal(403);
          done();
        }
      };
      authenticateToken(req, res, () => {});
    });
  
    it('should set the userid in the request object if the token is valid', (done) => {
      const userId = '15';
      const token = jwt.sign({ userid: userId }, process.env.ACCESS_TOKEN_SECRET);
      const req = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const res = {};
      authenticateToken(req, res, () => {
        expect(res.userid).to.equal(userId);
        done();
      });
    });
  });
describe('User update', () => {
  it('should update user with a valid details', (done) => {
    
    chai.request('http://localhost:6000')
    .put('/update')
    .set('authorization', `Bearer ${token}`)
    .send({
      username: 'newusername',
      password: 'password1',
      email: 'newemail@example.com',
      phone: '1234567890',
      address: 'newaddress'
    })
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    });
});
it('should update user with a valid details and no password', (done) => {
  chai.request('http://localhost:6000')
  .put('/update')
  .set('authorization', `Bearer ${token}`)
  .send({
    username: 'newusername',
    email: 'newemail@example.com',
    phone: '1234567890',
    address: 'newaddress'
  })
  .end((err, res) => {
    expect(res).to.have.status(200);
    done();
  });
});
  it('update user with a invalid details', (done) => {
      chai.request('http://localhost:6000')
        .put('/update')
        .set('authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
          password: 'new',
          email: 'newemail@example.com',
          phone: '1234567i90',
          address: 'newaddress'
        })
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
          });
      });
  });

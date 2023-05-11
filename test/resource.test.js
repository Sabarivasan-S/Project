require('../resourceserver');
let chai=require('chai');
const jwt = require('jsonwebtoken');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
require('dotenv').config();
let expect=chai.expect;
var orderId;
let userid={userid:1}
let token=jwt.sign(userid,process.env.ACCESS_TOKEN_SECRET);
let faketoken=jwt.sign({userid:7890},process.env.ACCESS_TOKEN_SECRET);
describe('GET /orders', () => {
    it('should get all orders of the authenticated user', (done) => {
      chai.request('http://localhost:7000')
        .get('/orders')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
    it('get specific null order ', (done) => {
        chai.request('http://localhost:7000')
          .get('/order/null')
          .set('authorization', `Bearer ${token}`)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
    });
    it('get specific order with valid details', async () => {
        const res= await chai.request('http://localhost:7000')
          .get('/order/1')
          .set('authorization', `Bearer ${token}`);
        expect(res).to.have.status(200);
        //console.log(res);
    });
});


describe('PUT /order/:orderid', () => {
  before(async () => {
    // Create an order for testing
    const orderRes = await chai.request('http://localhost:7000')
      .post('/order')
      .set('authorization', `Bearer ${token}`)
      .send({
        product: 'Test Product',
        price: 10
      });
    orderId = orderRes.body.orderid;
  });

  it('should update an order with valid details', async () => {
    const res = await chai.request('http://localhost:7000')
      .put(`/order/${orderId}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        product: 'Updated Product',
        price: 20
      });

    expect(res).to.have.status(200);

  });

  it('should return 400 error for invalid request body', async () => {
    const res = await chai.request('http://localhost:7000')
      .put(`/order/${orderId}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        product: 123, // Invalid type for product
        price: 20
      });

    expect(res).to.have.status(400);

  });

  it('should return 400 error for invalid order ID', async () => {
    const res = await chai.request('http://localhost:7000')
      .put('/order/invalid_order_id')
      .set('authorization', `Bearer ${token}`)
      .send({
        product: 'Updated Product',
        price: 20
      });

    expect(res).to.have.status(400);
  }); 
  it('should return 400 error for unauthorized request', async () => {
    const res = await chai.request('http://localhost:7000')
      .put(`/order/${orderId}`)
      .send({
        product: 'Updated Product',
        price: 20
      });

    expect(res).to.have.status(401);
  });
});

describe('delete order',()=>{
    it('delete valid order',(done)=>{
        chai.request('http://localhost:7000')
        .delete(`/order/${orderId}`)
        .set('authorization', `Bearer ${token}`)
        .end((err,res)=>{
            expect(res).to.have.status(200);
            done();
        })

    })
})
describe('POST /order', () => {
    it('should create an order for the authenticated user', (done) => {
      chai.request('http://localhost:7000')
        .post('/order')
        .set('Authorization', 'Bearer ' + token)
        .send({product: 'iPhone', price: 1000})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  
    it('should return an error if product is missing', (done) => {
      chai.request('http://localhost:7000')
        .post('/order')
        .set('Authorization', 'Bearer ' + token)
        .send({price: 1000})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  
    it('should return an error if price is missing', (done) => {
      chai.request('http://localhost:7000')
        .post('/order')
        .set('Authorization', 'Bearer ' + token)
        .send({product: 'iPhone'})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  
    it('should return an error if price is less than 1', (done) => {
      chai.request('http://localhost:7000')
        .post('/order')
        .set('Authorization', 'Bearer ' + token)
        .send({product: 'iPhone', price: 0})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
  

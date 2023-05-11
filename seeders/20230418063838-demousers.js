'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt=require('bcrypt');
module.exports = {
  async up (queryInterface, Sequelize) {
    
     await queryInterface.bulkInsert('Users', [
      {
        username:"name1",
        password: await bcrypt.hash("password1",(10)),
        email:"name1@myweb.com",
        phone:"1234567890",
        address:"address of name1"
      },
      {
        username:"name2",
        password: await bcrypt.hash("password2",(10)),
        email:"name2@myweb.com",
        phone:"2234567890",
        address:"address of name2"
      },
      {
        username:"name3",
        password: await bcrypt.hash("password3",(10)),
        email:"name3@myweb.com",
        phone:"3234567890",
        address:"address of name3"
      },
      {
        username:"name4",
        password: await bcrypt.hash("password4",(10)),
        email:"name4@myweb.com",
        phone:"4234567890",
        address:"address of name4"
      }
    ], {});
   
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', [
      {
        username:"name1",
        password: await bcrypt.hash("password1",(10)),
        email:"name1@myweb.com",
        phone:"1234567890",
        address:"address of name1"
      },
      {
        username:"name2",
        password: await bcrypt.hash("password2",(10)),
        email:"name2@myweb.com",
        phone:"2234567890",
        address:"address of name2"
      },
      {
        username:"name3",
        password: await bcrypt.hash("password3",(10)),
        email:"name3@myweb.com",
        phone:"3234567890",
        address:"address of name3"
      },
      {
        username:"name4",
        password: await bcrypt.hash("password4",(10)),
        email:"name4@myweb.com",
        phone:"4234567890",
        address:"address of name4"
      }
    ], {});
  }
};

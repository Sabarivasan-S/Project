'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
     await queryInterface.bulkInsert('Orders', [
      {
        userid:1,
        product:"item1",
        price:100
      },
      {
        userid:2,
        product:"item2",
        price:200
      },
      {
        userid:3,
        product:"item3",
        price:300
      },
      {
        userid:2,
        product:"item4",
        price:400
      }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Orders', [
      {
        userid:1,
        product:"item1",
        price:100
      },
      {
        userid:2,
        product:"item2",
        price:200
      },
      {
        userid:3,
        product:"item3",
        price:300
      },
      {
        userid:2,
        product:"item4",
        price:400
      }
  ], {});
  }
};

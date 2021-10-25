'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const createdAt = new Date();
    const updatedAt = new Date();
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        fName: 'User1',
        lName: 'lastname',
        email: 'user1@gmail.com',
        imgUrl: 'https://example.com',
        createdAt,
        updatedAt
      },
      {
        id: 2,
        fName: 'User2',
        lName: 'lastname',
        email: 'user2@gmail.com',
        imgUrl: 'https://example.com',
        createdAt,
        updatedAt
      },
      {
        id: 3,
        fName: 'User3',
        lName: 'lastname',
        email: 'user3@gmail.com',
        imgUrl: 'https://example.com',
        createdAt,
        updatedAt
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
  }
};

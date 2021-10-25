'use strict';
const { v4: uuid } = require('uuid');

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
    await queryInterface.bulkInsert('rooms', [
      { id: 1, ownerId: 1, slug: uuid(), createdAt, updatedAt },
      { id: 2, ownerId: 2, slug: uuid(), createdAt, updatedAt },
      { id: 3, ownerId: 3, slug: uuid(), createdAt, updatedAt },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('rooms', null, {});
  }
};

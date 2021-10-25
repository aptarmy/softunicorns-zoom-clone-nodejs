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
    await queryInterface.bulkInsert('room_users', [
      { id: 1, roomId: 1, userId: 1, createdAt, updatedAt },
      { id: 2, roomId: 2, userId: 2, createdAt, updatedAt },
      { id: 3, roomId: 3, userId: 3, createdAt, updatedAt },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('room_users', null, {});
  }
};

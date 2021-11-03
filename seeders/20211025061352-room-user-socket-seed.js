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
    await queryInterface.bulkInsert('room_user_sockets', [
      { roomUserId: 1, userId: 1, socketId: uuid(), micMuted: false, cameraMuted: false, createdAt, updatedAt },
      { roomUserId: 2, userId: 2, socketId: uuid(), micMuted: false, cameraMuted: false, createdAt, updatedAt },
      { roomUserId: 3, userId: 3, socketId: uuid(), micMuted: false, cameraMuted: false, createdAt, updatedAt },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('room_user_sockets', null, {});
  }
};

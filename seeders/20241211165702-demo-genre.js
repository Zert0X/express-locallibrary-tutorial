// seeders/XXXXXXXXXXXXXX-demo-genre.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('genres', [
      { name: 'Fiction' },
      { name: 'Adventure' },
      { name: 'Science' },
      // Добавьте больше жанров по необходимости
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('genres', null, {});
  }
};

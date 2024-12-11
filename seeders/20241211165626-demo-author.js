// seeders/XXXXXXXXXXXXXX-demo-author.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('authors', [
      {
        first_name: 'John',
        family_name: 'Doe',
        date_of_birth: new Date('1970-01-01'),
        date_of_death: null,
      },
      {
        first_name: 'Jane',
        family_name: 'Smith',
        date_of_birth: new Date('1980-05-15'),
        date_of_death: null,
      },
      // Добавьте больше авторов по необходимости
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('authors', null, {});
  }
};

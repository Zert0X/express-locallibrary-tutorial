// seeders/XXXXXXXXXXXXXX-demo-bookinstance.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Предполагается, что книги уже добавлены и имеют id 1 и 2
    await queryInterface.bulkInsert('book_instances', [
      {
        book_id: 1, // ID книги "The Great Adventure"
        imprint: 'First Edition',
        status: 'Available',
        due_back: new Date('2024-12-31'),
      },
      {
        book_id: 2, // ID книги "Science 101"
        imprint: 'Second Edition',
        status: 'Loaned',
        due_back: new Date('2024-11-15'),
      },
      // Добавьте больше экземпляров по необходимости
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('book_instances', null, {});
  }
};

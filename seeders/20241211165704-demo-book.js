// seeders/XXXXXXXXXXXXXX-demo-book.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Предполагается, что авторы уже добавлены и имеют id 1 и 2
    await queryInterface.bulkInsert('books', [
      {
        title: 'The Great Adventure',
        author_id: 1, // ID автора John Doe
        summary: 'An epic adventure story.',
        isbn: '123-4567890123',
      },
      {
        title: 'Science 101',
        author_id: 2, // ID автора Jane Smith
        summary: 'An introductory science book.',
        isbn: '456-7890123456',
      },
      // Добавьте больше книг по необходимости
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('books', null, {});
  }
};

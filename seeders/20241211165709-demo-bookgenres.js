// seeders/XXXXXXXXXXXXXX-demo-book_genres.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Предполагается, что книги имеют id 1 и 2, жанры имеют id 1, 2 и 3
    await queryInterface.bulkInsert('book_genres', [
      { bookId: 1, genreId: 1 }, // "The Great Adventure" - "Fiction"
      { bookId: 1, genreId: 2 }, // "The Great Adventure" - "Adventure"
      { bookId: 2, genreId: 3 }, // "Science 101" - "Science"
      // Добавьте больше связей по необходимости
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('book_genres', null, {});
  }
};

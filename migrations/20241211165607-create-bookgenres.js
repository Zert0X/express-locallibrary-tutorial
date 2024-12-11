// migrations/XXXXXXXXXXXXXX-create-book_genres.js

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_genres', {
      bookId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      genreId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'genres',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: { // Опционально, если нужны временные метки
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: { // Опционально
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_genres');
  },
};

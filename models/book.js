// models/book.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    // Виртуальное поле URL
    get url() {
      return `/catalog/books/${this.id}`;
    }

    toJSON() {
      const values = { ...this.get() };
      values.url = this.url;
      return values;
    }

    async setGenres(genreIds){
      // Удаляем все текущие жанры книги
      await this.removeGenres([], { transaction: null });
      await this.save()
      // Добавляем новые жанры для книги
      await this.addGenres(genreIds, { transaction: null });
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Title is required' },
        },
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'authors',
          key: 'id',
        },
        field: 'author_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Summary is required' },
        },
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'ISBN is required' },
          // Дополнительная валидация ISBN при необходимости
        },
      },
    },
    {
      sequelize,
      modelName: 'Book',
      tableName: 'books',
      timestamps: false,
    }
  );
  return Book;
};

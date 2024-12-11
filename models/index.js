// models/index.js

'use strict';
const { Book, BookInstance, Author, Genre } = require('../models');

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Импорт всех моделей
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && 
      file !== basename && 
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Установка ассоциаций
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Определение ассоциаций

// Author <-> Book
db.Author.hasMany(db.Book, {
  foreignKey: 'authorId',
  as: 'books',
});
db.Book.belongsTo(db.Author, {
  foreignKey: 'authorId',
  as: 'author',
});

// Book <-> Genre (Many-to-Many)
db.Book.belongsToMany(db.Genre, {
  through: 'book_genres',
  foreignKey: 'bookId',
  otherKey: 'genreId',
  as: 'genres',
});
db.Genre.belongsToMany(db.Book, {
  through: 'book_genres',
  foreignKey: 'genreId',
  otherKey: 'bookId',
  as: 'books',
});

// Book <-> BookInstance
db.Book.hasMany(db.BookInstance, {
  foreignKey: 'bookId',
  as: 'book_instances',
});
db.BookInstance.belongsTo(db.Book, {
  foreignKey: 'bookId',
  as: 'book',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

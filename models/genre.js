// models/genre.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    // Виртуальное поле URL
    get url() {
      return `/catalog/genre/${this.id}`;
    }

    toJSON() {
      const values = { ...this.get() };
      values.url = this.url;
      return values;
    }
  }
  Genre.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Genre name is required' },
          len: {
            args: [3, 100],
            msg: 'Genre name must be between 3 and 100 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Genre',
      tableName: 'genres',
      timestamps: false,
    }
  );
  return Genre;
};

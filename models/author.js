// models/author.js

'use strict';
const { Model } = require('sequelize');
const { DateTime } = require('luxon');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    // Виртуальные поля
    get name() {
      return `${this.family_name}, ${this.first_name}`;
    }

    get url() {
      return `/catalog/author/${this.id}`;
    }

    get lifespan() {
      let lifetimeString = '';
      if (this.date_of_birth) {
        lifetimeString += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
      }
      lifetimeString += ' - ';
      if (this.date_of_death) {
        lifetimeString += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
      }
      return lifetimeString;
    }

    get date_of_birth_yyyy_mm_dd() {
      return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toISODate() : null;
    }

    get date_of_death_yyyy_mm_dd() {
      return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toISODate() : null;
    }

    // Переопределение метода toJSON для включения виртуальных полей
    toJSON() {
      const values = { ...this.get() };
      values.name = this.name;
      values.url = this.url;
      values.lifespan = this.lifespan;
      values.date_of_birth_yyyy_mm_dd = this.date_of_birth_yyyy_mm_dd;
      values.date_of_death_yyyy_mm_dd = this.date_of_death_yyyy_mm_dd;
      return values;
    }
  }
  Author.init(
    {
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'First name is required' },
          len: {
            args: [1, 100],
            msg: 'First name cannot exceed 100 characters',
          },
        },
      },
      family_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Family name is required' },
          len: {
            args: [1, 100],
            msg: 'Family name cannot exceed 100 characters',
          },
        },
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: 'Date of birth must be a valid date' },
        },
      },
      date_of_death: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: 'Date of death must be a valid date' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Author',
      tableName: 'authors',
      timestamps: false,
    }
  );
  return Author;
};

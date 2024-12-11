// models/bookinstance.js

'use strict';
const { Model } = require('sequelize');
const { DateTime } = require('luxon');

module.exports = (sequelize, DataTypes) => {
  class BookInstance extends Model {
    // Виртуальное поле URL
    get url() {
      return `/catalog/bookinstance/${this.id}`;
    }

    // Виртуальное поле для форматированной даты due_back
    get due_back_formatted() {
      return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
    }

    // Виртуальное поле для даты due_back в формате YYYY-MM-DD
    get due_back_yyyy_mm_dd() {
      return DateTime.fromJSDate(this.due_back).toISODate();
    }

    toJSON() {
      const values = { ...this.get() };
      values.url = this.url;
      values.due_back_formatted = this.due_back_formatted;
      values.due_back_yyyy_mm_dd = this.due_back_yyyy_mm_dd;
      return values;
    }
  }
  BookInstance.init(
    {
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        field: 'book_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      imprint: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Imprint is required' },
        },
      },
      status: {
        type: DataTypes.ENUM('Available', 'Maintenance', 'Loaned', 'Reserved'),
        allowNull: false,
        defaultValue: 'Maintenance',
        validate: {
          isIn: {
            args: [['Available', 'Maintenance', 'Loaned', 'Reserved']],
            msg: 'Status must be one of Available, Maintenance, Loaned, Reserved',
          },
        },
      },
      due_back: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: { msg: 'Due back must be a valid date' },
        },
      },
    },
    {
      sequelize,
      modelName: 'BookInstance',
      tableName: 'book_instances',
      timestamps: false,
    }
  );
  return BookInstance;
};

const { Book, BookInstance, Author, Genre } = require('../models'); // Импортируем модели
const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  // Получаем все экземпляры книг с их связанной книгой
  const allBookInstances = await BookInstance.findAll({
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['title'],
      },
    ],
  });

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  // Получаем данные об экземпляре книги и связанной книге
  const bookInstance = await BookInstance.findByPk(req.params.id, {
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['id', 'title'], // Только необходимые поля
      },
    ],
  });

  if (bookInstance === null) {
    // Если экземпляр книги не найден
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: 'Book Instance Detail',
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.findAll({
    attributes: ['id', 'title'],
    order: [['title', 'ASC']],
  });

  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
  });
});

exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().notEmpty().isInt().toInt(),
  body('imprint', 'Imprint must be specified').trim().notEmpty().escape(),
  body('status').optional({ checkFalsy: true }).trim().escape(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = BookInstance.build({
      bookId: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back || null,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.

      const allBooks = await Book.findAll({
        attributes: ['id', 'title'],
        order: [['title', 'ASC']],
      });

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
        selected_book: bookInstance.bookId,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url); // Убедитесь, что у модели BookInstance есть геттер для url
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findByPk(req.params.id, {
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['id', 'title'], // Только необходимые поля
      },
    ],
  });

  if (bookInstance === null) {
    // Если экземпляр книги не найден
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_delete.html", {
    title: "Delete Book Copy",
    bookinstance: bookInstance
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.destroy({ where: { id: req.body.bookid } });
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});

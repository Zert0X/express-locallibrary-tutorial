const { Book, BookInstance, Author, Genre } = require('../models'); // Импортируем модели
const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.findAll({
    order: [['name', 'ASC']],
  });

  res.render('genre_list', {
    title: 'Genre List',
    genre_list: allGenres,
  });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Получаем данные о жанре и связанные с ним книги параллельно
  const [genre, booksInGenre] = await Promise.all([
    Genre.findByPk(req.params.id), // Находим жанр по ID
    Book.findAll({
      attributes: ['id', 'title', 'summary'], // Берём только нужные поля книги
      include: [
        {
          model: Genre,
          as: 'genres',
          where: { id: req.params.id }, // Фильтруем книги по жанру
        },
      ],
    }),
  ]);

  if (genre === null) {
    // Если жанр не найден
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
});


// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genreData = { name: req.body.name };

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genreData,
        errors: errors.array(),
      });
      return;
    }

    // Data from form is valid. Check if Genre with same name already exists.
    const genreExists = await Genre.findOne({
      where: { name: req.body.name },
    });

    if (genreExists) {
      // Genre exists, redirect to its detail page.
      res.redirect(`${genreExists.url}`);
    } else {
      // Create a new genre in the database.
      const genre = await Genre.create(genreData);
      // Redirect to genre detail page.
      res.redirect(`${genre.url}`);
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});

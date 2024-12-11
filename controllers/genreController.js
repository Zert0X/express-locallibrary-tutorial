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
  const genre = await Genre.findByPk(req.params.id);

  if (genre === null) {
    // Если экземпляр книги не найден
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render("genre_delete.html", {
    title: "Delete Genre",
    genre: genre
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  await Genre.destroy({ where: { id: req.body.genreid } });
  res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findByPk(req.params.id);
  if (!genre) {
    // Если жанр не найден, перенаправляем на список жанров
    return res.redirect('/catalog/genres');
  }

  // Преобразуем жанр в простой объект
  const genreData = genre.get({ plain: true });

  res.render('genre_form.html', {
    title: 'Update Genre',
    genre: genreData,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  // Валидация и санитизация поля name
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genreData = {
      name: req.body.name,
      id: req.params.id, // чтобы знать, какой жанр обновлять
    };

    if (!errors.isEmpty()) {
      // Есть ошибки. Повторно отображаем форму.
      return res.render('genre_form.html', {
        title: 'Update Genre',
        genre: genreData,
        errors: errors.array(),
      });
    }

    // Нет ошибок. Обновляем запись.
    const genre = await Genre.findByPk(req.params.id);
    if (!genre) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    
    // Обновляем данные жанра
    genre.name = genreData.name;
    await genre.save();

    // Перенаправляем на страницу деталей жанра
    res.redirect(`/catalog/genre/${genre.id}`);
  }),
];

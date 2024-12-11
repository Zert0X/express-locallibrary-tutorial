const { Book, BookInstance, Author, Genre } = require('../models'); 
const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  // Получаем всех авторов, отсортированных по фамилии
  const allAuthors = await Author.findAll({
    order: [['family_name', 'ASC']],
  });

  res.render('author_list', {
    title: 'Author List',
    author_list: allAuthors,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  // Получаем данные об авторе и всех его книгах параллельно
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findByPk(req.params.id), // Находим автора по ID
    Book.findAll({
      attributes: ['id', 'title', 'summary'], // Берём только нужные поля книги
      where: { authorId: req.params.id }, // Фильтруем книги по автору
    }),
  ]);

  if (author === null) {
    // Если автор не найден
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render('author_form', { title: 'Create Author' });
});

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/u)
    .withMessage('First name contains invalid characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/u)
    .withMessage('Family name contains invalid characters.'),
    body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true }) // Поле необязательно
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true }) // Поле необязательно
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const authorData = {
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth || null,
      date_of_death: req.body.date_of_death || null,
    };

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('author_form', {
        title: 'Create Author',
        author: authorData,
        errors: errors.array(),
      });
      return;
    }

    // Data from form is valid. Save author.
    const author = await Author.create(authorData);

    // Redirect to new author record.
    res.redirect(`${author.url}`);
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findByPk(req.params.id),
    Book.findAll({
      where: { authorId: req.params.id },
      attributes: ["id", "title", "summary"],
    }),
  ]);

  if (author === null) {
    // No results.
    return res.redirect("/catalog/authors");
  }

  res.render("author_delete.html", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findByPk(req.body.authorid),
    Book.findAll({
      where: { authorId: req.body.authorid },
      attributes: ["id", "title", "summary"],
    }),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in the same way as for GET route.
    res.render("author_delete.html", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete the author and redirect to the list of authors.
    await Author.destroy({ where: { id: req.body.authorid } });
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findByPk(req.params.id);
  if (!author) {
    return res.redirect("/catalog/authors");
  }
  const authorData = author.get({ plain: true });
  // Форматируем дату до отправки в шаблон
  authorData.date_of_birth = author.date_of_birth ? author.date_of_birth.toISOString().split('T')[0] : '';
  authorData.date_of_death = author.date_of_death ? author.date_of_death.toISOString().split('T')[0] : '';
  console.log('Processed Author Dates:', authorData.date_of_birth, authorData.date_of_death); 
  res.render('author_form', { title: 'Update Author', author: authorData });
});

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/u)
    .withMessage('First name contains invalid characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/u)
    .withMessage('Family name contains invalid characters.'),
    body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true }) // Поле необязательно
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true }) // Поле необязательно
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const authorData = {
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth || null,
      date_of_death: req.body.date_of_death || null,
    };

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('author_form', {
        title: 'Update Author',
        author: authorData,
        errors: errors.array(),
      });
      return;
    }

    // Data from form is valid. Save author.
    const author = await Author.update(authorData, {
      where: { id: req.params.id },
    });

    // Redirect to new author record.
    res.redirect(`/catalog/authors`);
  }),
];
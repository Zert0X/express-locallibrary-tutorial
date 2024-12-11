const { Book, BookInstance, Author, Genre } = require('../models'); 
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
  res.send("NOT IMPLEMENTED: Author create GET");
});

// Handle Author create on POST.
exports.author_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create POST");
});

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});

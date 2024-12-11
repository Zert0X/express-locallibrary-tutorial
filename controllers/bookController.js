const { Book, BookInstance, Author, Genre } = require('../models'); // Импортируем модели
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Получаем данные о книгах, экземплярах, авторах и жанрах параллельно
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.findAndCountAll().then(result => result.count), // Подсчет количества книг
    BookInstance.findAndCountAll().then(result => result.count), // Подсчет экземпляров книг
    BookInstance.findAndCountAll({ where: { status: "Available" } }).then(result => result.count), // Доступные экземпляры
    Author.findAndCountAll().then(result => result.count), // Подсчет авторов
    Genre.findAndCountAll().then(result => result.count), // Подсчет жанров
  ]);

  // Рендеринг страницы
  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.findAll({
    attributes: ['id', 'title'],
    include: [
      {
        model: Author,
        as: 'author',
        attributes: ['id', 'first_name', 'family_name'],
      },
    ],
    order: [['title', 'ASC']], // Сортировка по заголовку
  });

  res.render('book_list', {
    title: 'Book List',
    book_list: allBooks,
  });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Получаем данные книги, автора, жанра и экземпляров книги параллельно
  const [book, bookInstances] = await Promise.all([
    Book.findByPk(req.params.id, {
      include: [
        {
          model: Author,
          as: 'author',
        },
        {
          model: Genre,
          as: 'genres',
        },
      ],
    }),
    BookInstance.findAll({
      where: { bookId: req.params.id },
    }),
  ]);

  if (book === null) {
    // Если книга не найдена
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }

  res.render('book_detail', {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});
// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});

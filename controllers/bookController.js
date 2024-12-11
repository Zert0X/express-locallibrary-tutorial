const { Book, BookInstance, Author, Genre } = require('../models'); // Импортируем модели
const { body, validationResult } = require('express-validator');
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
  // Получаем все авторов и жанры из базы данных с использованием Sequelize
  const allAuthors = await Author.findAll({ order: [['family_name', 'ASC']] });
  const allGenres = await Genre.findAll({ order: [['name', 'ASC']] });

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres,
  });
});

exports.book_create_post = [
  // Преобразование жанра в массив
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Валидация и санитизация полей
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  // Обработка запроса после валидации
  asyncHandler(async (req, res, next) => {
    // Извлекаем ошибки валидации
    const errors = validationResult(req);

    // Создаем объект Book с экранированными и обрезанными данными
    const book = {
      title: req.body.title,
      authorId: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genreIds: req.body.genre, // Используем genreIds для связи с жанрами
    };

    if (!errors.isEmpty()) {
      // Если есть ошибки, снова выводим форму с ошибками
      const allAuthors = await Author.findAll({ order: [['family_name', 'ASC']] });
      const allGenres = await Genre.findAll({ order: [['name', 'ASC']] });

      // Отмечаем выбранные жанры
      for (const genre of allGenres) {
        genre.checked = book.genreIds.includes(genre.id) ? "true" : "false";
      }

      return res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Если данных нет ошибок, сохраняем книгу
      const newBook = await Book.create(book);

      // Создаем связи с жанрами (многие ко многим)
      await newBook.setGenres(book.genreIds);

      res.redirect(newBook.url);
    }
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
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

  res.render("book_delete.html", {
    title: "Delete Book",
    book: book,
    book_instances: bookInstances
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  // Author has no books. Delete the author and redirect to the list of authors.
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

  if (bookInstances.length > 0) {
    // Author has books. Render in the same way as for GET route.
    res.render("book_delete.html", {
      title: "Delete Book",
      book: book,
      book_instances: bookInstances
    });
    return;
  }

  await Book.destroy({ where: { id: req.body.bookid } });
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  // Получаем книгу по ID, включая связанные модели Author и Genre
  const book = await Book.findByPk(req.params.id, {
    include: [
      { model: Author, as: "author" },
      { model: Genre, as: "genres" },
    ],
  });

  if (!book) {
    // Если книга не найдена, перенаправляем на список книг
    return res.redirect("/catalog/books");
  }

  // Получаем все авторы и жанры для заполнения форм
  const [allAuthors, allGenres] = await Promise.all([
    Author.findAll({ order: [["family_name", "ASC"]] }),
    Genre.findAll({ order: [["name", "ASC"]] }),
  ]);

  // Преобразуем книгу в простой объект
  const bookData = book.get({ plain: true });

  // Получаем массив жанров ID для отметки выбранных жанров
  const bookGenres = bookData.genres.map((genre) => genre.id);

  // Обновляем жанры, чтобы отметить выбранные
  allGenres.forEach((genre) => {
    if (bookGenres.includes(genre.id)) {
      genre.checked = "true";
    }
  });

  res.render("book_form.html", {
    title: "Update Book",
    authors: allAuthors,
    genres: allGenres,
    book: bookData,
  });
});

// Handle book update on POST.
exports.book_update_post = [
  // Конвертируем жанры в массив
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Валидация и санитизация полей
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  // Обработка запроса после валидации и санитизации
  asyncHandler(async (req, res, next) => {
    // Извлекаем ошибки валидации из запроса
    const errors = validationResult(req);

    // Создаем объект книги с экранированными и обрезанными данными
    const bookData = {
      title: req.body.title,
      authorId: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      id: req.params.id, // Необходимо для обновления существующей записи
    };

    if (!errors.isEmpty()) {
      // Есть ошибки. Повторно отображаем форму с экранированными значениями и сообщениями об ошибках

      // Получаем все авторы и жанры для формы
      const [allAuthors, allGenres] = await Promise.all([
        Author.findAll({ order: [["family_name", "ASC"]] }),
        Genre.findAll({ order: [["name", "ASC"]] }),
      ]);

      // Отмечаем выбранные жанры
      allGenres.forEach((genre) => {
        if (bookData.genre.includes(genre.id.toString())) {
          genre.checked = "true";
        }
      });

      res.render("book_form.html", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: bookData,
        errors: errors.array(),
      });
      return;
    }

    // Данные формы валидны. Обновляем запись в базе данных.
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      // Если книга не найдена, создаём ошибку
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    // Обновляем поля книги
    book.title = bookData.title;
    book.authorId = bookData.authorId;
    book.summary = bookData.summary;
    book.isbn = bookData.isbn;
    // Предположим, что после обработки у вас есть bookData.genre
    bookData.genre = bookData.genre
    .filter(g => g && g.trim() !== '') // убираем null и пустые строки
    .map(g => parseInt(g, 10)) // преобразуем строки в числа

    // Проверяем, что после фильтрации и преобразования не осталось некорректных значений
    console.log('Cleaned genres:', bookData.genre);
    // Обновляем связи с жанрами
    const currentGenres = await book.getGenres();
    if (currentGenres.length > 0) {
      await book.removeGenres(currentGenres);
    }
    await book.setGenres(bookData.genre);

    // Сохраняем изменения
    await book.save();

    // Перенаправляем на страницу с деталями книги
    res.redirect(`${book.url}`);
  }),
];
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var nunjucks = require('nunjucks');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

// Настройка Nunjucks
nunjucks.configure('views', { // Указываем директорию с шаблонами
    autoescape: true,
    express: app,
    watch: true, // Автоматическая перезагрузка при изменении шаблонов
    noCache: true // Отключение кэширования для разработки
});
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views')); // Используем абсолютный путь

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Настройка Sass Middleware
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public', 'styles'), // Путь к исходным SCSS файлам
    dest: path.join(__dirname, 'public', 'styles'), // Путь к скомпилированным CSS файлам
    indentedSyntax: false, // true = .sass и false = .scss
    sourceMap: true,
    outputStyle: 'compressed', // 'compressed' для сжатого CSS или 'expanded' для читаемого
    prefix: '/styles' // URL-префикс для доступа к CSS
  })
);

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
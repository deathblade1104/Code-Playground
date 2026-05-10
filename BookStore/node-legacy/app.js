const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Book = require('./api/models/book')

var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', (socket) => {
    var curr = socket.id
    console.log('Made socket connection', curr)
    socket.on('chat', (data) => {
        console.log(data.message);
    });
})

let Books = [];
cron.schedule("*/15 * * * * * ", async () => {
    Books = [];
    Books = await Book.find({ stock: { $lt: 3 }, status: "ACTIVE" })
        .select('title author price stock status');
    io.sockets.emit('chat', {
        message: "Restock these books",
        books: Books
    });
});




//Get Routes
const bookRoutes = require('./api/routes/book');
const orderRoutes = require('./api/routes/order');
const shopRoutes = require('./api/routes/shop');
const userRoutes = require('./api/routes/user');
const { request } = require('express');


mongoose.connect('mongodb+srv://admin:admin@cluster0.xmx1q.mongodb.net/?retryWrites=true&w=majority');
mongoose.Promise = global.Promise;
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

//Save from Post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Handling CORS Errors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (request.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods",
            "PUT,POST,PATCH,DELETE,GET");
        return res.status(200).json({});
    }

    next();
});

//Routes that handle requests
app.use('/books', bookRoutes);
app.use('/order', orderRoutes);
app.use('/shop', shopRoutes);
app.use('/user', userRoutes);
app.get('/', (req, res)=> {
    res.sendFile(__dirname + '/public' + '/index.html');
})
//Route Errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


server.listen(8000, () => {
    console.log(`Server Started at http://localhost:8000`);
});



// module.exports = app;

const express = require('express');
const router = express.Router();
const Book = require('../models/book')
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check_auth')
const checkRole = require('../middleware/check_role');
const { response, request } = require('express');
const constants = require('../config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: constants.book_image_filesize
  },
  fileFilter: fileFilter
});

router.get('/', checkAuth, async (req, res, next) => {
  try {
    const page = req.query.page || constants.book_page_default
    const limitValue = req.query.limit || constants.book_limitValue_default;
    let sortfilter = '';

    if (req.query.sort && (req.query.sort === '-price' || req.query.sort === 'price' || req.query.sort === 'author')) {
      sortfilter = req.query.sort;
    }

    const Books = await Book.find()
      .select('title author price image stock _id')
      .sort(sortfilter)
      .skip(limitValue * (page - 1))
      .limit(limitValue);

    res.status(200).send(Books);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  };
});

router.post("/", upload.single('image'), checkAuth, checkRole, (req, res, next) => {
  //extracting information from request body
  const checkUniques = Book.find({})
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    image: req.file.path,
    status: req.body.status,
    price: req.body.price,
    stock: req.body.stock
  });

  //saving or checking for errors

  book
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Book Added Successfully in Inventory',
        Book: {
          _id : result._id,
          title: result.title,
          author: result.author,
          price: `Rs. ${result.price}`,
          stock: result.stock,
          image: result.image,
          status: result.status,
        }
      });
    })
    .catch(err => { console.log(err) });
});

router.get('/:bookID', checkAuth, (req, res, next) => {
  const id = req.params.bookID;
  Book.findById(id)
    .select('title price author stock image createdAt')
    .exec()
    .then(result => {
      res.status(200).json({
        book: result
      });
    })
    .catch(err => {
      res.status(404).json({
        message: 'Book Not Found',
        error: err
      })
    });
});

router.patch('/:bookID', checkAuth, checkRole, (req, res, next) => {
  const id = req.params.bookID;
  Book.findByIdAndUpdate({ _id: id }, { $set: req.body }, {new: true}, (err, book) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    console.log(book);
    return res.status(200).json({
      message: "Book updated Successfully",
      Book: book
    });
  })
});

router.delete('/:bookID', checkAuth, checkRole, (req, res, next) => {
  const id = req.params.bookID;
  Book.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Book deleted successfully",
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Book not Found", error: err });
    });
});


module.exports = router;
const express = require('express');
const router = express.Router();
const ShoppingBag = require('../models/shoppingBag');
const Book = require('../models/book');
const checkAuth = require('../middleware/check_auth')
const jwt = require('jsonwebtoken');

router.patch('/add', checkAuth, (req, res, next) => {
  const token =   req.headers.authorization;
  const decoded = jwt.verify(token, "secret");
  let found = false;
  ShoppingBag.findOne({ user_id: decoded.userId, status: "OPEN" })
    .exec()
    .then(async bag => {
      bag.books.forEach((book, idx) => {
        console.log(book.bookId);
        if (book.bookId.toString() === req.body.book_id) {
          console.log("Book already exists in Cart", book);
          found = true;
          Book.findOne({ _id: req.body.book_id })
            .exec()
            .then((book2) => {
              if (book2.stock >= req.body.quantity + book.quantity) {
                console.log("Stock for : " + book2.title + " is ==> " + book2.stock);
                const newBook = {
                  bookId: req.body.book_id,
                  quantity: book.quantity + req.body.quantity
                }
                console.log("Creating updated book: " + book.quantity + " " + req.body.quantity);
                bag.books[idx] = newBook;
                bag.total += (book2.price * req.body.quantity);
                bag.save();
                res.status(200).json({
                  message: "Bag Updated successfully",
                  ShoppingBag: bag,
                })
              }
              else {
                res.status(400).json({ message: "Stock not enough" });
              }
            })
            .catch(err => {
              res.status(500).json({ message: "Wrong BookID" });
            })
        }
      })
      if (!found) {
        console.log('Book not in cart list yet')
        Book.findOne({ _id: req.body.book_id })
          .exec()
          .then((book) => {
            if (book.stock >= req.body.quantity) {
              bag.books.push({
                bookId: req.body.book_id,
                quantity: req.body.quantity
              })

              bag.total += (book.price * req.body.quantity);
              bag.save();
              console.log("Book doesnt exist in bag");
              console.log(book, 'book')
              console.log(bag, 'bag')
              return res.status(201).json({
                message: "Book added in Cart successfully",
                ShoppingBag: bag
              })
            } else {
              res.status(400).json({ message: "Stock not enough" });
            }
          })
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Bag with Matching User Not Found" });
    })
});

router.patch('/remove', checkAuth, (req, res, next) => {
  const token =   req.headers.authorization;
  const decoded = jwt.verify(token, "secret");
  let found = false;
  ShoppingBag.findOne({ user_id: decoded.userId, status: "OPEN" })
    .exec()
    .then(async bag => {
      if(bag.books.length == 0)
      {
        return res.status(404).json({message : "No books found in the bag"});
      }
      bag.books.forEach((book, idx) => {
        console.log(book.bookId);
        if (book.bookId.toString() === req.body.book_id) {
          console.log("Book already exists in Cart", book);
          found = true;
          Book.findOne({ _id: req.body.book_id })
            .exec()
            .then((book2) => {              
              var qty = book.quantity - req.body.quantity;
              if (qty < 0)
              {
                return res.status(406).json({
                  message : "Bag contains lesser books than what is requested to be removed"
                });
              }
              else if (qty > 0) {
                console.log("Updating Quantity => ")
                const newBook = {
                  bookId: req.body.book_id,
                  quantity: qty
                }
                bag.books[idx] = newBook;
              }
              else {
                console.log("Book Completely Removed ")
                bag.books.splice(idx, 1);
              }
              bag.total -= (book2.price * req.body.quantity);
              if(bag.total<0)
              {
                bag.total = 0;
              }
              bag.save();
              res.status(200).json({
                message: "Bag Updated successfully",
                ShoppingBag: bag,
              })
            })
            .catch(err => {
              res.status(500).json({ message: "Wrong BookID" });
            })
        }
      })
      if(!found)
      {
        return res.status(404).json({message : "Book not found in Cart"});
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Matching Bag with User Not Found" });
    })
});
module.exports = router;
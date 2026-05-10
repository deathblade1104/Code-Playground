const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Book = require('../models/book');
const mongoose = require('mongoose');
const ShoppingBag = require('../models/shoppingBag');
const Profile = require('../models/profile');
const checkAuth = require('../middleware/check_auth')
const checkRole = require('../middleware/check_role');
const jwt = require('jsonwebtoken');
const { reset } = require('nodemon');

router.post('/checkout', checkAuth ,(req, res, next) => {
  //extracting information from request body
  if(!req.body.address )
  {
    return res.status(404).json({message : "Please enter address"});
  }
  const token =   req.headers.authorization;
  const decoded = jwt.verify(token, "secret");
  ShoppingBag.findOne({ user_id: decoded.userId, status: "OPEN" })
    .exec()
    .then(async bag => {
      if(bag.books.length == 0)
      {
        return res.status(404).json({ message: "Cart Empty, please add something in cart"});
      }
      for (const book of bag.books) {
        const currentBook = await Book.findById(book.bookId);
        if (currentBook.stock < book.quantity) {
          return res.status(404).json({
            message: `${currentBook.title} stock is less than requested quantity`,
          })
        }
        currentBook.stock = currentBook.stock - book.quantity;
        currentBook.save();
      }
      const order = new Order({
        user_id: decoded.userId,
        address: req.body.address,
        total: bag.total,
        books: bag.books
      });
      
      bag.status = "CLOSED";
      bag.save();
      const newSB = new ShoppingBag({
        user_id: decoded.userId,
      });
      newSB.save();
      return order.save();
    })
    .then(result => {
      console.log(result);

      //adding currentOrder in CustomerProfile 
      Profile.findOne({ user_id: decoded.userId })
        .exec()
        .then(async profile => {
          profile.orders.push(result._id);

          let found = false;
          profile.addresses.forEach((curr_address) => {
            if (curr_address === result.address) {
              found = true;
            }
          })

          if (!found)
            profile.addresses.push(result.address);

          profile.save();

          console.log("Profle Update" + profile);

          res.status(201).json({
            message: "Order Placed Successfully",
            createdOrder:
            {
              _id: result._id,
              total: result.total,
              books: result.books,
              address: result.address,
              payment: result.payment,
              status: result.status,
            }
          });
        })
        .catch(err => {
          res.status(500).json({ message: "Customer Profile not found for user ", error: err });
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Bag not found for user ", error: err });
    });
});

router.get('/', checkAuth,  checkRole,async (req, res, next) => {
  try {
    const orders = await Order.find()
      .select('total books address payment status createdAt updatedAt')

    res.status(200).json({
      count : orders.length,
      orders : orders
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

router.get('/:orderId', checkAuth, async (req, res, next) => {
  const id = req.params.orderId;
  try {
    const order = await Order.findById(id)
      .select('total books address payment status createdAt updatedAt')

    res.status(200).json({
      message: "Order found successfully",
      order: order,
    })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order ID is incorrect", error: err });
  }
});

router.patch('/:orderId', checkAuth, checkRole, (req, res, next) => {
  const id = req.params.orderId;
  Order.findByIdAndUpdate({ _id: id }, { $set: req.body }, {new: true}, (err, order) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({
      message: "Order updated Successfully",
      order: order
    });
  })
});


module.exports = router;
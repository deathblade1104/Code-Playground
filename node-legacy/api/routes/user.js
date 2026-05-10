const express = require('express');
const router = express.Router();
const User = require('../models/user')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const shoppingBag = require('../models/shoppingBag');
const Profile = require('../models/profile');
const constants = require('../config');

router.post('/signup', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(422).json({
          message: 'User already exists'
        })
      }
      else {
        var fieldErrors=[]
        if (!constants.user_password_regex.test(req.body.password)) {
          fieldErrors.push('Password must be at least 8 characters long and alphanumeric')
        }

        if (!constants.user_email_regex.test(req.body.email)) {
          fieldErrors.push('Enter Valid Email ID ')
        }

        if (!constants.user_phone_regex.test(req.body.phone)) {
          fieldErrors.push('Enter valid Phone Number of 10 Digits and not starting with zero')
        }

        if(fieldErrors.length>0)
        {
          return res.status(422).json({
            message : "Invalid Data in Fields",
            errors : fieldErrors
          });
        }

        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          else {
            const user = new User({
              name: req.body.name,
              phone: req.body.phone,
              email: req.body.email,
              status: req.body.status,
              userType: req.body.userType,
              password: hash
            });

            user.save()
              .then((result) => {
                console.log(result);                
                if (result.userType === "CUSTOMER") {
                  const customerProfile = new Profile({
                    user_id: result._id
                  })
                  customerProfile.save();
                  const newSB = new shoppingBag({
                    user_id: result._id
                  });
                  newSB.save();
                  res.status(200).json({
                    user_message: 'CUSTOMER User has been created',
                    user_id: result._id,
                    profile_message: 'Profile has been created',
                    profile_id: customerProfile._id
                  });
                }
                else {
                  res.status(200).json({
                    message: 'ADMIN User has been created',
                    user_id: result._id
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
              })
          }
        });
      }
    })
});

router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({ message: 'Invalid emailId' });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: 'Wrong Password for this Email' });
        }
        if (result) {
          const token = jwt.sign({
            email: user[0].email,
            userId: user[0]._id
          },
            "secret",
            {
              expiresIn: "1h"
            });
          return res.status(200).json({
            message: 'Auth Sucessful',
            token: token
          });
        }
        return res.status(401).json({ message: 'Wrong Password for this Email' });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
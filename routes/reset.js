const express = require('express');
const router = express.Router();
var crypto = require('crypto');
const path = require('path');
const User = require('../models/User');
var async = require('async');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const accountSid = 'AC720dd0cea060426d8902c66068d5fe47';
const authToken = '2ebe506e4a218bedc537e4e1e07006a0';
var client = require('twilio')(accountSid,authToken);

let token;
router.get('/:token', function(req, res) {
    let errors = [];
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      token = req.params.token;
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        res.redirect('/forgot');
      }
      else{
      res.render('reset', {
        user: req.user
      });
    }
    });
  });

  router.post('/', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            res.redirect('login');
          }
          else if(req.body.password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters');
            res.redirect('login');
          }
          else if(req.body.password != req.body.password2){
            req.flash('error', 'Password Doesnt match');
            res.redirect('login');
          }
          else{
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          var password = req.body.password;
          bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              user.password = hash;
              user.save().then( (user,done) => {
                req.flash('success_msg', 'Successfully Updated');
                console.log('Sucess');
                    var smtpTransport = nodemailer.createTransport({
                      service: 'gmail',
                      host: 'smtp.gmail.com',
                      auth: {
                        user: 'teamblockbusterinc@gmail.com',
                        pass: 'evoting123'
                      }
                    });
                    var mailOptions = {
                      to: user.email,
                      from: 'Team Blockbusters <teamblockbusterinc@gmail.com>',
                      subject: 'Your De-mocracy Account password has been changed',
                      text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\nTeam Blockbusters\n'
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                      // client.messages.create({
                      //   from: 'whatsapp:+14155238886',
                      //   to: 'whatsapp:+91'+user.pno,
                      //   body: 'Dear Voter,\nYour Password has been updated successfully.\n\nTeam Blockbusters'
                      // }).then(message => console.log(message.sid));
                        req.flash('success_msg', 'Success! Your password has been changed.');
                      done(err);
                    });
                res.redirect('/login');
              }).catch(err => console.log(err));
            });
          });
          }
        });
      },

    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });




module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
var Web3 = require("web3");
const flash = require('connect-flash');
const Email = require('./models/Email');
var helmet = require('helmet');
const truffleConfig = require('./truffle-config.js');


coinbase = '0x87BE41c278BD2489691c66Cf149A42d627592190';


const app = express();
app.use(helmet());
app.set('view engine','ejs');

// web3.eth.getCoinbase(function (err, account) {
// 	if(err === null) {
//     coinbase = account;
//     console.log(`up ${coinbase}`);
// 	}
// });

contractAddress = "0xc873B4f847d53877fDC0e49bB8697F21bC84eCd9";
smartContractHash = 'https://ropsten.etherscan.io/tx/0xb92e3efc179f72b702332486ab7cd9f8eaf879e36643ec1d442e412645eeb5cf'
const contractAbi = require('./contracts/contractAbi');

Provider = truffleConfig.networks.rinkeby.provider()
web3 = new Web3(Provider);

Election = new web3.eth.Contract(
  contractAbi, contractAddress
);

//To deploy contract when the code start to execute everytime
// Election = new web3.eth.Contract(
//   contractAbi,
// )
//   .deploy({data: `BYTE CODE`})
//   .send({ from: coinbase});


// Passport Config
require('./config/passport')(passport);


// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true,
      useUnifiedTopology: true }
  )
  .then(() => {
    console.log('MongoDB Connected');
    //Email.deleteMany({}, () => console.log('Verification table cleared'));
  })
  .catch(err => console.log(err));





// Express body parser
app.use(express.urlencoded({ extended: true }));


// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// For static front end
app.use(express.static('front-end'));

// Routes

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/result', require('./routes/result'));
app.use('/logout', require('./routes/logout'));
app.use('/verification', require('./routes/verification'));





module.exports = app;



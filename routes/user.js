const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userControllers');
const verifyToken = require('../middleware/jwt_Verify');


// create new user
router.post('/register',UserController.registerUser );

// login user
router.post('/login', UserController.login );

//  user all transactions
router.get('/all_transactions', verifyToken  ,UserController.getAllTransactions );

//create transaction
router.post('/create_transaction',verifyToken, UserController.createTransaction );

//money request
router.post('/money_request',verifyToken, UserController.createMoneyRequest );

//money request accepted
router.post('/accept_request/:id',verifyToken, UserController.acceptMoneyRequest );

//money request declined
router.post('/decline_request/:id',verifyToken, UserController.rejectMoneyRequest );

module.exports = router;
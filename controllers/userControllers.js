const User =  require("../models/user");
const Transaction = require('../models/transaction');
const MoneyRequest = require('../models/moneyRequest');
const jwt =  require("jsonwebtoken");
const { type } = require("os");

// Register user
module.exports.registerUser =  async (req, res, next) => {
  try {
    let walletBalance = 1000 ;
    const { name, email, password ,isPremium } = req.body;
    if(!name || !email || !password || !isPremium){
      return res.status(409).json({ message: 'User data error' });
    }
    if(isPremium =='true'){
      walletBalance = 2500 ;
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    // Create user
    const user = new User({
      name: name,
      email: email,
      password: password,
      isPremium: isPremium,
      balance:walletBalance,
      role:'regular'
    });
    await user.save();
    return res.status(201).json({
      message: 'User registered',
    });
  } catch (error) {
    next(error);
  }
}
// Login User
 module.exports.login = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({ email: email });
        if(!user) return res.status(404).json({
                message: 'User not found'
            });
        if(user.password != password) return res.status(403).json({
                message: 'Invalid Password or Email'
            });
        const token = jwt.sign({id: user._id}, "secretkey");
        return res
        .cookie("token", token, {
            httpOnly: true,
        })
        .status(200)
        .json({ msg: "logIn sucessfully" ,details: { ...user._doc, password: 'undefine' } });
    } catch (error) {
        next(error);
    }
};
// user create transaction
module.exports.createTransaction = async (req, res,next) => {
  try {
    const { receiver, amount } = req.body;
    const transactionType = "send" ;
    const user = await User.findByIdAndUpdate({ _id: req.user.id });
    const admin = await User.findOneAndUpdate({ role: 'admin' });
    console.log("userrr",user)
    console.log('asdminn',admin)

    const receiverUser = await User.findOne({ email: receiver });
    // Check if the transaction is valid
    if (!receiver || !amount ) {
      return res.status(400).json({
        message: 'Invalid transaction data',
      });
    }
    // Check if receiver is super user
    if (receiverUser.role === "admin") {
      return res.status(400).json({
        message: 'Super user cannot receive money',
      });
    }
    // Check if user has enough balance to transfer
    let transactionCharges =  5 / 100;
    if (user.isPremium) {
      transactionCharges =  3 / 100;
    }
    console.log("transactionchrge",transactionCharges)
    if (user.balance < (Number(amount) + Number(transactionCharges))) {
      return res.status(404).json({
        message: 'Insufficient balance to transfer',
      });
    }
    // Create the transaction
    const transaction = await Transaction.create({
      sender: user._id,
      receiver:receiverUser._id,
      amount,
      transactionType,
      transactionCharges,
    });
    let totalamount =  Number(transactionCharges) + Number(amount) ;
    // Deduct amount from user balance
    user.balance = Number(user.balance) - Number(totalamount);
    user.transactions.push(transaction._id);
    await user.save();
    // Add transaction to receiver's transactions array
    console.log("reciver balance",typeof(receiverUser.balance) )
    receiverUser.balance = Number(receiverUser.balance) + Number(amount) ;
    receiverUser.transactions.push(transaction._id);
    await receiverUser.save();
    admin.balance = Number(admin.balance) + Number(transactionCharges)
    await admin.save(); 
    return res.json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    next(error)
  }
};
//users all transactions
module.exports.getAllTransactions = async (req,res)=>{
  try {
const transactions = await Transaction.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] });
      console.log("transactions",transactions);
      return res.json({
          message:"all transactions request succesfull",
          allTransactions:transactions
      });
  } catch (error) {
      next(error);
  }
}




// Create a money request
exports.createMoneyRequest = async (req, res,next) => {
  try {
    const { receiver, amount } = req.body;
    const user = await User.findById(req.user.id);
    const receiverUser = await User.findOne({ email: receiver });
    // Check if the request is valid
    if (!receiver || !amount) {
      return res.status(400).json({
        message: 'Invalid money request data',
      });
    }

    // Check if receiver is super user
    if (receiverUser.role === 'admin') {
      return res.status(400).json({
        message: 'Super user cannot receive money requests',
      });
    }
    let transactionCharges = 3 / 100 ;
    if(user.isPremium){
      transactionCharges = 1 / 100
    }

    // Create the money request
    const moneyRequest = await MoneyRequest.create({
      requester: user._id,
      receiver: receiverUser._id,
      amount,
      charges:transactionCharges
    });

    // Add money request to receiver's requests array
    receiverUser.moneyRequests.push(moneyRequest._id);
    await receiverUser.save();

    return res.json({
      message: 'Money request created successfully',
      moneyRequest,
    });
  } catch (error) {
    next(error)
  }
};

// Accept a money request
exports.acceptMoneyRequest = async (req, res,next) => {
  try {
    const  requestId  = req.params.id;
    console.log('requuere id++',req.params.id)
    const user = await User.findById(req.user.id);
    console.log('user',user)
    const moneyRequest = await MoneyRequest.findById(requestId);
    console.log('money request',moneyRequest);
    const requester = await User.findById(moneyRequest.requester);

    // Check if the request exists
    if (!moneyRequest) {
      return res.status(404).json({
        message: 'Money request not found',
      });
    }

    // Check if the user is the receiver of the request
    if (!user._id.equals(moneyRequest.receiver)) {
      return res.status(403).json({
        message: 'You are not authorized to accept this money request',
      });
    }

    // Check if receiver has enough balance to transfer
    let senderTransactionCharge =5 / 100 ;
    if(user.isPremium){
      senderTransactionCharge = 3 / 100 ;
    }

    const totalAmount = Number(moneyRequest.amount) + Number(senderTransactionCharge);
    if (user.balance < totalAmount) {
      return res.status(404).json({
        message: 'Insufficient balance to transfer',
      });
    }

    // Deduct amount from receiver's balance
    user.balance = Number(user.balance) - Number(totalAmount);
    await user.save();

    // Add amount to requester's balance
    let requestorTransactionCharge = 3 / 100 ;
    if(requester.isPremium){
      requestorTransactionCharge = 1 / 100 ;
    }
    requester.balance = Number(requester.balance) + Number(moneyRequest.amount) - Number(requestorTransactionCharge) ;
    await requester.save();

    // Credit transaction charges to super user's wallet
    const superUser = await User.findOne({ role: 'admin' });
    superUser.balance = Number(superUser.balance) + Number(requestorTransactionCharge) + Number(senderTransactionCharge);
    await superUser.save();

    // Update money request status
    moneyRequest.status = 'accepted';
    await moneyRequest.save();

    return res.json({
      message: 'Money request accepted successfully',
      moneyRequest,
    });
  } catch (error) {
    next(error)
  }
};

//reject money request
module.exports.rejectMoneyRequest = async (req, res,next) => {
  try {

    const  requestId  = req.params.id;
    console.log('req-iss',req.params.id)
    const moneyRequest = await MoneyRequest.findById(requestId);

    if (!moneyRequest) {
      return res.status(404).json({
        message: 'Money request not found',
      });
    }
    if (moneyRequest.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'You are not authorized to reject this money request',
      });
    }

    moneyRequest.status = 'declined';
    await moneyRequest.save();

    const requesterUser = await User.findById(moneyRequest.requester);
    requesterUser.moneyRequests.pull(moneyRequest._id);
    await requesterUser.save();

    return res.json({
      message: 'Money request rejected successfully',
      moneyRequest,
    });
  } catch (error) {
    next(error)
  }
};

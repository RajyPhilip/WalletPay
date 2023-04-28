// mongodb+srv://rajyphilip:<password>@cluster0.ldttbqk.mongodb.net/?retryWrites=true&w=majority
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(`mongodb+srv://rajyphilip:qwerty1234@cluster1.eqqbwmb.mongodb.net/fotoley?retryWrites=true&w=majority`);

const db = mongoose.connection ;

db.on('error',console.error.bind(console,"ERROR CONNECTING TO DATABASE"));
db.once('open', function(){
    console.log("Successfully connected to database:: MongoDB");
});

module.exports=db ; 
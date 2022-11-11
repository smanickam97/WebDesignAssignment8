var mongoose = require('mongoose');
// define our sample model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Sample', {
    fullname : {type : String, default: ''},
    email : {type : String, default: ''},
    password : {type : String, default: ''}
});
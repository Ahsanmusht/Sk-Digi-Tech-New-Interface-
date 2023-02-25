const mongoose  = require('mongoose');

const UserSchema = new mongoose.Schema({
   name:{
        type:String,
        required:[true,"Please Enter User Name...!!!"]
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Please Enter Email...!!!"]
    },
    mobile:{
        type:String,
        required:[true,"Please Enter Mobile Number...!!!"]
    },
      image:{
        type:String
    },
    password:{
        type:String,
        required:[true, "Please Enter Password...!!!"]
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }

},{timestamps:true});

const UserModel = new mongoose.model('User', UserSchema);


module.exports = UserModel;
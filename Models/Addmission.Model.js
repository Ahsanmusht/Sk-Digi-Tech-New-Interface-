const mongoose = require('mongoose');

const AddmissionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    fathername:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    is_confirm:{
        type:Number,
        default:0
    }
},{timestamps:true});

const AddmissionModel = new mongoose.model('Admission', AddmissionSchema);

module.exports = AddmissionModel;
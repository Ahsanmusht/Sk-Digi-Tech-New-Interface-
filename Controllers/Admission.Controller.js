const AddmissionModel = require('../Models/Addmission.Model');
const nodeMailer = require('nodemailer');
const Config = require('../Config/Config');

const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');


// SENDING MAIL...!!!

const SendEmail = async(name, email, user_id)=> {
    try {
        
       const Transporter =  nodeMailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            service:"gmail",
            auth:{
                user:Config.DEVELOPER_SECRET_EMAIL,
                pass:Config.DEVELOPER_SECRET_PASSWORD
            }
        });

        const mailOptions = {
            from:Config.DEVELOPER_SECRET_EMAIL,
            to:email,
            subject:'Addmission Confirm Mail',
            html:"<p>Hello"  +name+', Your Addmission is Confirmed, Go and Check Now!</p>'
        }
        Transporter.sendMail(mailOptions, function(err, info){
            if(err){
                console.log(err);
            }else{
                console.log('Email Sent To:-', info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
};



const ShowAddmission = async(req, res, next) => {
    try {
       
        res.render('Addmission');
           

    } catch (error) {
        console.log(error.message);
    }
};

const AddmissionUser = async(req, res, next) => {
    try {

        const { name, fathername, email, gender, address } = req.body;

        const addmission = await AddmissionModel({
            name,
            fathername,
            email,
            gender,
            image:req.file.filename,
            address,
            is_addmission_confirm:0
        });

        const user = await addmission.save();

    } catch (error) {
        console.log(error.message);
    }
}

const getAllStudents = async(req, res, next)=> {
    try {
        
        var search = '';
        if(req.query.search){
            search = req.query.search;
        }
  
        var page = 1;
        if(req.query.page){
            page = req.query.page;
        };

        const limit = 5;
  

        const user = await AddmissionModel.find({
           
            $or:[
                { name : { $regex : '.*'+search+'.*', $options:'i' } },
                { fathername : { $regex : '.*'+search+'.*', $options:'i' } },
                { email : { $regex : '.*'+search+'.*', $options:'i' } },
                { gender : { $regex : '.*'+search+'.*', $options:'i' } }
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await AddmissionModel.find({
         
            $or:[
                { name : { $regex : '.*'+search+'.*', $options:'i' } },
                { fathername : { $regex : '.*'+search+'.*', $options:'i' } },
                { email : { $regex : '.*'+search+'.*', $options:'i' } },
                { gender : { $regex : '.*'+search+'.*', $options:'i' } }
               
            ]
        }).countDocuments()


        res.render("AddmissionDashboard", {
            Users : user,
            totalPages : Math.ceil(count/limit),
            currentPage : page
        });


    } catch (error) {
        console.log(error.message);
    }
};

const ShowAddmissionEdit = async(req, res, next) => {
    try {
      
        const id = req.query.id;

        const user = await AddmissionModel.findById({_id:id});

        if(user){

            res.render('EditAddmission',{User:user});
            
        }else{
            res.redirect('/all-students')
        }

    } catch (error) {
        console.log(error.message);
    }
};

const EditAddmission = async(req, res, next) => {
    try {
        
        const user = await AddmissionModel.findByIdAndUpdate({_id:req.query.id},{$set:{name:req.body.name,fathername:req.body.fathername,cnic:req.body.cnic,gender:req.body.gender,address:req.body.address,is_confirm:req.body.Verify}});

        await user.save();
        // if(user){
            if(user.is_confirm == 1){
                res.redirect('/all-students');  
                SendEmail(req.body.name, req.body.email, user._id)
            }
        else{
            res.redirect('/all-students')
        }

    } catch (error) {
        console.log(error.message);
    }
};

const DeleteAddmission = async(req, res, next) => {
    try {
        
      const id = req.query.id;

      await AddmissionModel.deleteOne({_id:id})

      res.redirect('/all-students')

    } catch (error) {
        console.log(error.message);
    }
};

const PostAssingment = async(req, res, next) => {
    try {
        
        res.render('PostAssingment')

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    ShowAddmission,
    AddmissionUser,
    getAllStudents,
    ShowAddmissionEdit,
    EditAddmission,
    DeleteAddmission,
    PostAssingment,
}
const UserModel = require('../Models/User.Model');
const bcrypt = require('bcrypt');
const RandomString = require('randomstring');
const Config = require('../Config/Config');
const nodemailer = require('nodemailer');
const ExcelJs = require('exceljs');

// CONVERTING EJS TO PDF REQUIRE THINGS

const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { response } = require('../Routes/Admin.Route');


const SecurePassword = async(password)=>{
    try {
    
        const HashedPassword = await bcrypt.hash(password, 15);

        return HashedPassword;

    } catch (error) {
        console.log(error.message);
    }
};



const ForgotSendEmail = async(name, email, token)=> {
    try {
        
       const Transporter =  nodemailer.createTransport({
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
            subject:'Forgot Password Mail!',
            html:"<p>Hello" +name+' Click Here to <a href="http://localhost:5000/admin/forgot-password?token='+token+'"> Reset </a> Your Password.</p>'
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

const ShowAdminLogin = async(req, res, next) => {
    try {
        
        res.render('Login')

    } catch (error) {
        console.log(error.message);
    }      
};

const ShowAdmin = async(req, res, next) => {
    try {
      
        res.redirect('/admin')

    } catch (error) {
        console.log(error.message);
    }
}

const LoginAdmin = async(req, res, next) => {

    try {
        
        const {email, password} = req.body;

        const admin = await UserModel.findOne({email});

        if(admin){

            const ComparedPassword = await bcrypt.compare(password, admin.password);
            if(ComparedPassword){

                if(admin.is_admin === 0){
                    
                    res.render('Login', {message:'Email or Password is Incorrect !'});
                }else{
                    req.session.user_id = admin._id;

                    res.redirect('/admin/profile')
                }

            }else{

                res.render('Login', {message:'Email or Password is Incorrect !'});
            }

        }else{
            res.render('Login', {message:'Email or Password is Incorrect !'});
        }

    } catch (error) {
        console.log(error.message);
    }

}

const ShowAdminHome = async(req, res, next) => {
    try {
        
        const user = await UserModel.findById({_id:req.session.user_id})

        res.render('Profile',{admin:user})

    } catch (error) {
        console.log(error.message);
    }
};

const ShowAdminDashboard = async(req, res, next) => {
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
      

            const user = await UserModel.find({
                is_admin:0,
                $or:[
                    { name : { $regex : '.*'+search+'.*', $options:'i' } },
                    { email : { $regex : '.*'+search+'.*', $options:'i' } },
                    { mobile : { $regex : '.*'+search+'.*', $options:'i' } }
                ]
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            const count = await UserModel.find({
                is_admin:0,
                $or:[
                    { name : { $regex : '.*'+search+'.*', $options:'i' } },
                    { email : { $regex : '.*'+search+'.*', $options:'i' } },
                    { mobile : { $regex : '.*'+search+'.*', $options:'i' } }
                ]
            }).countDocuments()


            res.render("Dashboard", {
                Users : user,
                totalPages : Math.ceil(count/limit),
                currentPage : page
            });

    } catch (error) { 
        console.log(error.message);
    }
}

const LogoutAdmin = async(req, res, next) => {
    try {
        
        req.session.destroy();
        res.redirect('/admin')

    } catch (error) {
        console.log(error.message);
    }
};

const ShowAdminForgot = async(req, res, next) => {
    try {
        
        res.render('ForgotAdmin')

    } catch (error) {
        console.log(error.message);
    }
};

const ForgotAdminPassword = async(req, res, next) => {
    try {
        
        const email = req.body.email;

        const user = await UserModel.findOne({email});

        if(user){

                if(user.is_admin === 0){

                    res.render('ForgotAdmin', {message:'Email Is Invalid !'});
                }else{
                    const Token = RandomString.generate();
                    const UpdatedData = await UserModel.updateOne({email}, {$set:{token:Token}});
                    ForgotSendEmail(user.name, user.email, Token);
                    res.render('ForgotAdmin', {message:'Please Check Your Mail!'});
                }

            
        }else{
            res.render('ForgotAdmin', {message:'Email Is Invalid !'});
        }


    } catch (error) {
        console.log(error.message);
    }
};

const ShowForgotPassword = async(req, res, next) => {
    try {
        
        const Token = req.query.token;

        const tokenData = await UserModel.findOne({token:Token});

        if(tokenData){
            res.render('ForgotPassword',{user_id:tokenData._id});
        }else{
            res.render('404', {message:'Invalid Link !'});
        }   

    } catch (error) {
        console.log(error.message);
    }
};

const ResetPassword = async(req, res, next) => {
    try {
       
        const password = req.body.password;
        const user_id = req.body.user_id;

        const HashedPassword = SecurePassword(password);

        const user = await UserModel.findByIdAndUpdate(
           { _id:user_id },
           {$set:{password:HashedPassword, token: ''}}
        );

        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
};

const ShowAdminEdit = async(req, res, next) => {
    try {

        const id = req.query.id;

        const user = await UserModel.findById({_id:id});

        if(user){

            res.render('Edit-User',{User:user});
            
        }else{
            res.redirect('/admin/dashboard')
        }


    } catch (error) {
        console.log(error.message);
    }
};

const AdminEditUser = async(req, res, next) => {
    try {
        
        const user = await UserModel.findByIdAndUpdate({_id:req.query.id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile, is_verified:req.body.Verify}});

            res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.log(error.message);
    }
};

const AdminDeleteUser = async(req, res, next) => {
    try {
        
      const id = req.query.id;

      await UserModel.deleteOne({_id:id})

      res.redirect('/admin/dashboard')

    } catch (error) {
        console.log(error.message);
    }
};

// ################## EXPORT USER DATA INTO ( EXCEL )

const ExportUsers = async(req, res, next) => {
    try {
        
       const workbook = new ExcelJs.Workbook();

      const worksheet =  workbook.addWorksheet('My Users');

      worksheet.columns = [
        {
            header:'S.no.',
            key:'s_no'
        },
        {
            header:'Image',
            key:'image'
        },
        {
            header:'Name',
            key:'name'
        },
        {
            header:'Email',
            key:'email'
        },
        {
            header:'Mobile',
            key:'mobile'
        },
        {
            header:'Is Admin',
            key:'is_admin'
        },
        {
            header:'Is Verified',
            key:'is_verified'
        }
      ];

      let counter = 1;

      const userData = await UserModel.find({is_admin: 0});

      userData.forEach((user)=> {
        user.s_no = counter;

        worksheet.addRow(user)

        counter++;
      });

      worksheet.getRow(1).eachCell((Cell) => {
        Cell.font = {bold:true}
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=users.xlsx`
      );

      return workbook.xlsx.write(res).then(() => {
        res.status(200)
      })

    } catch (error) {
        console.log(error.message);
    }
};

// ################## EXPORT USER DATA INTO ( PDF )

const ExportUsersPdf = async(req, res, next) => {
    try {
        
            const user = await UserModel.find({is_admin : 0})

            const data = {
                Users:user
            }
           const filePathName = path.resolve(__dirname, '../Views/Admin/HtmlToPdf.ejs')

           const HtmlString = fs.readFileSync(filePathName).toString();

            let option = {
                format:'A3',
                orientation:'portrait',
                border:'10mm'
            }

           const ejsData = ejs.render(HtmlString, data);

           pdf.create(ejsData, option).toFile('All Students.pdf', (err, response) => {

                if(err){
                    console.log(err);
                }

              const filePath = path.resolve(__dirname, '../All Students.pdf')

                fs.readFile(filePath, (err, file) => {
                   if(err){
                    console.log(err);
                    return res.status(500).send('Could Not Download');
                   }

                   res.setHeader(
                    'Content-Type',
                    'application/pdf'
                   )
                   res.setHeader(
                    'Content-Disposition',
                    'attachment;filename="All Students.pdf"'
                   )

                   res.send(file);
                })

           });

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    ShowAdminLogin,
    ShowAdmin,
    LoginAdmin,
    ShowAdminHome,
    LogoutAdmin,
    ShowAdminForgot,
    ForgotAdminPassword,
    ShowForgotPassword,
    ResetPassword,
    ShowAdminDashboard,
    ShowAdminEdit,
    AdminEditUser,
    AdminDeleteUser,
    ExportUsers,
    ExportUsersPdf,
}
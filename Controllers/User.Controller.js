const UserModel = require('../Models/User.Model');
const AddmissionModel = require('../Models/Addmission.Model');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const nodeMailer = require('nodemailer');
const Config = require('../Config/Config');

const SecurePassword = async(password)=>{
    try {
    
        const HashedPassword = await bcrypt.hash(password, 15);

        return HashedPassword;

    } catch (error) {
        console.log(error.message);
    }
};

// ############################### FOR EMAIL VERIFICATION!! ( SENDING EMAIL! )

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
            subject:'Email Verification Mail',
            html:"<p>Hello"  +name+' Click Here to <a href="http://localhost:5000/verify?id='+user_id+'"> Verify </a> Your Email.</p>'
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

// ########################### FOR FORGOT PASSWORD!! ( SENDING EMAIL! )


const ForgotSendEmail = async(name, email, token)=> {
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
            subject:'Forgot Password Mail!',
            html:"<p>Hello"  +name+' Click Here to <a href="http://localhost:5000/reset-password?token='+token+'"> Reset </a> Your Password.</p>'
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
 
const ShowRegister = async(req, res, next)=>{
    try {
        res.render('Register')
    } catch (error) {
        console.log(error.message);
    }
}

const RegisterUser = async(req, res, next)=>{
    try {
        const SPassword = await SecurePassword(req.body.password);
        const user = new UserModel({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:SPassword,
            is_admin:0
        });

        const UserData = await user.save();

        if(UserData){
            SendEmail(req.body.name, req.body.email, UserData._id)
            res.status(200).send({message:"We sent You Verification Mail, Please verify Your Mail to Login !"});
        }else{
            res.status(400).send({message:"Registration Failed!"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const VerifyEmail = async(req, res, next) => {
    try {
     const UpdateInfo = await  UserModel.updateOne({_id:req.query.id},{$set:{is_verified:1}});

        console.log(UpdateInfo);
        res.redirect('/EmailVerified.html')

    } catch (error) {
        console.log(error.message);
    }
}

const ShowLogin = async(req, res, next) => {
    try {
        res.render('Login')
    } catch (error) {
        console.log(error.message);
    }
};

const LoginUser = async(req, res, next) => {
    try {
        
        const {email, password} = req.body;

       const user = await UserModel.findOne({ email });

       if(user){

        const ComparedPassword = await bcrypt.compare(password, user.password);

        if(ComparedPassword){

            if(user.is_verified === 0){
                res.status(401).send({message:'We Send You Verification Mail, Please Check Your Mail & Verify!'})

            }else{
                req.session.user_id = user._id
                res.redirect('/profile.html')
                // res.status(200).send({
                //     message:'success fully login'
                // })
            }

        }else{
            
            res.status(400).send({
                message:'Email or Password is Incorrect'
            })
        }

       }else{
        res.status(400).send({
            message:'Email or Password is Incorrect'
        })
    }

    } catch (error) {
        console.log(error.message);
    }
};

const ShowHome = async(req, res, next) => {
    try {
        const userData = await UserModel.findById({_id : req.session.user_id})
        res.status(200).send({user:userData})
    } catch (error) {
        console.log(error.message);
    }
};

const LogoutUser = async(req, res, next) => {
    try {
      
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
};

const ShowForgot = async(req, res, next) => {
    try {
        res.render('ForgotPassword')
    } catch (error) {
        console.log(error.message);
    }
};

const UserForgotPassword = async(req, res, next)=> {
    try {
        
        const email = req.body.email;
        const user = await UserModel.findOne({email});

        if(user){

            if(user.is_verified === 0){
                res.status(400).send({message:'Verify Your Email Now!'});
            }
            else{
                const Token = randomString.generate(5);

                const UpdatedData = await UserModel.updateOne({email}, {$set:{token:Token}});

                ForgotSendEmail(user.name, user.email, Token);

                res.status(200).send({message:'Check Your Mail to Reset Your Password!'})
            }

        }else{
            res.status(404).send({message:'No User Found With This Email!'})
        }

    } catch (error) {
        console.log(error.message);
    }
};

const ShowForgotPassword = async(req, res, next) => {
    try {
        
        const token = req.query.token;

        const tokenInfo = await UserModel.findOne({token});
 
        if(tokenInfo){
             res.redirect('/Reset-Password.html').send({message:"Token Found SuccessFully!"},{_id : tokenInfo._id})
        }else{
             res.status(404).send({message:'No Token Found!'})
         }

    } catch (error) {
        console.log(error.message);
    }
};

const ResetPassword  = async(req, res, next) => {
    try {
    
        const password = req.body.password;

        const id = req.params.hidden_id;

        const Secure_Password = await SecurePassword(password);

        const user = await UserModel.findByIdAndUpdate({_id:id}, 
            {$set : {password:Secure_Password, token:''}});

            await user.save();
            res.redirect('/Login.html')

    } catch (error) {
        console.log(error.message);
    }
};

const ShowResendEmail = async(req, res, next) => {

    try {
       res.render('resend-verify-mail') 
    } catch (error) {
        console.log(error.message);
    }
};

const ResendEmail = async(req, res, next) => {
    try {
        
        const email = req.body.email;

        const user = await UserModel.findOne({email});

        if(user){

            SendEmail(user.name, user.email, user._id)
            res.render('resend-verify-mail', {message:"Email Has Been Sent Please Check!"})

        }else{
            res.render('resend-verify-mail', {message:"Email Not Exists!"})
        }
            
    } catch (error) {
        console.log(error.message);
    }
};

const ShowEdit  = async(req, res, next) => {
    try {
        
        const id = req.query.id;

        const userData = await UserModel.findById({_id : id});

        if(userData){
            res.render('Edit', {user : userData});
        }else{
            res.redirect('/index')
        }

    } catch (error) {
        console.log(error.message);
    }
};

const EditUserData = async(req, res, next) => {
    try {
        
            const user = await UserModel.findByIdAndUpdate({_id:req.body._id},{$set:{
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
            }})
      

        res.status(200).send({message:"Updated Successfully!"})

     
        }catch (error) {
             console.log(error.message);
    }
}

const ShowHomePage = async(req, res, next) => {
    try {
        const userData = await UserModel.findById({_id : req.query.id});
      
        if(userData){
            res.render('Home', {user : userData});
        }else{
            res.redirect('/index')
        }    
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    ShowRegister,
    RegisterUser,
    VerifyEmail,
    ShowLogin,
    LoginUser,
    ShowHome,
    LogoutUser,
    ShowForgot,
    UserForgotPassword,
    ShowForgotPassword,
    ResetPassword,
    ShowResendEmail,
    ResendEmail,
    ShowEdit,
    EditUserData,
    ShowHomePage
}
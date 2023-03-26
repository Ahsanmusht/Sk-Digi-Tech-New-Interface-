const express = require('express');

const User_Router = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const Config = require('../Config/Config');

const User_Controller = require('../Controllers/User.Controller');
const Authentication = require('../MiddleWare/Authentication');

User_Router.use(session({secret:Config.SessionSecret}));
User_Router.use(bodyParser.json());
User_Router.use(bodyParser.urlencoded({extended:true}));
// User_Router.set('view engine' , 'ejs');
// User_Router.set('views' , './Views/Users');
User_Router.use(express.static('../Frontend/User'))


const storage = multer.diskStorage({
    destination:function(req, file, callback){
        callback(null,path.join(__dirname, '../Frontend/User/Uploads') )
    },
    filename:function(req, file, callback) {
        const name = Date.now()+'-'+file.originalname;

        callback(null, name)

    }
});

const Upload = multer({
    storage:storage
})

// User_Router.get('/register',Authentication.IsLoggedOut, User_Controller.ShowRegister);

User_Router.post('/register',Authentication.IsLoggedOut, Upload.single('image'),User_Controller.RegisterUser);

User_Router.get('/verify',User_Controller.VerifyEmail);

// User_Router.get('/',Authentication.IsLoggedOut,User_Controller.ShowLogin);

// User_Router.get('/login',Authentication.IsLoggedOut,User_Controller.ShowLogin);

User_Router.post('/login',Authentication.IsLoggedOut,User_Controller.LoginUser);

User_Router.get('/profile',Authentication.IsLoggedIn,User_Controller.ShowHome );

User_Router.get('/home',Authentication.IsLoggedIn,User_Controller.ShowHomePage );

User_Router.get('/logout',Authentication.IsLoggedIn,User_Controller.LogoutUser);

// User_Router.get('/forgot',Authentication.IsLoggedOut,User_Controller.ShowForgot);

User_Router.post('/forgot',Authentication.IsLoggedOut,User_Controller.UserForgotPassword);

User_Router.get('/reset-password',Authentication.IsLoggedOut, User_Controller.ShowForgotPassword);

User_Router.post('/reset-password/:id',Authentication.IsLoggedOut,User_Controller.ResetPassword);

User_Router.get('/resend-verify-mail',User_Controller.ShowResendEmail);

User_Router.post('/resend-verify-mail',User_Controller.ResendEmail);

User_Router.get('/edit',Authentication.IsLoggedIn,User_Controller.ShowEdit);

User_Router.post('/edit',User_Controller.EditUserData);


module.exports = User_Router;
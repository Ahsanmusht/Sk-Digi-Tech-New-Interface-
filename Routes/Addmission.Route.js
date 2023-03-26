const express = require('express');

const Addmission_Router = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
// const session = require('express-session');
const Config = require('../Config/Config');

const session = require('express-session');
const flash = require('connect-flash');

Addmission_Router.use(session({
    secret:Config.SessionSecret,
    cookie: { maxAge : '24h' },
    resave : false,
    saveUninitialized : false,
}));

Addmission_Router.use(flash());


const Addmission_Controller = require('../Controllers/Admission.Controller');
const Admin_Auth = require('../MiddleWare/Admin.Authentication');
const Authentication = require('../MiddleWare/Authentication');

Addmission_Router.use(session({secret:Config.SessionSecret}));
Addmission_Router.use(bodyParser.json());
Addmission_Router.use(bodyParser.urlencoded({extended:true}));
// Addmission_Router.set('view engine' , 'ejs');
// Addmission_Router.set('views' , './Views/Users');
Addmission_Router.use(express.static('Public'));



const storage = multer.diskStorage({
    destination:function(req, file, callback){
        callback(null,path.join(__dirname, '../Public/Uploads') )
    },
    filename:function(req, file, callback) {
        const name = Date.now()+'-'+file.originalname;

        callback(null, name)

    }
});

const Upload = multer({
    storage:storage
})


Addmission_Router.get('/addmission', Authentication.IsLoggedIn, Addmission_Controller.ShowAddmission);
Addmission_Router.post('/addmission', Upload.single('image'), Authentication.IsLoggedIn, Addmission_Controller.AddmissionUser);
Addmission_Router.get('/all-students', Admin_Auth.isLogin, Addmission_Controller.getAllStudents);
Addmission_Router.get('/edit-student',Admin_Auth.isLogin, Addmission_Controller.ShowAddmissionEdit);
Addmission_Router.post('/edit-student', Addmission_Controller.EditAddmission);
Addmission_Router.get('/delete-student', Addmission_Controller.DeleteAddmission);
// Addmission_Router.get('/post-assingment', Addmission_Controller.IsStudent,Addmission_Controller.PostAssingment);

module.exports = Addmission_Router;
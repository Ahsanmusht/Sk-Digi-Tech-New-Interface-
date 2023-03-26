const express = require('express');
const Admin_Router = express();
const session = require('express-session');
const Config = require('../Config/Config');
const bodyParser = require('body-parser');
const Admin_Controller = require('../Controllers/Admin.Controller');

Admin_Router.use(session({secret:Config.SessionSecret}))
Admin_Router.use(bodyParser.json());
Admin_Router.use(bodyParser.urlencoded({extended:true}));
Admin_Router.use(express.static('../Frontend/Admin'))
// Admin_Router.set('view engine', 'ejs');
// Admin_Router.set('views', './Views/Admin');


const Admin_Auth = require('../MiddleWare/Admin.Authentication');

Admin_Router.get('/', Admin_Auth.isLogout, Admin_Controller.ShowAdminLogin)

Admin_Router.get('/admin-profile', Admin_Auth.isLogin, Admin_Controller.ShowAdminHome)

Admin_Router.get('/dashboard' ,Admin_Auth.isLogin ,Admin_Controller.ShowAdminDashboard) // auth.islogin lagana hai bad mai

Admin_Router.get('/admin-logout', Admin_Auth.isLogin, Admin_Controller.LogoutAdmin);

Admin_Router.get('/forgot', Admin_Auth.isLogout, Admin_Controller.ShowAdminForgot);

Admin_Router.post('/forgot',Admin_Controller.ForgotAdminPassword);

Admin_Router.get('/forgot-password',Admin_Auth.isLogout, Admin_Controller.ShowForgotPassword);

Admin_Router.post('/forgot-password', Admin_Controller.ResetPassword);

Admin_Router.post('/admin-login', Admin_Controller.LoginAdmin);

Admin_Router.get('/edit-user', Admin_Auth.isLogin, Admin_Controller.ShowAdminEdit)

Admin_Router.post('/edit-user/:id', Admin_Controller.AdminEditUser);

Admin_Router.delete('/delete/:id', Admin_Auth.isLogin, Admin_Controller.AdminDeleteUser)

Admin_Router.get('/export-users', Admin_Auth.isLogin, Admin_Controller.ExportUsers)

Admin_Router.get('/export-users-pdf', Admin_Auth.isLogin, Admin_Controller.ExportUsersPdf)

// STAR US WAQT WORK KARTA HAI JAB KOI ROUTE USAI NAHI MILTA HAI...!!!

Admin_Router.get('*', Admin_Controller.ShowAdmin);

module.exports = Admin_Router;
const express = require('express');
const User_Router = require('./Routes/User.Route');
const Admin_Router = require('./Routes/Admin.Route');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
require('./DataBase/Db.Connection');

app.use('/', User_Router);
app.use('/admin', Admin_Router);
app.use(express.static(path.join(__dirname, 'Public')));





app.listen(PORT, ()=>{
    console.log('Server is Listening on',PORT);
})
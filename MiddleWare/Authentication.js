const AddmissionModel = require('../Models/Addmission.Model');
const UserModel = require('../Models/User.Model');

const IsLoggedIn = async(req, res, next) => {
    try {
        
            if(req.session.user_id){}
            else{
                res.redirect('/')
            }

            next();

    } catch (error) {
        console.log(error.message);
    }
};

const IsLoggedOut = async(req, res, next) => {
    try {
        
        if(req.session.user_id){
            res.redirect('/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    IsLoggedIn,
    IsLoggedOut
}
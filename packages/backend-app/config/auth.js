module.exports = {
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Please login');
        res.redirect('/users/login');
        //res.status(404).json({success:false})
    }
}
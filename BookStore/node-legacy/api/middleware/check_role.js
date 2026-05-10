const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports = async (req,res,next) => {
  try{
    const token =   req.headers.authorization;
    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded.userId);
      if(user.userType === 'ADMIN')
      { 
        next();
      }
      else
      {
        return res.status(401 ).json({
            message : "Permission denied"
        });
      }

  }
  catch(error)
  {
      return res.status(401 ).json({
          message : "Permission denied"
      });
  }
};
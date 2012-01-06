var util = require('util')
  , Mongolian = require("mongolian")
  , server = new Mongolian()
  , db = server.db("test")
  , users = db.collection("users")

exports.auth = function(req, res) {
   var user = { username: req.param("username", null),
                password: req.param("password", null) };
   users.findOne(user, function(err, obj) {
      if (obj) {
         req.session.uid = obj._id;
         req.session.username = obj.username;
         res.json({status:"success"});
      } else {
         res.json({status:"failure"});
      }
   });
};

exports.logout = function(req, res) {
   req.session.destroy();
   res.json({status:"success"});
};

var util = require('util')
  , Mongolian = require("mongolian")
  , server = new Mongolian()
  , db = server.db("test")
  , users = db.collection("users")

exports.files = function(req, res) {
   var username = req.param("username", null);
   var password = req.param("password", null);
   var authErr = { error : "auth error"};
   if (!username || !password) {
      res.json(authErr);
   } else {
      var user = { username : username,
                   password : password };
      users.findOne(user, function(err, obj) {
         if (err) {
            res.json({error:err});
         } else if (!obj) {
            res.json(authErr);
         } else {
            delete obj._id;
            delete obj.username;
            delete obj.password;
            obj.status = "success";
            if (!obj.hasOwnProperty("boxes")) {
               var defaultBoxes = {
                  "inbox" : {},
                  "files" : {},
                  "keys" : {}
               };
               obj.boxes = defaultBoxes;
            }
            res.json(obj);
         }
      });
   }
};

exports.save = function(req, res) {
   var username = req.param("username", null);
   var password = req.param("password", null);
   var boxesStr = req.param("boxes", null);
   var authErr = { error : "auth error"};
   if (!username || !password) {
      res.json(authErr);
   } else if (!boxesStr) {
      res.json({"error":"no files"});
   } else {
      var user = { username: username,
                   password : password };
      var data = { username : username,
                   password : password,
                   boxes : JSON.parse(boxesStr) };
      users.update(user, data);
      res.json({status:"success"});
   }
};

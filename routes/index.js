/*
 * GET home page.
 */
exports.index = function(req, res) {
   var data = { title : 'websh' };
   res.render('index', data);
};

var auth = require("./auth")
var files = require("./files")
exports.auth = auth.auth;
exports.logout = auth.logout;
exports.files = files.files;
exports.save = files.save;

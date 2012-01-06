String.prototype.repeat = function( num ) {
   return new Array(num + 1).join(this);
};

/*************************************
 * File class
 ************************************/
var File = function(name, content, alreadyEncrypted, password) {
   this.name = name;
   if (typeof alreadyEncrypted === "boolean") {
      this.unlocked = !alreadyEncrypted;
   } else {
      this.unlocked = true;
      alreadyEncrypted = false;
   }
   this.content = content;
   if (alreadyEncrypted && password) {
      this.unlock(password);
   }
};

File.prototype.getName = function(name) {
   return this.name;
};

File.prototype.setName = function(name) {
   this.name = name;
};

File.prototype.unlock = function(password) {
   if (this.unlocked) {
      throw "File is already unlocked.";
   }
   this.content = sjcl.decrypt(password, this.content);
   this.unlocked = true;
};

File.prototype.lock = function(password) {
   if (!this.unlocked) {
      throw "File is already locked.";
   }
   this.content = sjcl.encrypt(password, this.content);
   this.unlocked = false;
};

File.prototype.isLocked = function(password) {
   return !this.unlocked;
}

File.prototype.getContent = function(override) {
   if (this.unlocked || override) {
      return this.content;
   } else {
      throw "File is locked.";
   }
};

File.prototype.setContent = function(content) {
   if (this.unlocked) {
      this.content = content;
   } else {
      throw "File is locked.";
   }
};

/************************************
 * Box class
 ************************************/
var Box = function(name, unlocked) {
   this.name = name;
   this.files = [];
   this.unlocked = unlocked;
};

Box.prototype.getName = function(name) {
   return this.name;
};

Box.prototype.setName = function(name) {
   this.name = name;
};

Box.prototype.addFile = function(file) {
   if (this.files.length === 0) {

   }
   this.files.push(file);
};

Box.prototype.lock = function(password) {
   if (this.isLocked()) {
      throw "Box is already locked.";
   }
   if (this.isEmpty()) {
      throw "Box is empty, cannot lock.";
   }
   for (var i = 0; i < this.files.length; ++i) {
      this.files[i].lock(password);
   }
   this.unlocked = false;
};

Box.prototype.unlock = function(password) {
   if (!this.isLocked()) {
      throw "Box is already unlocked.";
   }
   for (var i = 0; i < this.files.length; ++i) {
      this.files[i].unlock(password);
   }
   this.unlocked = true;
};

Box.prototype.isEmpty = function() {
   return this.files.length === 0;
}

Box.prototype.isLocked = function() {
   return !this.isEmpty() && !this.unlocked;
}

Box.prototype.fileExists = function(name) {
   if (this.isLocked()) {
      throw "Directory is locked.";
   }
   for (var i = 0; i < this.files.length; ++i) {
      if (this.files[i].getName() == name) {
         return true;
      }
   }
   return false;
};

Box.prototype.getFile = function(name) {
   if (this.isLocked()) {
      throw "Directory is locked.";
   }
   for (var i = 0; i < this.files.length; ++i) {
      if (this.files[i].getName() == name) {
         return this.files[i];
      }
   }
   throw "File not found.";
};

Box.prototype.rmFile = function(name) {
   for (var i = 0; i < this.files.length; ++i) {
      if (files[i].getName() == name) {
         files.splice(i, 1);
         return;
      }
   }
};

Box.prototype.ls = function() {
   var name, file;
   var list = [];
   for (var i = 0; i < this.files.length; ++i) {
      file = this.files[i];
      name = file.getName()
      list.push(name);
   }
   return list.sort();
};

Box.prototype.getJSON = function() {
   var name, file;
   var json = {};
   for (var i = 0; i < this.files.length; ++i) {
      file = this.files[i];
      name = file.getName();
      json[name] = file.getContent(true);
   }
   return json;
};

/*************************************
 * BoxList class
 ************************************/
var BoxList = function() {
   this.boxes = [];
};

BoxList.prototype.addBox = function(box) {
   this.boxes.push(box);
};

BoxList.prototype.allLocked = function() {
   for (var i = 0; i < this.boxes.length; ++i) {
      if (!this.boxes[i].isLocked() && !this.boxes[i].isEmpty()) {
         return false;
      }
   }
   return true;
};

BoxList.prototype.getBox = function(name) {
   for (var i = 0; i < this.boxes.length; ++i) {
      if (this.boxes[i].getName() == name) {
         return this.boxes[i];
      }
   }
   return false;
};

BoxList.prototype.ls = function() {
   var box, name;
   var list = [];
   for (var i = 0; i < this.boxes.length; ++i) {
      box = this.boxes[i];
      name = box.getName();
      if (box.isLocked()) {
         name = name + " &lt;locked&gt;";
      } else if (box.isEmpty()) {
         name = name + " &lt;empty&gt;";
      }
      list.push(name);
   }
   return list.sort();
}

BoxList.prototype.getJSON = function() {
   var name, box;
   var json = {};
   json.boxes = {};
   for (var i = 0; i < this.boxes.length; ++i) {
      box = this.boxes[i];
      name = box.getName();
      json.boxes[name] = box.getJSON();
   }
   return json;
};

/*************************************
 * Editor class
 *************************************/
var Editor = function(title, buttons) {
   this.buttons = buttons || [];
   this.title = title;
   this.close = function() {};
};

Editor.prototype.getEditor = function() {
   var editor = $("<div/>");
   editor.attr("id", "editor");
   editor.hide();
   var menu = $("<div/>");
   menu.attr("id", "menu");
   var label = $("<label/>");
   label.addClass("name");
   label.text(this.title);
   var ta = $("<textarea/>");
   ta.addClass("editor");
   menu.append(label);
   editor.append(menu);
   editor.append(ta);
   for (var i in this.buttons) {
      var text = this.buttons[i];
      var button = $("<button/>");
      button.addClass(text);
      button.text(text);
      menu.append(button);
   }
   return editor;
};

Editor.prototype.launch = function() {
   throw "Cannot launch editor base class.";
};

Editor.prototype.onClose = function(callback) {
   this.close = callback;
};

/*************************************
 * MessageEditor class
 *************************************/
var MessageEditor = function(title, pubkey) {
   Editor.call(this, title, ["send", "close"]);
   this.pubkey = pubkey;
};

MessageEditor.prototype = new Editor();

MessageEditor.prototype.launch = function() {
   var editor = this.getEditor();
   var close = this.close;
   var textarea = editor.find("textarea");
   var rsa = importRSAPub(this.pubkey);
   $("#term").append(editor);
   editor.show();

   editor.find(".send").unbind("click").click(function() {
      textarea.val(rsa.encrypt(textarea.val()));
   });
   editor.find(".close").unbind("click").click(function() {
      editor.hide();
      newPrompt();
   });
   
};

/*************************************
 * FileEditor class
 *************************************/
var FileEditor = function(title, file) {
   Editor.call(this, title, ["save", "close"]);
   this.file = file;
};

FileEditor.prototype = new Editor();

FileEditor.prototype.launch = function() {
   var editor = this.getEditor();
   var name = editor.find("label");
   var title = this.title;
   var file = this.file;
   var close = this.close;
   var textarea = editor.find("textarea");
   textarea.val(file.getContent());
   $("#editor").remove();
   $("#term").append(editor);
   editor.show();
   textarea.unbind("keydown").bind("keydown", function() {
      name.text(title + " [changed]");
   });

   editor.find(".close").unbind("click").click(function() {
      editor.hide();
      newPrompt();
   });
   editor.find(".save").unbind("click").click(function() {
      file.setContent(textarea.val());
      name.text(title + " [saved]");
      setTimeout(function() {
         name.text(title);
      }, 1000);
   });
   setTimeout(function() {
      editor.show();
      textarea.focus();
   }, 20);
};

function exportRSAKey(rsa) {
   var key = {
      coeff : rsa.coeff.toString(16),
      d : rsa.d.toString(16),
      dmp1 : rsa.dmp1.toString(16),
      dmq1 : rsa.dmq1.toString(16),
      e : rsa.e.toString(16),
      n : rsa.n.toString(16),
      p : rsa.p.toString(16),
      q : rsa.q.toString(16)
   };
   return JSON.stringify(key);
}

function exportRSAPub(rsa) {
   var pubKey = {
      e : rsa.e.toString(16),
      n : rsa.n.toString(16)
   };
   return JSON.stringify(pubKey);
}

function importRSAKey(key) {
   var rsa = new RSAKey();
   key = JSON.parse(key);
   rsa.setPrivateEx(key.n, key.e, key.d, key.p, key.q,
                    key.dmp1, key.dmq1, key.coeff);
   return rsa;
}

function importRSAPub(key) {
   var rsa = new RSAKey();
   key = JSON.parse(key);
   rsa.setPublic(key.n, key.e);
   return rsa;
}

var newPrompt;

/*************************************
 * Shell main function
 ************************************/
$(function() {
   var shell = $("#term")
     , promptText = "websh> "
     , history = []
     , historyPos = null
     , partialCmd = null
     , pwd = "/"
     , homeDir = "/"
     , uname = null
     , pass = null
     , boxes = new BoxList();

   var getLockUnlock = function(lock) {
      return function(params) {
         var name, box, passwordPrompt;
         if (params.length < 2) {
            echo("Usage: unlock <directory>");
         } else {
            name = params[1];
            box = boxes.getBox(name);
            if (lock && box.isLocked()) {
               throw "Box is already locked";
            } else if (!lock && !box.isLocked()) {
               throw "Box is already unlocked";
            }
            passwordPrompt = $("<input/>");
            passwordPrompt.attr("type", "password");
            passwordPrompt.addClass("password");
            newPrompt("password: ", passwordPrompt);
            $(".password").unbind('keydown').keydown(function(e) {
               if (e.which == 13) {
                  password = $(this).val();
                  try {
                     if (lock) {
                        box.lock(password);
                     } else {
                        box.unlock(password);
                     }
                  } catch (e) {
                     if (e instanceof sjcl.exception.corrupt) {
                        echo("Wrong password");
                     } else {
                        throw e;
                     }
                  }
                  newPrompt();
               }
            });
         }
      };
   };

   var commands = {
      "json" : function(params) {
         echo(JSON.stringify(boxes.getJSON()));
         newPrompt();
      },

      "cd" : function(params) {
         var dir, m;
         if (params.length < 2 || !params[1]) {
            dir = homeDir;
         } else {
            dir = params[1];
         }
         dir = realpath(dir);
         if (dir == "/") {
            pwd = "/";
         } else if (m = dir.match(/^\/([^\/\s]+)$/)) {
            var boxName = m[1];
            if (boxes.getBox(boxName) !== false) {
               pwd = dir;
            } else {
               throw "No such directory: " + dir;
            }
         } else {
            throw "No such directory: " + dir;
         }
         newPrompt();
      },

      "clear" : function(params) {
         shell.html("");
         newPrompt();
      },

      "compose" : function(params) {
         var rsa = new RSAKey();
         rsa.generate(2048, "10001");
         var key = exportRSAPub(rsa);
         var editor = new MessageEditor("Compose a message", key);
         editor.launch();
      },

      "edit" : function(params) {
         var m
           , path
           , boxName
           , fileName
           , box
           , file
           , notFound = false;
         if (params.length < 2) {
            echo("Usage: edit <filename>", true);
            newPrompt();
         }
         path = realpath(params[1]);
         if (m = path.match(/^\/([^\/]+)\/([^\/]+)$/)) {
            boxName = m[1];
            fileName = m[2];
            box = boxes.getBox(boxName);
            if (box !== false) {
               try {
                  file = box.getFile(fileName);
               } catch (e) {
                  if (e == "File not found.") {
                     file = new File(fileName);
                     box.addFile(file);
                  } else {
                     throw e;
                  }
               }
               var editor = new FileEditor(path, file);
               editor.launch();
            } else {
               throw "No such directory.";
            }
         } else {
            throw "Path error.";
         }
      },

      "exit" : function(params) {
         echo("Logging out...");
         $.getJSON("/logout", function(data) {
            if (data.status == "success") {
               window.location.reload();
            } else {
               throw "Could not logout.";
            }
         });
      },

      "genrsa" : function(params) {
         if (params.length < 2) {
            echo("Usage: genrsa <key name> <key size=1024> <exponent=65537>", true);
            newPrompt();
            return;
         }
         var name = params[1];
         var keySize = (params.length >= 3 ? params[2] : 1024);
         var exp = (params.length >= 4 ? params[3] : 65537);
         var rsa = new RSAKey();
         var box = boxes.getBox("keys");
         if (box === false) {
            throw "'keys' directory does not exist.";
         }
         if (box.fileExists(name + ".pub") || box.fileExists(name + ".priv")) {
            throw "Key files already exist.";
         }
         echo("Generating key pairs...<br/>");
         setTimeout(function() {
            var start = new Date();
            rsa.generate(keySize, exp.toString(16));
            var end = new Date();
            var privExport = exportRSAKey(rsa);
            var pubExport = exportRSAPub(rsa);
            echo("Done in " + (end - start) + " ms.<br/>");
            var pubFile = new File(name + ".pub", pubExport);
            var privFile = new File(name + ".priv", privExport);
            var box = boxes.getBox("keys");
            box.addFile(pubFile);
            box.addFile(privFile);
            newPrompt();
         }, 10);
      },

      "rsa-crypt" : function(params) {
         var keyFileName = params[1];
         var mesg = params[2];
         var box = boxes.getBox("keys");
         var file = box.getFile(keyFileName + ".pub");
         var rsa = importRSAPub(file.getContent());
         echo(rsa.encrypt(mesg));
         newPrompt();
      },

      "help" : function(params) {
         var list = [];
         var ignore = {"notfound" : 1,
                       "json" : 1};
         for (var i in commands) {
            if (commands.hasOwnProperty(i) && !(i in ignore)) {
               list.push(i);
            }
         }
         echo(list.join("<br/>"));
         newPrompt();
      },

      "history" : function(params) {
         echo("<ol><li>" + history.join("</li><li>") + "</li></ol>");
         newPrompt();
      },

      "lock" : getLockUnlock(true),

      "ls" : function(params) {
         var list, dir;
         if (params.length < 2) {
            dir = pwd;
         } else {
            dir = realpath(params[1]);
         }
         if (dir === "/") {
            list = boxes.ls();
         } else {
            var boxName = dir.slice(1);
            var box = boxes.getBox(boxName);
            if (box) {
               list = box.ls();
            } else {
               throw "Something went wrong.";
            }
         }
         echo(list.join("<br/>"));
         newPrompt();
      },

      "mkdir" : function(params) {
         dir = params[1];
         if (!dir) {
            echo("Usage: mkdir <dirname>", true);
         } else if (boxes.getBox(dir) !== false) {
            throw "Directory already exists.";
         } else {
            var box = new Box(dir, false);
            boxes.addBox(box);
         }
         newPrompt();
      },

      "notfound" : function(params) {
         if (params[0]) {
            throw 'Command not found: ' + params[0];
         }
         newPrompt();
      },

      "pwd" : function(params) {
         echo(pwd);
         newPrompt();
      },

      "save" : function(params) {
         saveFiles();
      },

      "unlock" : getLockUnlock(false),

      "whoami" : function(params) {
         echo(uname);
         newPrompt();
      },

   };

   function loadFiles(boxesData) {
      echo("Loading files...");
      var boxList
        , box
        , file
        , boxData
        , fileData;
      boxList = new BoxList();
      for (var boxName in boxesData) {
         boxData = boxesData[boxName];
         box = new Box(boxName);
         for (var fileName in boxData) {
            fileData = boxData[fileName];
            file = new File(fileName, fileData, true);
            box.addFile(file);
         }
         box.unlocked = box.isEmpty();
         boxList.addBox(box);
      }
      boxes = boxList;
      echo(" done.");
      newPrompt();
   };


   function saveFiles() {
      echo("Saving files...<br />");
      if (!boxes.allLocked()) {
         throw "Not all boxes locked.";
      }
      var boxesJSON = boxes.getJSON().boxes;
      var boxesStr = JSON.stringify(boxesJSON);
      var data = {"username" : uname,
                  "password" : pass,
                  "boxes" : boxesStr};
      $.getJSON("/save", data, function(data) {
         if (data.status == "success") {
            echo("done");
            newPrompt();
         } else {
            throw "Could not save files.";
         }
      });
   }

   function realpath(dir) {
      if (dir[0] != "/") {
         dir = pwd + "/" + dir;
      }
      dirs = dir.split("/");
      for (var i = 0; i < dirs.length; ++i) {
         var tdir = dirs[i];
         if (!tdir || tdir === ".") {
            dirs[i] = null;
         } else if (tdir === "..") {
            dirs[i] = null;
            for (j = i - 1; j > 0; --j) {
               if (dirs[j]) {
                  dirs[j] = null;
                  break;
               }
            }
         }
      }
      for (var i = 0; i < dirs.length; ++i) {
         if (!dirs[i]) {
            dirs.splice(i,1);
            --i;
         }
      }
      return "/" + dirs.join("/");
   }

   newPrompt = function(showText, input) {
      var cont = $("<div/>");
      var prompt = $("<span/>");
      showText = showText || promptText;
      if (!input) {
         input = $("<input/>");
         input.attr("type", "text");
         input.addClass("shell");
      }

      prompt.text(showText);
      cont.append(prompt);
      cont.append(input);
      shell.append(cont);
      focus();
      shell.prop("scrollTop", shell.prop("scrollHeight"));
      partialCmd = null;
      historyPos = null;
   }

   function focus() {
      var input = shell.find("input");
      input.focus();
   }

   function echo(text, esc) {
      if (esc) {
         text = $("<div/>").text(text).html();
      }
      var t = $("<span/>");
      t.html(text);
      t.addClass("echo");
      shell.append(t);
   }

   function testLogin() {
      var data = { username : "adam", password : "hello2" };
      $.getJSON("/files", data, function(data) {
         loadFiles(data.boxes);
      });
   }

   function login() {
      var username, password;

      var usernamePrompt = $("<input/>");
      usernamePrompt.attr("type", "text");
      usernamePrompt.addClass("username");

      var passwordPrompt = $("<input/>");
      passwordPrompt.attr("type", "password");
      passwordPrompt.addClass("password");

      newPrompt("username: ", usernamePrompt);

      $(".username").unbind('keydown').keydown(function(e) {
         if (e.which == 13) {
            username = $(this).val();
            newPrompt("password: ", passwordPrompt);
            $(".password").unbind('keydown').keydown(function(e) {
               if (e.which == 13) {
                  password = $(this).val();
                  var data = { username : username, password : password };
                  $.getJSON("/files", data, function(data) {
                     if (data.status == "success") {
                        uname = username;
                        pass = password;
                        shell.html("");
                        echo("Logged in as " + uname + "<br />");
                        loadFiles(data.boxes);
                     } else {
                        echo("Authentication failure.");
                        login();
                     }
                  });
               }
            });
         }
      });

   }

   //login();
   testLogin();

   shell.click(function() {
      focus();
   });

   $("#term input.shell").live('keydown', function(e) {
      var m;
      $this = $(this);
      if (e.which == 13) {
         var p = $this.parent().find("span");
         var command = $this.val().trim();
         p.text(promptText + $this.val());
         $this.remove();
         params = command.split(" ");
         for (var i = 0, l = params.length; i < l; ++i) {
            params[i] = params[i].trim();
         }
         if (command) {
            history.push(command);
         }
         command = params[0];
         if (!commands.hasOwnProperty(command)) {
            command = "notfound";
         }
         try {
            commands[command].call(null, params);
         } catch (e) {
            echo("ERROR: " + e);
            newPrompt();
         }
      } else if (e.which == 38 /* up */) {
         if (typeof partialCmd !== "string") {
            partialCmd = $this.val();
         }
         if (typeof historyPos !== "number") {
            historyPos = history.length;
         }
         if (historyPos >= 0) {
            historyPos -= 1;
         }
         if (historyPos >= 0) {
            $this.val(history[historyPos]);
            focus();
         }
      } else if (e.which == 40 /* down */) {
         if (typeof historyPos === "number") {
            ++historyPos;
            if (historyPos == history.length) {
               $this.val(partialCmd);
               historyPos = null;
               partialCmd = null;
            } else {
               $this.val(history[historyPos]);
            }
         }
      }
   });

   window.onerror = function(desc, page, line) {
      var usl = "Uncaught ".length;
      if (desc.slice(0, usl) == "Uncaught ") {
         desc = "ERROR: " + desc.slice(usl);
      }
      echo(desc);
      newPrompt();
   };

});

var sha256 = require('js-sha256');
var crypto = require('crypto');

module.exports = {
	sha1:function(str) {
		return crypto.createHash('sha1').update(str).digest('hex');
	},
    findIndexByKeyValue:function(obj, key, value){
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] == value) {
                return i;
            }
        }
        return null;
    },
    AddParamsToURLSpecial:function(url, params, base, type, req){
        var paramList = '',
            c = 0;
        for(var i in params){
            paramList += ((c === 0) ? '?' : '&');
            if(params[i].indexOf('getKey()') !== -1){
                params[i] = base.keys[i];
            } else if(params[i].indexOf('getParam()') !== -1 && req){
                if(req.param(i)){
                    params[i] = req.param(i);
                } else {
                    params[i] = 'errorN0005';
                }
            } 
            
            paramList += i + '=' + params[i];  
            c++;
        }
        return url + paramList;
    },
    AddBodySpecial:function(params, base, type, req, error){
        var paramList = {};
        for(var i in params){
            if(params[i].indexOf('getKey()') !== -1){
                params[i] = base.keys[i];
            } else if(params[i].indexOf('getParam()') !== -1 && req){
                console.log(req.param(i));
                if(req.param(i)){
                    params[i] = req.param(i);
                } else {
                    error();
                    break;
                }
            } 
            
            paramList[i] = params[i];  
        }
        return paramList;
    },
    saltAndHash: function(pass, callback){
        function generateSalt(){
            var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
            var salt = '';
            for (var i = 0; i < 10; i++) {
                var p = Math.floor(Math.random() * set.length);
                salt += set[p];
            }
            return salt;
        }
        
		var salt = generateSalt();
		callback(salt + sha256(pass + salt));
	},
    validatePassword: function(plainPass, hashedPass, callback){
		var salt = hashedPass.substr(0, 10);
		var validHash = salt + sha256(plainPass + salt);
		callback(null, hashedPass === validHash);
    },
    validateEmail: function(e){
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	},
    htmlEscape: function(text) {
	   return text.replace(/&/g, '&amp;').
		 replace(/</g, '&lt;').  // it's not neccessary to escape >
		 replace(/"/g, '&quot;').
		 replace(/'/g, '&#039;');
	},
    color: function(){
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
    tryParseJSON: function (jsonString) {
        try {
            var o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object", 
            // so we must check for that, too.
            if (o && typeof o === "object" && o !== null) {
                return o;
            }
        } catch (e) {
            return {
                error: 'error'
            }
        }

        return {
            error: 'error'
        };
    }
}
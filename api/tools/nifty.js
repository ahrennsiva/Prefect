var moment = require('moment');
var async = require('async');
var crypto = require('crypto');
var MongoDB = require('mongodb').Db;
var Server 	= require('mongodb').Server;
var mongojs = require('mongojs');
var request = require('request');
var OAuth = require('oauth');
var keys = require('../../assets/keys/keys.js');
var _ = require('../../api/tools/utilities.js');

var provisionEntryData = function(collection, data){
    var collect = [];
    if(JSON.stringify(collection).indexOf('[') === -1){
        collection = [ collection ]; 
        data = [ data ]; 
    }

    for(var i in collection){
        collect[i] = {};
        collect[i].collection = collection[i];
        collect[i].data = data[i];
    }
    
    return collect; 
}

module.exports = {
    encrypt:function encrypt_data(text){
      var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
      var crypted = cipher.update(text,'utf8','hex')
      crypted += cipher.final('hex');
      return crypted;
    },
    decrypt: function decrypt_data(text){
      var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
      var dec = decipher.update(text,'hex','utf8')
      dec += decipher.final('utf8');
      return dec;
    },
    request:function(type, url, method, send, cb, res){
      function isValidURL(s) {    
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);    
       }

      if(isValidURL(url)){
        if(type === 'http' || type === 'oauthv2'){
            
            if(!send){ 
                send = {};
            }

            
           

            var options = {
                url: url,
                method: (method) ? method.toUpperCase() : "GET",
                headers: send.headers || {},
                timeout:20000
            };

            if(send.body){
                options.body = send.body;
                options.json = true;
            }
            if(send.form){
                options.form = send.form;
            }
            if(send.formData){
                options.formData = send.formData;
                options.json = true;
            }
            
            function callback(error, response, body) {
             
  
                if (!error && response.statusCode == 200) {

                  var info = (typeof body === "object") ? body : _.tryParseJSON(body) ;

                  cb(info);
                } else { 
                    
                    if(res){
                        console.log(error);
                        console.log(body);  

                        res(error, body, response);

                     } else {
                        console.log(error);
                        console.log(body); 

                     }
                }
            
            }
            
            try{
                request(options, callback);
            } catch(err){
          
                if(res){
                    res('There was an error in parsing, please reformat your data', 400, {error:"There was an error in parsing, please reformat your data."});
                }
              
            }
        } else if(type === 'oauthv1'){
            if(send.auth){
              var oauth = new OAuth.OAuth(
              send.auth.requesttokenurl,
              send.auth.accesstokenurl, 
              send.auth.consumerkey,
              send.auth.consumersecret,
              '1.0A',
              null,
              send.auth.encoding || 'HMAC-SHA1'  //'HMAC-SHA1'
              );
              
              var method = method.toLowerCase();
              if(method === 'get' || method === 'post'){
                try{
                   oauth[method](
                    url,
                    send.auth.token, //test user token
                    send.auth.tokensecret, //test user secret            
                    function (error, body, response){
            
                      
                        if (!error && response.statusCode == 200) {
                          var info = (typeof body === "object") ? body : _.tryParseJSON(body) ;

                          cb(info);
                        } else {
                           
                            console.log(e);
                            console.log(body);  
                            console.log(res);
                            res(e, body, res);

                        };  
                      
                  });
                } catch(err){

                  
                    if(res){
                        res('There was an error in parsing, please reformat your data', 400, {error:"There was an error in parsing, please reformat your data."});
                    }
                  
                }
              } else {
                if(res){
                  res("", 400, {error:"Sorry, we don't support that request method yet."});
                } 
              }
              
              
          }  else {
              if(res){
                res("", 400, {error:"You are missing a few authentication details."});
              }
          }
        } else {
            if(res){
              res("nope", 400, {});
            }
        }
      } else {
          if(res){
            res("nope", 400, {error:"Your URL is not valid"});
          }
      }
    },
    cryptobox:function(x, y, z){
        return crypto.randomBytes(x).toString('hex') + '_' + crypto.randomBytes(y).toString('hex') + '_' + crypto.randomBytes(z).toString('hex')
    },
    provisionDatabases: function(){
        console.log("Readying Databases");
        var collections = {};
        for(var i in keys.DB){
            var db = mongojs(keys.DB[i]);
            collections[i] = {};
            //default specific database provisioning
            if(i === 'default'){
                collections[i].parolees = db.collection('parolees');
                collections[i].courses = db.collection('courses');
                collections[i].organizations = db.collection('organizations');
                collections[i].jobs = db.collection('jobs');
            }

            
            console.log("Readied " + i);
        }
       return collections;
    },
    do: function(what, collection, data, callback, res, options){
        options = (options) ? options : {safe:true};
        
        var err;
        var collect = provisionEntryData(collection, data);
         
        async.each(collect, function(collecte, cb) {
            collecte.collection[what](collecte.data, options, function(e){
                if(e){
                    err = e;
                    cb();
                } else {
                    cb();   
                }
            });
        }, function(){
            if( err ) {
                if(res){
                    res.send("Failed to insert", 400);
                } else {
                    throw Error("failed inserting in chron process with:" + e ); 
                }
            } else {
                callback();
            }
        });
        
        
    },
    find: {
        one: function(collection, query, callback, res){
            collection.findOne(query, function(e, o){
                if(e){
                    if(res){
                        res.send("Failed to find one", 400);
                    } else {
                        throw Error("failed finding in chron process with:" + e ); 
                    }
                } else {
                    callback(o);   
                }
            });
        },
        all: function(collection, query, callback, res){
            collection.find(query).toArray(function(e, o){
                if(e){
                    if(res){
                        res.send("Failed to find all", 400);
                    } else {
                        throw Error("failed finding in chron process with:" + e ); 
                    }
                } else {
                    callback(o);   
                }
            });
        }
    }
}
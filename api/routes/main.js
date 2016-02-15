// Load quickdata platform
var $ = require('../tools/nifty.js');
var subdomain = require('wildcard-subdomains');

module.exports = function(app, db) {
  var user = {};
  
   $.find.one(db.default.parolees, {"user_id":"joebob1"}, function(o){
       console.log(o)
     user = o;
     
   });
 
  app.get('/app', function(req, res){
     $.find.one(db.default.parolees, {"user_id":"joebob1"}, function(o){
      $.find.all(db.default.courses, getSkillSet(user.exp), function(o){
         res.render('parolee/index', {user:user, title:'courses', courses:o});
       });
     });
      
  });
  
  app.get('/stats', function(req, res){
      $.find.one(db.default.parolees, {"user_id":"joebob1"}, function(o){
          
         res.render('parolee/index', {title:'stats', user:o});
       });
      
  });
  
  app.get('/mentor', function(req, res){

         res.render('parolee/index', {title:'mentor', user:user});

  });
  
  
  function getSkillSet(exp){
      
      var currentSkills = ["finance","writing_skills","programming","leadership"];
      var limiter = {};
      
      for(var i in currentSkills){
          var skill = 0;
          if(exp[currentSkills[i]]){
              skill = exp[currentSkills[i]];
              
          }
          limiter['min_' + currentSkills[i]] = { $lte : skill}
          

      }
      console.log(limiter)
      
      return limiter;

  }
  
  app.get('/jobs', function(req, res){

          $.find.all(db.default.jobs, getSkillSet(user.exp), function(o){
                res.render('parolee/index', {user:user, title:'jobs', jobs:o});
          });

      
  });
  
  app.get('/courses/:id', function(req, res){
      $.find.one(db.default.courses, {"cid":req.params.id}, function(o){
          if(o && user.exp >= o.exp){
            res.render('parolee/index', {user:user, title:'course', course:o});
          } else {
              res.send(404)
          }
       });
      
  });
  
  
  
  app.post('/course/save', function(req, res){
      var body = req.body;
    
      $.find.one(db.default.parolees, {"user_id":"joebob1"}, function(o){
          
          $.find.one(db.default.courses, {"cid":body.cid}, function(x){
             body.steps = parseFloat(body.steps);
             
             if(o.courses_active[body.cid]){
                 var newData = {
                          steps:body.steps,
                          cid:body.cid,
                          class:x.class,
                          answered_correct: JSON.parse(body.correct),
                          answered_wrong: JSON.parse(body.wrong),
                          failed_tests: parseFloat(o.courses_active[body.cid].failed_tests) + parseFloat(body.fail)
                        }
                        
                 if(body.steps > (x.steps.length + 1)){
                      if(o.courses_active[body.cid]){
                          delete o.courses_active[body.cid];
                      }
                      for(var i in x.exp){
                          o.exp[i] = o.exp[i] + x.exp[i];
                      }
                      o.courses_completed[body.cid] =  newData;
                      
                  } else {
                      if(o.courses_completed[body.cid]){
                          for(var i in x.exp){
                              o.exp[i] = o.exp[i] - x.exp[i];
                          }
                          
                          delete o.courses_completed[body.cid];
                      }                      
                      o.courses_active[body.cid] = newData;
                  }
             } else {
                 
                  var answerdb = {};
                        answerdb.cid = body.cid;
                        answerdb.step = body.steps;
                        answerdb.class = x.class;
                        answerdb.answered_correct = JSON.parse(body.correct);
                        answerdb.answered_wrong = JSON.parse(body.wrong);
                        answerdb.failed_tests = 0 + body.fail;
                
                  if(answerdb.step > x.steps.length + 1){
                      if(o.courses_active[body.cid]){
                          delete o.courses_active[body.cid];
                      }
                      o.courses_completed[body.cid] = answerdb;
                  } else {
                      if(o.courses_completed[body.cid]){
                      for(var i in x.exp){
                          o.exp[i] = o.exp[i] - x.exp[i];
                      }
                      
                      delete o.courses_completed[body.cid];
                      }
                      o.courses_active[body.cid] = answerdb;
                  }
                 }
        
             db.default.parolees.save(o, function(err) {
                 console.log(err);
                user = o;
                res.send(200);
            });
          });
      });
      
  });
}
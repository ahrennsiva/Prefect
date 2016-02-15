var user = $('.datatree').data('user');
var answered_correct = $('.datatree').data('user');
var answered_wrong = $('.datatree').data('user');
var job_offers_active = $('.datatree').data('user');
var courses_active = $('.datatree').data('user');

  user.exp = user.exp + answered_correct* 20;
    
    user.exp = user.exp + job_offers_active*20;
    
    user.exp = user.exp + courses_active*5;
    
var level = Math.floor(user.exp/100);

if (90<= (answered_correct/(answered_wrong+answered_correct))<= 100){
    console.log("Excellent");
    console.log("100% in this course");
}
else if (80<=answered_correct/(answered_wrong+answered_correct) < 90){
    console.log("Good");
    console.log("80%-99% on this course");
}
else if (70<=answered_correct/(answered_wrong+answered_correct) < 80){
    console.log("Good");
    console.log("70%-80% on this course");
}
else{
    console.log("Needs work!");
    console.log("60% or less on this course");
}


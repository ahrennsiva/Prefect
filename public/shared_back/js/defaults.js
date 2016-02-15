
function checkPreDoc(){
    var active = $('.datatree').data('active')
    $('.connect-' + active).addClass("active")
}

// function generateYcepts(){
//     var cepts = [];
//     $('.lesson-container').each(function() {
//       cepts.push($(this).offset().top);
//     })
//     return cepts;
// }

$(document).ready(function(){
    checkPreDoc();
    
    if($('.datatree').data('active') === 'course'){
        $('.content').html(createContent($('.content').html()));
    //     var cepts = generateYcepts();
    //     cepts
     }
    
    // $('.cont').scroll(function(){
    //     var loc = $('.cont').scrollTop.indexOf(cepts);
    //      if(loc !== -1){
    //         $('.course_section').removeClass('selected');
    //         $('.course_section:eq(' + loc + ')').addClass('selected');
    //      }
    // })
})



function findQuestions(text){
	
    var exploreBrack = function(match, p1, p2, p3, offset, string){
        var newText = "";
        
        var ans = p1.split('&');
        var x = 1;
        for(var i in ans){
         	newText += 	"<div class='q-input-mc-choice'>" +
                		"<span class='q-input-mc-choice-i'>" + (x) +
                		"</span> " +
                		"<span class='q-input-mc-choice-d'>" + ans[i] +
                		"</span>" +
                		"</div>";         
            x++;
        }
        
        newText += "<div class='clear'></div>";
        return newText;
    };
    
    var exploreSquig = function(match, p1, p2, p3, offset, string){
        var setupText = p1;
        var newText = "";
        var litType = setupText.split(',');
        if(litType[0] === 'question'){
			newText += "<div class='q-header'>" + litType[1] + "</div>";
            
            //if input
            if(litType[2].indexOf('input') !== -1){
                newText += "<div data-answer=" + litType[3]  + "  class='q-input q-input-no'>" + 
                    		"<input class='q-input-actual' type='text'>" +
                    		"<span class='q-input-selector'> Submit </span>";
                 newText += "<div class='answer-block'></div>"+
                    		"</div>";
            } else if(litType[2].indexOf('multiplechoice') !== -1){
                newText += "<div data-answer=" + litType[3]  + "  class='q-input q-input-mc'>" + 
                    		litType[2].replace(/\[([^\[]*)\]/g, exploreBrack).replace("multiplechoice","").replace(/amp;/g,"");
               newText += "<div class='answer-block'></div>" +
                    		"</div>";
            }
            
            
        }
        
        return newText;
    }
    
  	text = text.replace(/{([^}]*)}/g, exploreSquig);
    
    return text;
}

function createContent(text){
	text = findQuestions(text);
    return text;
}

function checkCorrect(parent, validity){
    
    var block = parent.find('.answer-block');
    
    
    if(validity){
        if(parent.parent(".lesson-container").hasClass('normal-container') === true){
            
        block.removeClass('incorrect');
 		block.addClass('correct');
        
        var text = 	"<div class='q-a-header'>" +
            	   	"Correct!" +
            		"</div>" + 
            		"<div class='q-a-content'>" +
            	   	"Way to go!" +
            		"</div>";
        block.html(text);
        }
        parent.data('correct','yes');
    } else {
       
        if(parent.parent(".lesson-container").hasClass('normal-container') === true){
           
        block.removeClass('correct');
        block.addClass('incorrect');
        var text = 	"<div class='q-a-header'>" +
            	   	"Incorrect." +
            		"</div>" + 
            		"<div class='q-a-content'>" +
            	   	"You may want to check your answer again." +
            		"</div>";
        block.html(text);
        }
        parent.data('correct','no');
    }
}

//check answer

$(document).on("click", ".content.normal .q-input-mc-choice", function(){
    var parent = $(this).parent(".q-input-mc");
    parent.find(".q-input-mc-choice.selected").removeClass("selected");
    $(this).addClass("selected");
    var validity = false;
    if(parent.data('answer') + "" === $(this).find('.q-input-mc-choice-i').text()){
    	validity = true;
    }
        checkCorrect(parent, validity);
    
    
});

$(document).on("click", ".complete-test", function(){
    var correct = [];
    $('.test-container .q-input').each(function() {
        if($(this).data('correct') === 'yes'){
        correct.push($(this).data('correct'));
        }
    })
    
    if(correct.length > ($('.test-container .q-input').length)*.70){
        $('.pass-class').css('display','block');
    } else {
        $('.fail-class').css('display','block');
    }
});


function inputChkQ(that){
	var parent = $(that).parent(".q-input-no");
    var validity = false;
    if(parent.data('answer') + "" === parent.find('.q-input-actual').val()){
    	validity = true;
    } 

        checkCorrect(parent, validity);

}

$(document).on("keyup", ".content.normal .q-input-actual", function(e){
    if(e.keyCode == 13){
       inputChkQ(this);
    } 
});

$(document).on("click", ".content.normal .q-input-selector", function(e){
     inputChkQ(this);
});




$(document).on("click", ".course-section", function(){
    $('.course-section').removeClass('selected')
    $(this).addClass('selected')
    $('.cont').scrollTo('#step_' + $(this).data('step'));
});

var toolkit = {
    do:function(on, id, fun){
        $(document).on(on, id, function(e){
            fun(e)
        });
    },
    request:function(url, type, data, success, error){
        $.ajax({
            url: url,
            type: type,
            data: data,
            success: function(results){
                success(results)
            },
            error: function(results){
                error(results.responseText);
            }
        });     
        
    },
    error:function(e){
        $('.error-block').text(e);
        $('.error-block').slideDown();
        setTimeout(function(){
            $('.error-block').slideUp();
        }, 5000);
    },
    generateUid: function (separator) {
        /// http://stackoverflow.com/a/12223573
        /// <summary>
        ///    Creates a unique id for identification purposes.
        /// </summary>
        /// <param name="separator" type="String" optional="true">
        /// The optional separator for grouping the generated segmants: default "-".    
        /// </param>

        var delim = separator || "-";

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
    }
}

function saveData(cid, cb, stepoverride, failtest){
    var correct = [];
    var wrong = [];
    
    var x = 0;
    var steps = 1;
    $('.content.normal .q-input').each(function(){
        if($(this).data('correct')){
            if($(this).data('correct') === 'yes'){
                correct.push(cid+x);
               
            } else if($(this).data('correct') === 'no'){
                wrong.push(cid+x);
            }
            if(!($(this).next())){
             steps++;
            }
        }
        x++;
    });
    
    if(!failtest){
        failtest = 0;
    }
    if(stepoverride){
        steps = stepoverride
    
    }


    

    toolkit.request("/course/save", "POST", {cid:cid, correct:JSON.stringify(correct), wrong:JSON.stringify(wrong), steps:steps, fail:failtest}, function(){
        cb();
    }, function(){
        //
    })
}

$(document).on("click", "#saveandquit", function(){
    var cid = $(this).data('cid')
    saveData(cid, function(){
        window.location.href = '/app';
    })
});


$(document).on("click", "#failed-test", function(){
    var cid = $(this).data('cid')
    saveData(cid, function(){
        window.location.href = '/app';
    }, 0, 1)
});

$(document).on("click", "#passed-test", function(){
    var cid = $(this).data('cid')
    saveData(cid, function(){
        window.location.href = '/app';
    }, 999, 0)
});

$(document).on("click", "#retake-course", function(){
    var cid = $(this).data('cid')
    saveData(cid, function(){
        window.location.href = '/courses/' + cid;
    }, 0, 0)
});


//graphing
/*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */
// nv.addGraph(function() {
//   var chart = nv.models.lineChart()
//                 .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                 .transitionDuration(350)  //how fast do you want the lines to transition?
//                 .showLegend(false)       //Show the legend, allowing users to turn on/off line series.
//                 .showYAxis(false)        //Show the y-axis
//                 .showXAxis(false)        //Show the x-axis
//   ;

//   chart.xAxis     //Chart x-axis settings
//       .tickFormat(d3.format(',r'));

//   chart.yAxis     //Chart y-axis settings
//       .tickFormat(d3.format('.02f'));

//   /* Done setting the chart up? Time to render it!*/
//   var myData = sinAndCos();   //You need data...

//   d3.select('.graph-content svg')    //Select the <svg> element you want to render the chart in.   
//       .datum(myData)         //Populate the <svg> element with chart data...
//       .call(chart);          //Finally, render the chart!

//   //Update the chart when window resizes.
//   nv.utils.windowResize(function() { chart.update() });
//   return chart;
// });
// /**************************************
//  * Simple test data generator
//  */
 
//  var ex = $('#user_exp').text();
// function sinAndCos() {
//   var exp = [];
//   for(var i = 100; i > 0; i--){
//       exp[i] = ex/i;
//   }

//   //Line chart data should be sent as an array of series objects.
//   return [
//     {
//       values: exp,
//       key: 'Experience',
//       color: '#7777ff',
//       area: true      //area - set to true if you want this line to turn into a filled area chart.
//     }
//   ];
// }

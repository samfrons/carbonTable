element = false;

(function(jQuery) {

  jQuery.eventEmitter = {
    _JQInit: function() {
      this._JQ = jQuery(this);
    },
    emit: function(evt, data) {
      !this._JQ && this._JQInit();
      this._JQ.trigger(evt, data);
    },
    once: function(evt, handler) {
      !this._JQ && this._JQInit();
      this._JQ.one(evt, handler);
    },
    on: function(evt, handler) {
      !this._JQ && this._JQInit();
      this._JQ.bind(evt, handler);
    },
    off: function(evt, handler) {
      !this._JQ && this._JQInit();
      this._JQ.unbind(evt, handler);
    }
  };

}(jQuery));

Emitter = function(){}
jQuery.extend( Emitter.prototype , jQuery.eventEmitter );


var help = ['<ul id="help">',
'<ul>',
'<li><p><small> esc: </small> reset </p></li>',
'<li><p><small> ?: </small> show this help </p></li>',
'</ul>'
].join('');



$(function(){
console.log('*');
//smoke.alert(help);



$('nav').click(function(){
reset();
});

// lazy to the max
DATA={};

// lazy passed data from server application
var temp = $('#DATA').children();
for (var x = 0; x < temp.length; x++) {
      DATA[ $(temp[x]).attr('id') ] = $(temp[x]).text();
};


// look ma no hands
if( DATA.RELOAD == 'true' ){
var socket = io.connect('http://'+ DATA.ADDRESS +':9000');
      socket.on('update', function (data) {
      console.log(data)
      location.reload();
    }); 
}



var zoom = false;


// $('.smoke button').trigger('click');


reset = function(){
  $('#table .wrapper').animate({ scale:['1','1'] , translate:[ '0px' ,'0px' ] });
  zoom = false;
  hide_panel();
  hide_overlay();
  hide_tooltip(true);
  element = false;
}




update_panel = function(html){
    $('#panel div').animate({opacity:0},function(){
      $(this).html(html)
      $(this).animate({opacity:1},function(){
      console.log('panel updated');
      });
    });
}




update_overlay = function(html){
    $('#overlay div').animate({opacity:0},function(){
      $(this).html(html)
      $(this).animate({opacity:1},function(){
      $('img[usemap]').maphilight()
      console.log('overlay updated');
  

        $('#overlay area').click(function(event) { 
          var url = $(this).attr('href');
            url = url.slice(1,url.length)
              console.log(url);
              $.get('/site/'+element+'/allotropes/'+url+'.html',function(result){
                      update_panel(result);
              }).error(function(){ update_panel('FILE NOT FOUND');})
        });
      

      });
    });
}


$('#panel').css({
display:'visible',
left:$('#table').width()
});


visible_panel = false;

  show_panel = function(){
  if(visible_panel) return

    $('#panel').animate({ left: $('#table').width() - $('#panel').outerWidth() - 37 },function(){
      console.log('out');
      visible_panel = true;
    });
  }

  hide_panel = function(){
  if(!visible_panel) return

    $('#panel').animate({ left: $('#table').width() },function(){
      console.log('out');
      visible_panel = false;
    });
  }


visible_overlay = false;

  show_overlay = function(){
  if(visible_overlay) return
    $('#overlay').css('display','block');
    $('#overlay').animate( { opacity:1 } ,function(){
      visible_overlay = true;
    });

  }

  hide_overlay = function(){
  if(!visible_overlay) return
    $('#overlay').animate( { opacity:0 } ,function(){
      $(this).css('display','none');
      visible_overlay = false;
    });
  }


  avg_points = function(points){
      var avg = [0,0];
        
        console.log(points);
        for(var x = 0; x<points.length ; x++){
          if( x % 2 ){
            avg[1] = avg[1] + parseInt(points[x]);
          }else{
            avg[0] = avg[0] + parseInt(points[x]);
          }
        }
    
          avg[0] = avg[0] / (points.length/2);
          avg[1] = avg[1] / (points.length/2);
   
      return avg;
  }



 timer_tooltip=false;

 show_tooltip = function(location,html){
  if(timer_tooltip){
    clearTimeout(timer_tooltip);
    timer_tooltip = false;
  }

  if( $('#tooltip').is(':animated') ) {
      $('#tooltip').stop();
  }
  
  $('#tooltip div').html(html);
 
  var offset = [0,0];

    if(!element){
      offset[0] = - 20 ; 
      offset[1] = - 40  ;
    }

    $('#tooltip').css('display','block');
    $('#tooltip').css({
      left:location[0] + offset[0],
      top:location[1] + offset[1]
    })  
   
    $('#tooltip').animate( { opacity:1 } ,function(){
    });

  }


  hide_tooltip = function(now){

    if(now){
      timer_tooltip = false
      $('#tooltip').stop();
      $('#tooltip').css({opacity:0,display:'none'});
      return
    }

    if(!timer_tooltip ){
      timer_tooltip = setTimeout(function(){
        $('#tooltip').animate( { opacity:0 } ,function(){
          $(this).css('display','none');
          timer_tooltip = false;
        });
      },250);
    }
  }


  Hilighter.on('mouseover',function(event,href,shape){
//      console.log(event);
//      console.log(href);    
      var position =  avg_points(shape[1]);
          position[0] = position[0] // +
          position[1] = position[1] // +


        show_tooltip( position , href )


  });


  Hilighter.on('mouseout',function(event,href,shape){
      console.log('mouseout');
      hide_tooltip();
  });



  $('img[usemap]').maphilight()

    $('#table .wrapper area').click(function(event) { 
        var url = $(this).attr('href');
            url = url.slice(1,url.length)
        var coords = $(this).attr('coords').split(','); 
        var center = [0,0];

            element = url
        
        console.log(coords);
        for(var x = 0; x<coords.length ; x++){
          if( x % 2 ){
            center[1] = center[1] + parseInt(coords[x]);
          }else{
            center[0] = center[0] + parseInt(coords[x]);
          }
        }
    
          center[0] = center[0] / (coords.length/2);
          center[1] = center[1] / (coords.length/2);
          
          console.log('lvl 1 zoom @ ' + url);
          console.log('click @ poisition ' + center);


        var offset = 15;

        var size = [ $('#table .wrapper').width() , $('#table .wrapper').height() ];
        var middle = [ size[0]/2 , size[1]/2 ];
        var click = [ center[0] , center[1] ];

          var x = - ( middle[0] + offset ) + (size[0] - click[0] ) ;
          var y = - middle[1] + (size[1] - click[1] ) ;

        console.log('translateX: ' +x);
        console.log('translateY: ' +y);

        hide_tooltip(true);

        if(!zoom){
          $('#table .wrapper').animate({ scale:['7','7'] , translate:[  x+'px' , y+'px']})
 



          show_panel();
          $.get('/site/'+url+'/panel.html',function(html){
            update_panel(html);
          });

            show_overlay();
           
          $.get('/site/'+url+'/map.html',function(html){
            update_overlay(html);
            //$('img[usemap]').maphilight()
          });

        
        zoom = true;

        }else{
          $('#table .wrapper').animate({ translate:[  x+'px' , y+'px']})

            $.get('/site/'+url+'/panel.html',function(html){
            update_panel(html);
            });

            $.get('/site/'+url+'/map.html',function(html){
            update_overlay(html);
            });

            update_overlay('<h1>update</h1>');

        }

      return false; 
    });



// key listener

var shift = false;

$('html').keydown(function (e) {
  var keyCode = e.keyCode || e.which

  //console.log(keyCode);

  if(keyCode == 16){
    shift = true;
  }


  if(shift && keyCode == 191 ){
    console.log('help');
    smoke.alert(help);
  }

  if(keyCode == 27){
    console.log('esc');
    $('.smoke button').trigger('click');
    reset();
  }
  
});



$('html').keyup(function(e){
var keyCode = e.keyCode || e.which;
 
  if(keyCode == 16){
    shift = false;
  }
 

})



});

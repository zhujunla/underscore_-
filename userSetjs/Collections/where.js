
var keys = function(obj){
    var arr = [];
    for(var i in obj){
      arr.push(i);
    }
    return arr;
  }

  var each = function(list,iteratee){
    for(var i = 0; i < list.length; i++){
      iteratee(list[i], i ,list)
    }
  }

  // var where = function(list, properties) {
  //   var key = keys(properties),keyLength = key.length;
  //   return filter(list, function(val, i){
  //     var times = 0;
  //     each(key,function(keyOne, j){
  //       var faVAl = val[keyOne];
  //       if(faVAl && properties[keyOne] == faVAl){ ++times };
  //     })
  //     if(keyLength == times) return val;
  //   })          
    
  // }

  var where = function(list, properties) {
    var key = keys(properties),keyLength = key.length,needArry = [];
    each(list, function(val, i){
      var times = 0;
      each(key,function(keyOne, j){
        var faVAl = val[keyOne];
        if(faVAl && properties[keyOne] == faVAl){ ++times };
      })          
      
      if(keyLength == times) needArry.push(val)
    })
    
    return needArry;
  }

 var bb = where([{a:123},{b:456,a:123},{c:456,b:123}],{a:123,b:456});
 console.info(bb)
var isArrayLike = function(list){
  return typeof list.length === 'number' && typeof list == "object" && list.length<Math.pow(2,53)-1 && list.length > 1;
}
var shallowProperty = function(setproperty){
  return function(a){
     return a == null ? void 0 : a[setproperty]
  }
}
var getLength = shallowProperty('length')

var cb = function(iteratee,context){
 if(typeof iteratee === 'function') return function(){
   return iteratee.apply(context,arguments)
 }
}

var arrayfind = function(list, iteratee, context){
 iteratee = cb(iteratee, context);
 let arr = []; 
 for(var i = 0;i < list.length;i++){
   var v = list[i];
   var val = iteratee(v, i, list);
   if(val) arr.push(v);
   continue;
 }
 return getLength(arr) === 0 ? -1 : arr;
}

var objFind = function(list, iteratee, context){
 iteratee = cb(iteratee, context) 
 let obj = {}; 
 for(var i in list){
   var v = list[i];
   var val = iteratee(v, i, list);
   if(val) obj[i] = v;
   continue;
 }
 return JSON.stringify(obj) === "{}" ? -1 : obj;
}

 var filter = function(list, iteratee, context) {
   var findKeys = isArrayLike(list) ? arrayfind : objFind;
   var val = findKeys(list, iteratee, context);
   if( val !== -1) return val
 }
//  var aa = filter({a:1,b:2,c:3,d:4},function(val, index, list){
//    return val %2 !== 0;
//  })
//  console.info(aa)
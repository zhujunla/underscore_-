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
 iteratee = cb(iteratee, context) 
 for(var i = 0;i < list.length;i++){
   
   var val = iteratee(list[i], i, list);
   if(val) return i;
 }
 return -1;
}

var objFind = function(list, iteratee, context){
 iteratee = cb(iteratee, context) 
 for(var i in list){
   var val = iteratee(list[i], i, list);
   if(val) return i;
 }
 return -1;
}

 var find = function(list, iteratee, context) {
   var findKeys = isArrayLike(list) ? arrayfind : objFind;
   var index = findKeys(list, iteratee, context);
   if(index !== void 0 && index !== -1) return list[index]
 }
 var aa = find({a:1,b:2},function(val, index, list){
   return val == 2;
 })
 console.info(aa)
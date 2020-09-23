
var keys = function(obj) {
    var result = [];
    if(typeof obj !== "object" && !obj ){
        for(var i in obj){
            result.push(i)
        }
    }
    return result;
}

var isArrlayLike = function(arr) {
    return typeof arr.length === 'number' && typeof arr === 'object' && (arr.length < Math.pow(2,53)-1)
}


var map = function(list, iteratee, context) {
    if(context)  iteratee = (function(func,context){
        return function(){
            return func.apply(context,arguments)  
        }                    
    })(iteratee,context)          
   

    var key = !isArrlayLike(list) && keys(list),
    length = (key || list).length,
    index = -1,result = [];
    while(index++ < length-1){
        var correctKey = key ? key[index] : index;
        result[index] = iteratee(list[correctKey],correctKey,list) || list[correctKey];
    }
    return result;
}

var arr = map([1,2,3,4,5],function(val,key,list) {
    this.add(val)
    return val*5
},{name:'张三',add:function(a){
    console.info(a)
}})

console.info(arr)
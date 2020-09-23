var keys = function (obj) {
    var result = [];
    if (typeof obj !== "object" && !obj) {
        for (var i in obj) {
            result.push(i)
        }
    }
    return result;
}

var isArrlayLike = function (arr) {
    return typeof arr.length === 'number' && typeof arr === 'object' && (arr.length < Math.pow(2, 53) - 1)
}

var reduce = function(dir) {
    var reducer = function (obj, iteratee, memo, initial) {
    
        var key = !isArrlayLike(obj) && keys(obj),
            length = (key || obj).length,
            index =dir > 0 ? 0 : length + dir, result = [];
            
        if(!initial){                
            memo = obj[key?key[index]:index];
            index += dir ;
        }
        for(;index >=0 && index<length;index += dir){
            var correctKey = key?key[index]:index;                
            memo = iteratee(memo,obj[correctKey],correctKey,obj);
        }

        
        return memo;
    }

    return function(obj, iteratee, memo, context){
        var initial = arguments.length >=3;
        return reducer(obj, (function(func,context){
            return function(){
                // console.info(arguments)
               return func.apply(context,arguments)
            }
        })(iteratee,context), memo, initial)
    }
}

var aa= reduce(1)([1,2,3,4,5,6],function(memo,val,key,list){
    console.info(this)
    return memo + val
},20,{name:'掌聲'})
console.info(aa)
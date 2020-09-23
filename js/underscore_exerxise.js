(function(){
  var root  = typeof self == "object" && self.self == self && self || typeof global == 'object' && global.global === global && global || this || {};
  
  var previousUnderscore = root._;

  var ArrayProto = Array.prototype,ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol != 'undefined' ? Symbol.prototype:null;

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;
  //代理原型交换的裸函数参考。
  var Ctor = function() {};    

	var _= function(obj){
    if(obj instanceof _) return obj;
    if(!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }
  
  if(typeof exports != 'undefined' && !exports.nodeType){
    if(typeof module  != 'indefined' && !module.nodeType && module.exports){
      exports = module.exports = _;
    }
  }else{
    root._ = _;
  }
  
  _.VERSION = '1.9.1';

  
  var optimizeCb = function(func,context, argCount){
    if(context === void 0) return func;//用 void 0 代替 undefined 能节省字节。不少 JavaScript 压缩工具在压缩过程中，正是将 undefined 用 void 0 代替掉了。
    switch (argCount == null?3:argCount) {
      case 1:return function(value) {
        return func.call(context,value)
      };
      case 3:return function(value,index,collection){
        return func.call(context,value,index,collection)
      };
      case 4:return function(accumulator,value,index,collection){
        return func.call(context, accumulator, value, index, collection);
      }
      default:
        return function() {
          return func.apply(context, arguments);
        };
    }
    
    
  }

  var builtinIteratee;

  var cb = function(value,context,argCount){
    if(_.iteratee != builtinIteratee) return _.iteratee(value,context);
    if(value == null) return _.identity;
    if(_.isFunction(value)) return optimizeCb(value,context,argCount)
    if(_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  }

  _.iteratee = builtinIteratee = function(value,context){
    return cb(value,context,Infinity)
  }

  var restArguments = function(func, startIndex){
    startIndex = startIndex == null ? func.length -1 : +startIndex;
    return function(){
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = -1;
          while(index ++ < length){
            rest[index] = arguments[index + startIndex]
          }
          switch (startIndex) {
            case 0: return func.call(this,rest);
            case 1: return func.call(this,arguments[0],rest);
            case 2: return func.call(this,arguments[0],arguments[1],rest);
          }
          var args = Array(startIndex + 1);
          var index = -1;
          while(index++ < startIndex){
            args[index] = arguments[index];
          }
          args[startIndex] = rest;
          return func.apply(this,args);
    }
  }

  var baseCreate = function(prototype){
    if(!_.isObject(prototype)) return {};
    if(nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  }

  var shallowProperty = function(key){
    return function(obj){
      return obj = null?void 0 : obj[key];
    }
  }

  var has = function(obj,path){
    return obj != null&& hasOwnProperty.call(obj,path)
  }
  
  var deepGet = function(obj,path){
    var length = path.length,index = -1;    
    while(index++ < length){ 
      if(obj == null) return void 0;     
      obj = obj[path[i]];
    }
    return length?obj:void 0;
  }
  //2的53次方
  var MAX_ARRAY_INDEX = Math.pow(2,53) - 1;
  var getLength = shallowProperty("length");
  var isArrayLike = function(collection){//类数组
    var length = getLength(collection);
    return typeof length == 'number' && length >=0 && length <= MAX_ARRAY_INDEX;
  }
  
  _.each = _.forEach = function(obj,iteratee,context){
    iteratee = optimizeCb(iteratee,context);
    var index = -1, length;
    if(isArrayLike(obj)){
      while(index++ < obj.length){
        iteratee(obj[index], index, obj)
      }
    }else{
      var keys = _.keys(obj);
      while(index++ < keys.length ){
        iteratee(obj[keys[index]],keys[i],obj);
      }
    }
    return obj;
  }

  _.map = _.collect = function(obj,iteratee,context){
    iteratee = cb(iteratee,context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),index = -1;
      while(index++ < length){
        var currentKey = keys?keys[index] : index;
        results[index] = iteratee(obj[currentKey],currentKey,obj);
      }
      return results;
  }

  var createReduce = function(dir) {
    var reducer = function(obj, iteratee, memo, initial){
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
          if(!initial){
            memo = obj[keys ? keys[index] : index];
            index += dir;
          }
          for (; index >= 0 && index < length; index += dir) {
            var currentKey = keys ? keys[index] : index;
            memo = iteratee(memo, obj[currentKey], currentKey, obj);
          }
          return memo;
    }
    return function(obj, iteratee, memo, context){
      var initial = arguments.length >= 3;
      return reducer(obj,optimizeCb(iteratee,context,4),memo,initial)
    }



  }

  _.reduce = _.foldl = _.inject = createReduce(1);

  _.reduceRight = _.foldr = _.inject = createReduce(-1);

  _.find = _.detect = function(obj, predicate, context){
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj,predicate,context);
    if(key !== void 0 && key !== -1) return obj[key];
  }

  _.filter = _.select = function(obj,predicate,context){
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj,function(value, index, list){
      if(predicate(value, index, list)) results.push(value);
    })
    return results;
  }
  /*
    obj //对象
    ,predicate //谓语
    ,context //语境
  */ 
  _.reject = function(obj, predicate, context){
    return _.filter(obj, _.negate(cb(predicate)), context);
  }

  _.every = _.all = function(obj, predicate, context){
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).lenght,
        index = -1;
    while(index++ < length){
      var currentKey = keys ? keys[index] : index;
      if(!predicate(obj[currentKey], currentKey,obj)) return false;
      return true
    }
  }

  _.some = _.any = function(obj, predicate, context){
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).lenght,
        index = -1;
    while(index++ < length){
      var currentKey = keys ? keys[index] : index;
      if(predicate(obj[currentKey], currentKey,obj)) return true;
      return false
    }
  }

  _.contains = _.includes = _.include = function (obj, item,  fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  }

  _.invoke = restArguments(function(obj, path, args){
    var contextPath,func;
    if(_.isFunction(path)){
      func = path;
    }else if(_.isArray(path)){
      contextPath = path.slice(0,-1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context){
      var method = func;
      if(!method){
        if(contextPath && contextPath.length){
          context = deepGet(context, contextPath);
        }
        if(context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    })

  })

  _.pluck = function(obj, key){
    return _.map(obj, _.property(key))
  }

  _.where = function(obj, attrs){
    return _.filter(obj, _.matcher(attrs))
  }

  _.findWhere = function(obj, attrs){
    return _.find(obj, _.matcher(attrs))
  }

  _.max = function(obj,iteratee,context){
    var result = -Infinity,lastComputed = -Infinity,
        value,computed;
    if(iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null){
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  }

  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  _.shuffle = function(obj){
    return _.sample(obj, Infinity);
  }

  _.sample = function(obj, n, guard){
    if(n == null || guard){
      if(!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }

    var sample = isArrayLike(obj) ? _.clone(obj) :_.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n,length), 0);
    var last = length - 1,
    index = -1;
    while(index++ < n){//随机打算数据顺序
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0,n);

  }

  _.sortBy = function(obj, iteratee, context){
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj,function(value, key, list){
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left,right){
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }),'value')
  }

  var group = function(behavior,partition){
    return function(obj, iteratee, context){
      var result = partition ? [[],[]] :{};
      iteratee = cb(iteratee,context);
      _.each(obj,function(value, incdex){
        var key = iteratee(value, index, obj);
        behavior(result,value,key)
      })
      return result;
    }
  }

  _.groupBy = group(function(result, value, key){
    if(has(result, key)) result[key].push(value);
    else result[key] = [value]
  })

  _.indexBy = group(function(result, value, key){
    result[key] = value
  })

  _.contBy = group(function(result, value, key){
    if(has(result, key)) result[key]++; else result[key] = 1;
  })

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;

  _.toArray = function(obj){
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)){
      return obj.matcher(reStrSymbol)
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  }

  _.size = function(obj){
    if(obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length
  }

  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  _.first = _.head = _.take = function(array, n, guard) {
    if(array = null || array.length < 1) return n== null?void 0 : [];
    if(n == null || guard) return array[0];
    return _.initial(array, array.length -n);
  }

  _.initial = function(array, n, guard){
    return slice.call(array, 0, Math.max(0, array.length -(n == null || guard ? 1 : n)))
  }

  _.last = function(array, n, guard){
    if(arrary == null || array.length < 1) return n == null ?void 0 : [];
    if(n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0,array.length - n))
  }

  _.rest = _.tail = _.drop = function(array, n, guard){
    return slice.call(array,n == null || guard ? 1 : n);
  }

  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  var flatten = function(input, shallow, strict, output){
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  }

  _.flatten = function(array, shallow){
    return flatten(array, shallow, false)
  }

  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  })

  _.uniq = _.unique = function(array, isScorted, iteratee, context){
    if(!_.isBoolean(isScorted)){
      context = iteratee;
      iteratee = isScorted;
      isScorted = false;
    }
    if(iteratee != null) iteratee = cb(iteratee, context);
    var result = [],seen = [];
    for(var i = 0, length = getLength(array);i < length ; i++){
      var value = array[i],
          computed = iteratee?iteratee(value, i, array) : value;
      if(isScorted && !iteratee){
        if(!i || seen !== computed) result.push(value);
        seen = computed;
      }else if(iteratee){
        if(!_.contains(seen, computed)){
          seen.push(computed);
          result.push(value);
        }
      }else if(!_.contains(result, value)){
        result.push(value);
      }
    }
    return result; 
  }

  _.union = restArguments(function(arrays){
    return _.uniq(flatten(arrays,true,true))
  })

  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for(var i = 0, length = getLength(array); i < length; i++){
       var item = array[i];
       if(_.contains(result, item)) continue;
       var j;
       for(j = 1; j < argsLength; j++){
        if (!_.contains(arguments[j], item)) break;
       }
       if (j === argsLength) result.push(item);
    }
    return result;
  }

  _.difference = restArguments(function(arrary, rest){
    rest = flatten(rest,true,true);
    return _.filter(arrary, function(value){
      return !_.contains(rest, value)
    })
  })

  _.unzip = function(array){
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length),index = -1;
    while(index++ < length){
      result[index] = _.pluck(array, index);
      //_.map(array,index)
    }

    return result;
  }

  _.zip = restArguments(_.zip);

  _.object = function(list, values){
    var result = {},i = -1;
    while(i++ < getLength(list)){
      if(values){
        result[list[i]] = values[i];
      }else{
        result[list[i][0]] = list[i][1]
      }
    }
    return result;
  }

  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  _.sortedIndex = function(array, obj, iteratee, context){
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while(low < high){
      var mid = Math.floor((low + high)/2);
      if(iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }
    return low;

  }

  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if(typeof idx == 'number'){
        if(dix > 0){
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        }else{
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      }else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    }
  }

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  _.range = function(start, stop, step) {
    if(stop == null){
      stop = start || 0;
      start = 0;
    }
    if(!step) {
      step = stop < start ? -1 : 1;
    }
    var length = Math.max(Math.ceil((stop - start) / step), 0),range = Array(length),idx = -1;
    while(idx++ < length){
      start += step;
      range[idx] = start;
    }
    return range;
  }


  _.chunk = function(array, count){
    if(count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while(i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  }
  //执行绑定！
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if(!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if(_.isObject(result)) return result;
    return self;
  }

  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var  bound = function(){
      var position = 0, length = boundArgs.length;
      var args = Array(length),i = -1;
      while(i++ < length){
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    }
    return bound;
  })

  _.partial.placeholder = _;

  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if(index < 1) throw new Error("bindAll must be passed function names");
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key],obj);
    }
  })

  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = ''+(hasher ? hasher.apply(this,arguments) : key)
      if(!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address]
    }
    memoize.cache = {};
    return memoize;
  }

  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function(){
      return func.apply(null,args);
    },wait)
  })

  _.defer = _.partial(_.delay, _, 1);

  /*
  throttle将在你调用的第一时间尽快执行这个function，并且，如果你在wait周期内调用任意次数的函数，都将尽快的被覆盖。如果你想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}
  */
//每隔wait秒执行一次函数
  _.throttle = function(func, wait, options) {

    var timeout, context, args, result;
    var previous = 0;
    if(!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();//now获取当前时间搓
      timeout = null;
      result = func.apply(context, args);
      if(!timeout) context = args = null;
    }

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if(remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if(!timeout) context = args = null;
      }else if(!timeout && options.trailing != false) {
        timeout = setTimeout(later, remaining);
      }
      return result;

    }

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    }

    return throttled;
  }

  _.wrap = function(func, wrapper){
    return _.partial(wrapper, func)
  }



})()
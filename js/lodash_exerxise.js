function baseSlice(array,start,end){
	var index=-1,
		length = array.length;
	if(start < 0){
		start = -start>length?0:(length + start)
	}	
	end = end > length?length : end;
	if(end < 0){
		end += length;
	}	
	length = start > end ?0:((end - start) >>> 0);
	start >>>= 0;
	var result = Array(length);
	while(++index < length){
		result[index] = array[start+index];
	}
	return result;
}

function initial(array){
	var length = array == null ? 0 : array.length;
	return length?baseSlice(0,-1):[];
}

function test(aa,bb){
	console.info('我是测试函数的')
}

function intersection(){
	var array = arguments,index = -1,length = arguments.length,result = [];
	while(index++ < length){
		var array2 = array[index];
		
	}
	
}

function flatArray
function flatArray
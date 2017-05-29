//精灵加载以及保存
(function(window,undefined){

var MotaSprites = (function(){

	var mSprites = {}; //保存精灵

	var loadingNum = 0,  //已加载的精灵
		failNum = 0, 	//加载失败的精灵
		totalNum = 0;    //精灵总数

	//创建新精灵表
	var addNewSprites = function(sprites,callback){
		
		if( Object.prototype.toString.call(sprites) != "[object Array]" || sprites.length == 0) 
		return false;

		totalNum += sprites.length;

		//队列加载
		loadSprite(sprites,0,callback);
	};

	var addNewSprite = function(sprite,callback){
		if(!sprite) return false;

		addNewSprites([sprite],callback);
	};

	//排队加载精灵表
	var loadSprite = function(sprites,idx,callback){

		var sprite = sprites[idx],name,src,img = document.createElement("img");

		callback = callback || function(){};

		if( Object.prototype.toString.call(sprite) != '[object Object]' ){
			callback();
			return false;
		};
		
		name = sprite.name,
		src = sprite.src;

		//进行下一次加载
		var goNext = function(){
			loadSprite(sprites,idx+1,callback);
		};

		if( !name || !src ) {
			console.log("创建精灵时name或src项遗失,将舍弃本次操作");
			goNext();
			return false;
		}

		img.onload = function(){
			mSprites[name] = img;
			loadingNum++;
			goNext();
		};

		img.onerror = function(){
			console.log("key “"+name+ "” 所对应的图片加载失败");
			failNum++;
			goNext();
		};

		img.src = src;

	};

	//实时提供加载信息
	var getUploadMsg = function(){
		return {
			total : totalNum,
			loaded : loadingNum,
			failed : failNum
		};
	};

	//获取所有精灵表
	var getSprites = function(){
		return mSprites;
	};

	//获取精灵表
	var getSprite = function(key){
		return mSprites[key] || null;
	};

	//获取精灵
	var getCharImage = function(name,x,y,width,height,scale){

		if( !name || !mSprites[name] ) return null;

		var canvas = document.createElement("canvas"),
			cxt = canvas.getContext("2d"),
			img = mSprites[name];

		scale = scale || 1;
		canvas.width = width * scale;
		canvas.height = height * scale;
		cxt.drawImage(img,x,y,width,height,0,0,width * scale,height * scale);
		return canvas;
	};

	//打印精灵表
	var printSprites = function(){
		console.log(mSprites);
	};

	return {
		print : printSprites,
		getMsg : getUploadMsg,
		add : addNewSprite,
		addGroup : addNewSprites,
		getSprite : getSprite,
		getSprites : getSprites,
		getCharImage : getCharImage
	};

})();


if( typeof module !== "undefined" && module.exports ){
	module.exports = MotaSprites;
} else if( typeof define == "function" && define.amd ){
	define(function(){ return MotaSprites; });
} else {
	window.MotaSprites = MotaSprites;
}


})(window);
(function(){

var wantEmoji = function(options){
	options = options || {};
	var selector = options.wrapper || "body";

	this.wrapper = document.querySelector(selector);
	this.row = options.row || 4;

	this.wrapWidth = 0;
	this.count = this.getEMJPackageCount();
	this.init();
};

wantEmoji.prototype = {

	init : function(){
		this.emojis = window.emojis;


		if(this.count > 4)
		this.wrapper.className += " wEmoji wEmoji-more";
		else
		this.wrapper.className += " wEmoji";

		this.wrapWidth = this.wrapper.clientWidth;

		this.initTemplete();
	},

	//初始化模板
	initTemplete : function(){

		var tpl = '<div class="wEmoji-header">'+
					'<div class="wEmoji-prev-btn">&lt;</div>'+
					'<div class="wEmoji-nav">'+
						'<div class="wEmoji-row"></div>'+
					'</div>'+
					'<div class="wEmoji-next-btn">&gt;</div>'+
				'</div>'+
				'<div class="wEmoji-container">'+
					'<div class="wEmoji-content"></div>'+
					'<div class="wEmoji-pages"></div>'+
				'</div>';

		this.wrapper.innerHTML = tpl;

		this.initData();
		this.bindEvent();
	},

	//生成数据
	initData : function(){
		var emojis = this.emojis,
			wrapper = this.wrapper,
			navRow = wrapper.querySelector(".wEmoji-row"),
			content = wrapper.querySelector(".wEmoji-content");

		//减少重排
		wrapper.style.display = "none";
		content.innerHTML = "";

		for( var key in emojis ){
			var emj = emojis[key];
				
			content.appendChild(this.__initContent(key,emj));
			navRow.innerHTML += '<div class="wEmoji-list" data-eid="'+key+'">'+emj.name+'</div>';
		}

		this.initStyle();
		this.wrapper.style.display = "block";
	},

	//初始化样式
	initStyle : function(){
		var wrapper = this.wrapper,
			navRow = wrapper.querySelector(".wEmoji-row");
	},

	//生成每页具体数据
	__initContent : function(key,emj){
		var row = this.row, 							//行数
			col = emj.col,								//每行表情个数
			wrapWidth = this.wrapWidth,
			sources = emj.sources,
			path 	= emj.path,
			totalNum = sources.length,
			eachPageNum = col * row, 					//分页后每页最大的表情个数
			pageNum = Math.ceil(totalNum / eachPageNum),//计算分页面数
			column = document.createElement("div");

		column.className = "wEmoji-wrapper";
		column.setAttribute("data-eid",key);
		column.style.width = wrapWidth * pageNum + "px";

		for( var p = 0; p < pageNum; p++ ){
			var tempPage = document.createElement("div"),
				temp = "",idx;
			tempPage.className = "wEmoji-column";
			tempPage.style.width = wrapWidth + "px";
			for( var i = 0; i < eachPageNum; i++ ){
				var url,code;

				idx = p * eachPageNum + i;
				url = sources[idx];
				if(!url){
					break;
				}
				code = '[wem:'+key+"-"+url.substring(0,url.lastIndexOf("."))+'::wem]';
				temp += '<div class="wEmoji-item" data-emj="'+code+'" style="width:'+(100/col)+'%;">'+
							'<img src="'+path+url+'"/>'+
						'</div>';
			}
			tempPage.innerHTML = temp;
			column.appendChild(tempPage);
		}
		return column;
	},

	//绑定事件
	bindEvent : function(){

	},

	//获取需要启用的表情包的数量
	getEMJPackageCount : function(){
		var emojis = this.emojis,
			count = 0;
		for( var key in emojis ){
			if(emojis[key].enable){
				count++;
			}
		}
		return count;
	}
};

if(typeof module != "undefined" && module.exports){
	module.exports = wantEmoji;
} else if( typeof define == "function" && define.amd ){
	define(function(){ return wantEmoji; });
} else {
	window.wantEmoji = wantEmoji;
}

})(window,document,undefined)
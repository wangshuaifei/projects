(function(window,document,Math,undefined){

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

var css3DM = function(){

};

css3DM.prototype = {
	init : function(){
		this.DMArray = []; 	//弹幕数组
		this.rowArray = []; 	//行
		this.TplArray = []; //目前已有的弹幕模板

		this.wrapper = document.querySelector('.css3DM-DMBox');
		this.getData();
	},

	//获取数据
	getData : function(){
		this.setData();
	},

	//设置数据
	setData : function(){
		for( var i = 0; i < 5; i++ ){
			var obj = {};
			obj.img = "1.jpg";
			obj.text = "我是弹幕";
			this.DMArray.push(obj);
		}

		//7行
		for( var j = 0; j < 7; j++ ){
			this.rowArray.push({
				rid : j+1,
				using : false
			});
		}

		this.loop();
	},

	//添加数据
	addData : function(obj){
		this.DMArray.push(obj);
	},

	//添加数据(群)
	addDatas : function(arr){
		this.DMArray = this.DMArray.concat(arr);
	},

	//获取空闲行
	getRow : function(){
		for( var i = 0 , row; row = this.rowArray[i++]; ){
			if( !row.using ){
				return row;
			}
		}

		return false;
	},

	//开始显示弹幕
	showDM : function(){
		var DM = this.DMArray.shift();
		if(!DM) 
		return false;
		
		var row,tpl,div;

		row = this.getRow() || { rid : ((1 + Math.random() * 7) >> 0), using : false, fast: true };
		row.using = true;
		div = document.createElement("div");
		div.className = "css3DM-DMList";
		div.setAttribute("data-type","end");
		div.setAttribute("data-status","stop");
		div.setAttribute("data-row",row.rid);

		tpl = '<div class="css3DM-DMphoto">'+
				'<img src="'+DM.img+'" />'+
			'</div>'+
			'<div class="css3DM-DMtext">'+DM.text+'</div>';

		div.innerHTML = tpl;
		this.wrapper.appendChild(div);
		this.listens(div,row);
	},

	listens : function(ele,row){
		var _self = this;
		setTimeout(function(){
			_self.listen(ele,row);
		},15);
	},

	//监听动画完结
	listen : function(ele,row){
		if( "transitionEnd" in document ){
			this.listen = function(ele,row){
				var _self = this,
					random = (Math.random() * 4 + 1) >> 0,
					type = row.fast ? "fastStart"+random : "start";
				ele.addEventListener("transitionEnd",function(e){
					_self.end(ele,row);
				},false);
				ele.setAttribute("data-type",type);
				ele.setAttribute("data-status","running");
				setTimeout(function(){
					row.using = false;
				},3000);
			};
		} else {
			this.listen = function(ele,row){
				var _self = this,
					random = (Math.random() * 4 + 1) >> 0,
					type = row.fast ? "fastStart"+random : "start";
				ele.addEventListener("webkitTransitionEnd",function(e){
					_self.end(ele,row);
				},false);
				ele.setAttribute("data-type",type);
				ele.setAttribute("data-status","running");
				setTimeout(function(){
					row.using = false;
				},3000);
			};
		}

		this.listen(ele,row);
	},

	//结束滚动以后
	end : function(ele,row){
		this.wrapper.removeChild(ele);
	},

	loop : function(){
		var _self = this;
		requestAnimationFrame(function(){
			_self.loop();
		});
		this.showDM();
	}

};

window.css3DM = css3DM;

})(window,document,Math);
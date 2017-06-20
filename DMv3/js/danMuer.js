(function(window,Math,undefined){

const loop = Symbol("loop");
const init = Symbol("init"); 		//初始化
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
//es6
class normalDM{
	constructor(cv,opts = {}){

		this.save = [];
		this.canvas = cv;
		this.cxt = cv.getContext('2d');

		this.width = 0;
		this.height = 0;
		
		this.rows = {
			slide : [],
			top : [],
			bottom : []
		}; //存放不同类型弹幕的通道数

		this.leftTime = opts.leftTime || 2000;  //头部、底部静止型弹幕的是显示时长
		this.space = opts.space || 10;  		//弹幕的行距
		this.unitHeight = 0; 					//弹幕的高度
		this.rowNum = 0;						//通道行数


		this.startIndex = 0;		//循环时的初始下标
		this.looped = false;		//是否已经经历过一次循环

		this.changeStyle(opts);

	}

	//更新canvas size
	getSize(){

		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.countRows();
	}

	//生成通道行
	countRows(){

		//保存临时变量
		let unitHeight = parseInt(this.globalSize) + this.space;
		let [rowNum , rows] = [
			( ( this.height - 20 ) / unitHeight ) >> 0,
			this.rows
		];

		//重置通道
		for( let key of Object.keys(rows) ){
			rows[key] = [];
		}

		//重新生成通道
		for( let i = 0 ; i < rowNum; i++ ){
			let obj = {
				y : unitHeight * i + 20
			};
			rows.slide.push(obj);

			i >= rowNum / 2 ? rows.bottom.push(obj) : rows.top.push(obj);
		}

		//更新实例属性
		this.unitHeight = unitHeight;
		this.rowNum = rowNum;
	}

	//获取通道
	getRow(item){
		
		//如果该弹幕正在显示中，则返回其现有通道
		if( item.row ) 
		return item.row;

		//获取新通道
		const [rows,type] = [this.rows,item.type];
		const row = ( type != "bottom" ? rows[type].shift() : rows[type].pop() );
		//生成临时通道
		const tempRow = {
			y : 20 + this.unitHeight * ( ( Math.random() * this.rowNum ) << 0 ),
			speedChange : (type == "slide")
		};

		//返回分配的通道
		return row || rempRow;

	}

	//添加
	add(obj){
		if(!obj) return;

		//如果已经可以计算文本宽度，则直接进行计算
		if(this.looped)
		this.countWidth([obj]);

		this.save.push(obj);
	}

	//清除
	clear(){
		this.save = [];
	}

	//改变全局样式
	changeStyle(opts = {}){
		//文本属性保存
		this.globalSize = opts.fontSize || this.globalSize || "24px";   //字体大小
		this.globalFamily = opts.fontFamily || this.globalFamily || "微软雅黑"; //字体
		this.globalStyle = opts.fontStyle || this.globalStyle || "normal"; //字体样式
		this.globalWeight = opts.fontWeight || this.globalWeight || "normal"; //字体粗细
		this.globalColor = opts.fontColor || this.globalColor || "#ffffff"; //字体颜色

		//表示进行过一次全局样式变化
		this.globalChanged = true;
	}

	//启用全局样式
	initStyle(cxt){

		this.globalChanged = false;

		//合并font属性
		this.font();

		//更新全局样式
		cxt.font = this.globalFont;
		cxt.textBaseline = "middle";
		cxt.fillStyle = this.globalColor;

	}

	//计算宽度
	countWidth(items,cxt = this.cxt){

		this.looped = true;

		let [ cw , i , item ] = [this.width, 0];
		for( ; item = items[i++]; ){
			let w = cxt.measureText(item.text).width >> 0;
			item.width = w;
			item.x = cw + 20;
			if(item.type != "slide")
			item.x = (cw - w ) / 2;
		}
	}

	//合并字体
	font(){
		this.globalFont = this.globalStyle + 
					" normal"+
					" " + this.globalWeight + 
					" " + this.globalSize + 
					" " + this.globalFamily;
	}

	//更新每个弹幕的单独样式
	updateStyle(item,cxt){
		cxt.font = this.globalStyle + 
					" normal"+
					" " + this.globalWeight + 
					" " + item.globalSize + 
					" " + this.globalFamily;
		cxt.fillStyle = item.color || this.globalColor;
	}

	//重置弹幕
	reset(resetIndex = 0){

		//resetIndex表示想要开始重置的弹幕的下标，系统想重置该值以后的弹幕

		let [items, w, leftTime, i, item] = [this.save, this.width, this.leftTime, resetIndex];

		for( ; item = items[i++]; ){
			if(item.type == "slide"){
				item.x = w;
				item.rowRid = false;
			} else {
				item.leftTime = leftTime
			}
			item.recovery = false;
		}
		this.startIndex = 0;
	}

	//计算
	step(item,time){

		let row = this.getRow(item); //取得通道

		//如果通道已满，则新弹幕变更速度防止弹幕重叠
		if(row.speedChange){
			row.speedChange = false;
			item.speed += ( Math.random() * 3 + 1 ) >> 0;
		}

		//更新参数
		item.leftTime ? item.leftTime -= time : "";
		item.x -= ( item.speed * time / 16 ) >> 0;
		item.y = item.y || row.y;
		item.row = row;
	}

	//绘制
	draw(item,cxt){
		//如果已经显示完成，则不显示
		if(item.recovery) return false;

		cxt.save();
		if( item.change ) {
			this.updateStyle(item,cxt);
		}
		cxt.fillText(item.text,item.x,item.y);
		cxt.restore();

	}

	//回收弹幕和通道
	recovery(item,w){
		
		if( item.type == "slide" ){
			item.recovery = this.recoverySlide(item,w);
			return false;
		}
		
		item.recovery = this.recoveryStatic(item);
	}

	recoverySlide(item,w){

		let x = item.x;
		let iw = item.width;

		if( !item.rowRid && x + iw + 20 <= w ){
			this.rows[item.type].unshift(item.row);
			item.rowRid = true;
		}

		if( x > - iw)
		return false;

		return true;
	}

	recoveryStatic(item){
		if(item.leftTime > 0 )
		return false;

		this.rows[item.type].unshift(item.row);

		return true;
	}

	//更新下标
	refresh(items){
		let [i,item] = [this.startIndex];
		for( ; item = items[i++]; ){
			if(!item.recovery) return false;
			this.startIndex = i;
			item.row = null;
		}
	}

	update(w,h,time){

		let items = this.save;
		let cxt = this.cxt;

		cxt.clearRect(0,0,w,h);

		this.globalChanged && this.initStyle(cxt); //初始化全局样式

		!this.looped && this.countWidth(items); //计算文本宽度以及初始化位置（只执行一次）

		this.refresh(items); //更新初始下标startIndex

		let [i,item] = [this.startIndex];
		for(  ; item = items[i++]; ){
			this.step(item,time);
			this.draw(item,cxt);
			this.recovery(item,w);
		}

	}

}

//main
class DM {
	//初始化
	constructor(wrap,opts = {}){

		if(!wrap){
			throw new Error("没有设置正确的wrapper");
		}

		//datas
		this.wrapper = wrap;
		this.width = wrap.clientWidth;
		this.height = wrap.clientHeight;
		this.canvas = document.createElement("canvas");
		this.canvas2 = document.createElement("canvas");
		this.normal = new normalDM(this.canvas,opts);

		this.name = opts.name || "";

		//status
		this.drawing = opts.auto || false;
		this.startTime = new Date().getTime();

		//fn
		this[init]();
		this[loop]();
	}

	inputData(obj = {}){
		if( typeof obj != "object" || !obj.type ){
			return false;
		}
		this.normal.add(obj);
	}

	[init](){
		this.canvas.style.cssText = "position:absolute;z-index:100;";
		this.canvas2.style.cssText = "position:absolute;z-index:101;";
		this.setSize();
		this.wrapper.appendChild(this.canvas);
		this.wrapper.appendChild(this.canvas2);
	}

	//设置宽高
	setSize( w = this.width, h = this.height){

		if(!Number.isInteger(w) || w < 0 || !Number.isInteger(h) || h < 0) 
		return false;

		this.canvas.width = w;
		this.canvas.height = h;
		this.canvas2.width = w;
		this.canvas2.height = h;

		this.normal.getSize();
	}

	//启用
	start(){
		if(this.drawing)
		return false;

		this.drawing = true;
		this[loop]();
	}

	//停止
	stop(){
		this.drawing = false;
	}

	//loop
	[loop](normal = this.normal,prev = this.startTime){
		
		if(!this.drawing){
			return false;
		}

		let now = new Date().getTime();

		normal.update(this.width,this.height,now - prev);

		requestAnimationFrame( () => { this[loop](normal,now); } );
	}

}

let DMer = new DM(document.querySelector(".wrapper"),{
	name : "dm1",
	fontColor : "#66ccff"
});

DMer.start();

setInterval(function(){
	let i = Math.random() * 1000 >> 0;
	DMer.inputData({
		text : "hello, " + i,
		type : "top",
		speed : 0,
		leftTime : 2000
	});
},1000);

setInterval(function(){
	let i = Math.random() * 1000 >> 0;
	DMer.inputData({
		text : "hello, " + i,
		type : "bottom",
		speed : 0,
		leftTime : 2000
	});
},700);

let d = new DM(document.querySelector(".wrapper2"),{
	name : "dm2"
});

d.start();

setInterval(function(){
	let i = Math.random() * 200 >> 0;
	d.inputData({
		text : "world, " + i,
		type : "slide",
		speed : 2
	});
},500);

})(window,Math);
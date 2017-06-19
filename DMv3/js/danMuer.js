(function(window,undefined){

const loop = Symbol("loop");
const init = Symbol("init"); 		//初始化

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
		};
		this.leftTime = opts.leftTime || 2000;
		this.space = opts.space || 10;
		this.unitHeight = 0;
		this.rowNum = 0;


		this.startIndex = 0;
		this.looped = false;

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
		let unitHeight = parseInt(this.globalSize) + this.space;
		let rowNum = ( (this.height - 20) / unitHeight ) >> 0;

		let rows = this.rows;

		for( let key of Object.keys(rows) ){
			rows[key] = [];
		}

		for( let i = 0 ; i < rowNum; i++ ){
			let obj = {
				y : unitHeight * i + 20,
				enable : true
			};
			rows.slide.push(obj);

			i < rowNum / 2 ? rows.bottom.push(obj) : rows.top.push(obj);
		}

		this.unitHeight = unitHeight;
		this.rowNum = rowNum;
	}

	//获取通道
	getRow(item){
		
		if( item.row ) return item.row;

		let type = item.type;
		let row = this.rows[type].shift();

		return row || {
			y : this.unitHeight * ( ( Math.random() * this.rowNum ) >> 0 ) + 20,
			speedChange : type == "slide" ? true : false
		};

	}

	//添加
	add(obj){
		if(!obj) return;

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
		this.globalSize = opts.fontSize || this.globalSize || "24px";   //字体大小
		this.globalFamily = opts.fontFamily || this.globalFamily || "微软雅黑"; //字体
		this.globalStyle = opts.fontStyle || this.globalStyle || "normal"; //字体样式
		this.globalWeight = opts.fontWeight || this.globalWeight || "normal"; //字体粗细
		this.globalColor = opts.fontColor || this.globalColor || "#ffffff"; //字体颜色

		this.globalChanged = true;
	}

	//启用全局样式
	initStyle(cxt){

		this.globalChanged = false;

		this.font();

		cxt.font = this.globalFont;
		cxt.textBaseline = "middle";
		cxt.fillStyle = this.globalColor;

	}

	//计算宽度
	countWidth(items,cxt = this.cxt){
		this.looped = true;
		for( let [i,item] = [0]; item = items[i++]; ){
			let w = cxt.measureText(item.text).width >> 0;
			item.width = w;
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

	//更新单独样式
	updateStyle(item,cxt){
		cxt.font = this.globalStyle + 
					" normal"+
					" " + this.globalWeight + 
					" " + item.globalSize + 
					" " + this.globalFamily;
		cxt.fillStyle = item.color || this.globalColor;
	}

	//重置弹幕
	reset(){
		let items = this.save;
		let [w,leftTime] = [this.width,this.leftTime];
		for( let [i,item] = [0]; item = items[i++]; ){
			if(item.type == "slide"){
				item.x = w;
			} else {
				item.leftTime = leftTime
			}
			item.recovery = false;
		}
		this.startIndex = 0;
	}

	//计算
	step(item){

		let row = this.getRow(item);

		if(row.speedChange){
			row.speedChange = false;
			item.speed += ( Math.random() * 3 + 1 ) >> 0;
		}

		item.x -= item.speed;
		item.y = row.y;
		item.row = row;
	}

	//绘制
	draw(item,cxt){
		cxt.save();
		if( item.change ) {
			this.updateStyle(item,cxt);
		}
		cxt.fillText(item.text,item.x,item.y);
		cxt.restore();
	}

	//回收弹幕
	recovery(item,w){
		
		if( item.type == "slide" ){
			item.recovery = this.recoverySlide(item,w);
			return false;
		}
		
		item.recovery = this.recoveryStatic(item);
	}

	recoverySlide(item,w){
		if(item.x > -item.width)
		return false;

		return true;
	}

	recoveryStatic(item){
		if(item.leftTime > 0 )
		return false;

		return true;
	}

	//更新下标和回收通道
	refresh(items){
		for( let [i,item] = [this.startIndex]; item = items[i++]; ){
			if(!item.recovery) return false;
			this.startIndex = i;
			this.rows[item.type].push(item.row);
			item.row = null;
		}
	}

	update(w,h){

		let items = this.save;
		let cxt = this.cxt;

		cxt.clearRect(0,0,w,h);

		this.globalChanged && this.initStyle(cxt);

		!this.looped && this.countWidth(items);

		this.refresh(items);

		for( let [i,item] = [this.startIndex] ; item = items[i++]; ){
			this.step(item);
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

	initData(data = {}){
		let w = this.width;
		for( let i = 0; i < 10; i++ ){
			let obj = {
				text : "hello"+i,
				x : w + 10,
				y : 0,
				speed : 2,
				type : "slide"
			};

			this.normal.add(obj);
		}
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

		normal.update(this.width,this.height);

		requestAnimationFrame( () => { this[loop](normal,now); } );
	}

}

let DMer = new DM(document.querySelector(".wrapper"),{
	name : "dm1"
});

DMer.initData();
DMer.start();

/*let d = new DM(document.querySelector(".wrapper2"),{
	name : "dm2"
});*/

})(window);
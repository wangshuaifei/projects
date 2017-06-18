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
		this.space = opts.space || 10;
		this.unitHeight = 0;
		this.rowNum = 0;


		this.startIndex = 0;

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
		let rowNum = ( (this.height - 40) / unitHeight ) >> 0;

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
	initStyle(){
		this.font();

		let cxt = this.cxt;

		cxt.font = this.globalFont;
		cxt.textBaseline = "middle";
		cxt.fillStyle = this.globalColor;

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

	step(item,speed = item.speed){

		let row = this.getRow(item);

		speed = row.speedChange ? speed + ( Math.random() * 3 + 1 ) >> 0 : speed;

		item.x -= speed;
		item.y = row.y;
		item.row = row;
	}

	draw(item,cxt){
		cxt.save();
		if( item.change ) {
			this.updateStyle(item,cxt);
		}
		cxt.fillText(item.text,item.x,item.y);
		cxt.restore();
	}

	update(w,h){

		let items = this.save;
		let cxt = this.cxt;

		cxt.clearRect(0,0,w,h);

		this.globalChanged && this.initStyle();

		for( let [i,item] = [this.startIndex] ; item = items[i++]; ){
			this.step(item);
			this.draw(item,cxt);
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

		//fn
		this[init]();
		this[loop]();
	}

	initData(data = {}){
		this.normal.add({
			text : "hello",
			x : this.width + 10,
			y : 0,
			speed : 2,
			type : "slide"
		});
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
	[loop](normal = this.normal){

		if(!this.drawing){
			return false;
		}

		normal.update(this.width,this.height);

		requestAnimationFrame( () => { this[loop](normal); } );
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
(function(window,undefined){

const loop = Symbol("loop");
const wrapper = Symbol("wrapper");	//弹幕容器
const canvas = Symbol("canvas");	//放置普通弹幕的canvas
const canvas2 = Symbol("canvas2");  //放置高级弹幕的canvas
const drawing = Symbol("drawing"); 	//是否绘制
const init = Symbol("init"); 		//初始化

const width = Symbol("width");		//宽度
const height = Symbol("height");	//高度

//es6
class Draw{

}

class DM {
	//初始化
	constructor(wrap,opts = {}){

		if(!wrapper){
			throw new Error("没有设置正确的wrapper");
		}

		//datas
		this[wrapper] = wrap;
		this[width] = wrap.clientWidth;
		this[height] = wrap.clientHeight;
		this[canvas] = document.createElement("canvas");
		this[canvas2] = document.createElement("canvas");

		//status
		this[drawing] = opts.auto || false;

		//fn
		this[init]();
		this[loop]();
	}

	[init](){
		this[canvas].style.cssText = "position:absolute;z-index:100;";
		this[canvas2].style.cssText = "position:absolute;z-index:101;";
		this.setSize();
		this[wrapper].appendChild(this[canvas]);
		this[wrapper].appendChild(this[canvas2]);
	}

	//设置宽高
	setSize( w = this[width], h = this[height]){

		if(!Number.isInteger(w) || w < 0 || !Number.isInteger(h) || h < 0) 
		return false;

		this[canvas].width = w;
		this[canvas].height = h;
		this[canvas2].width = w;
		this[canvas2].height = h;
	}

	//启用
	start(){
		if(this[drawing])
		return false;

		this[drawing] = true;
		this[loop]();
	}

	//停止
	stop(){
		this[drawing] = false;
	}

	//loop
	[loop](){

		
		
		if(!this[drawing]){
			return false;
		}

		requestAnimationFrame( () => { this[loop](); } );
	}

}

let DMer = new DM(document.querySelector(".wrapper"));

})(window);
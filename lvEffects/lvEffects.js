;(function(window,document,undefined){

var lvEffects = (function(){

	var lvEffects = function( selector ){

		return new lvEffects.fn.init( selector );

	};

	lvEffects.fn = lvEffects.prototype = {
		constructor : lvEffects,
		version : "lve-1.0.0",
		init : function ( selector ){
			var selectors,i = 0,len;

			this.elements = [];

			if(lvEffects.isElemNode(selector)){
				this.elements[0] = {};
				selector.lvEffectsData = selector.lvEffectsData || {};
				this.elements[0].elem = selector;
				return this;
			}

			selectors = document.querySelectorAll(selector);
			len = selectors.length;

			for( ; i < len; i++ ){
				this.elements[i] = {};
				selectors[i].lvEffectsData = selectors[i].lvEffectsData || {};
				this.elements[i].elem = selectors[i];
			}

			return this;
		},

		/****************selector***********************/
		end : function(){
			return this.prevObjects ? this.prevObjects : this;
		},

		find : function(selector){
			var elems = this.elements,
				result = [],
				rLen,
				tempElems = [],
				len = elems.length,
				i = 0,
				j, k = 0;

			if(!selector || !lvEffects.isString(selector)){
				return this;
			}

			selector = lvEffects.trim(selector);

			for( ; i < len; i++ ){
				result = elems[i].elem.querySelectorAll(selector);
				rlen = result.length;
				for( j = 0; j < rlen; j++){
					tempElems[k] = {};
					result[j].lvEffectsData = result[j].lvEffectsData || {};
					tempElems[k].elem = result[j];
					k++;
				}
			}
			//去重
			tempElems = lvEffects.uniqueNode(tempElems);
			//保存上次操作
			lvEffects.savePrevObjects(this);
			this.elements = tempElems;
			return this;
		},

		eq : function(idx){
			var elems = this.elements,
				len = elems.length;

			if( !idx || !lvEffects.isNum(idx) ){
				return this;
			}

			lvEffects.savePrevObjects(this);

			this.elements = idx >= len? [] : [elems[idx]];

			return this;
		},

		parent : function(selector){
			var elems = this.elements,
				len = elems.length,
				i = 0,
				tempElems = [],
				target;

			selector = selector || "";

			for( ; i < len; i++ ){
				target = lvEffects.getTargetNode(elems[i].elem,selector);
				if(target){
					tempElems[i] = {};
					target.lvEffectsData = target.lvEffectsData || {};
					tempElems[i].elem = target;
				}	
			}

			tempElems = lvEffects.uniqueNode(tempElems);

			lvEffects.savePrevObjects(this);

			this.elements = tempElems;

			return this;
		},

		/*****************utils*******************/


		/****************effects*****************/
		//向目标元素的父元素附加3D效果
		create3DStyle : function(options){
			options = options || {};
			var elems = this.elements,
				len = elems.length,
				i = 0,
				perspective = options.perspective || "1000px",
				perspectiveOrigin = options.pOrigin || "50% 50%",
				backfaceVisibility = options.backface || "visible";

			for( ; i < len; i++ ){
				elems[i].elem.style.cssText += "-moz-transform-style: preserve-3d;" + 
										"-webkit-transform-style: preserve-3d;" + 
										"transform-style: preserve-3d;"+
										"-moz-perspective : "+perspective+";"+
										"-webkit-perspective : "+perspective+";"+
										"perspective : " +perspective + ";"+
										"-moz-perspective-origin : " +perspectiveOrigin+";"+
										"-webkit-perspective-origin : " +perspectiveOrigin+";"+
										"perspective-origin: " + perspectiveOrigin + ";" +
										"-moz-backface-visibility:" + backfaceVisibility + ";" +
										"-webkit-backface-visibility:" + backfaceVisibility + ";" +
										"backface-visibility:"+ backfaceVisibility + ";";
			}

			return this;
		},

		/*
		* options.property (string) : css transition property
		* options.duration (string) : css transition duration (ms/s)
		* options.timing   (string) : css transition timing
		* options.delay    (string) : css transition delay (ms/s)
		*/
		createTransition : function(options){
			var prefix = ["-webkit-","-moz-","-o-","-ms-",""],
				plen = prefix.length,
				elems = this.elements,
				len = elems.length,
				tempStr = [],
				tempProperty,
				property,
				duration,
				timing,
				delay,
				i=0,j,ele;

			options = options || {};

			for( ; i < len; i++ ){
				tempStr.length = 0;
				ele = elems[i].elem;
				lvEffectsData = ele.lvEffectsData;
				property = options.property  || lvEffectsData.property || "all";
				duration = options.duration  || lvEffectsData.duration || "300ms";
				timing   = options.timing    || lvEffectsData.timing   || "ease";
				delay 	 = options.delay     || lvEffectsData.timing   || "0ms";
				tempProperty = "";
				for( j = 0; j < plen; j++ ){
					tempProperty = property.replace(/transform/g,prefix[j]+"transform");
					tempStr.push(prefix[j] + "transition-property:" 		 + tempProperty + ";");
					tempStr.push(prefix[j] + "transition-duration:" 		 + duration + ";");
					tempStr.push(prefix[j] + "transition-timing-function:"   + timing   + ";");
					tempStr.push(prefix[j] + "transition-delay:"    		 + delay    + ";");
				}
				lvEffectsData.property = property;
				lvEffectsData.duration = duration;
				lvEffectsData.timing   = timing;
				lvEffectsData.delay    = delay;
				ele.style.cssText += tempStr.join(" ");
			}

			return this;
		},

		/*
		* options  (object)   : css transform value
		* callback (function) : callback function
		*/
		transform3d : function(options,callback){
			options = options || {};
			callback = callback || function(){};
			var elems = this.elements,
				len = elems.length,
				i = 0;

			for( ; i < len; i++ ){
				this.useTransform(elems[i].elem,options);
			}

			this.transitionEnd(callback);

			return this;
		},

		translate3d : function(options,callback){
			var x = options.x || 0,
				y = options.y || 0,
				z = options.z || 0,
				tempObj = {};

			tempObj.translate3d = "("+x+","+y+","+z+")";

			this.transform3d(tempObj,callback);

			return this;
		},

		translateX : function(value,callback){
			this.translate3d({
				x : value,
				y : "none",
				z : "none"
			},callback);

			return this;
		},

		translateY : function(value,callback){
			this.translate3d({
				y : value,
				x : "none",
				z : "none"
			},callback);

			return this;
		},

		translateZ : function(value,callback){
			this.translate3d({
				z : value,
				x : "none",
				y : "none"
			},callback);

			return this;
		},

		left : function(value,callback){
			this.translateX(value,callback);
			return this;
		},

		top : function(value,callback){
			this.translateY(value,callback);
			return this;
		},

		scale3d : function(options,callback){
			var x = options.x || 1,
				y = options.y || 1,
				z = options.z || 1,
				tempObj = {};

			tempObj.scale3d = "("+x+","+y+","+z+")";

			this.transform3d(tempObj,callback);

			return this;
		},

		scale : function(x,y,callback){
			if( !y || lvEffects.isFunction(y)){
				callback = y;
				y = x;
			}
			this.scale3d({
				x : x,
				y : y,
				z : "none"
			},callback);

			return this;
		},

		scaleX : function(value,callback){
			this.scale3d({
				x : value,
				y : "none",
				z : "none"
			},callback);

			return this;
		},

		scaleY : function(value,callback){
			this.scale3d({
				y : value,
				x : "none",
				z : "none"
			},callback);

			return this;
		},

		scaleZ : function(value,callback){
			this.scale3d({
				z : value,
				x : "none",
				y : "none"
			},callback);

			return this;
		},

		rotate3d : function(options,callback){
			var x = options.x || 0,
				y = options.y || 0,
				z = options.z || 0,
				angle = options.angle || 0,
				tempObj = {};

			tempObj.rotate3d = "("+x+","+y+","+z+","+angle+")";

			this.transform3d(tempObj,callback);

			return this;
		},

		rotate : function(angle,callback){
			this.rotateZ(angle,callback);
			return this;
		},

		rotateX : function(angle,callback){
			this.rotate3d({
				x : 1,
				angle : angle
			},callback);

			return this;
		},

		rotateY : function(angle,callback){
			this.rotate3d({
				y : 1,
				angle : angle
			},callback);

			return this;
		},

		rotateZ : function(angle,callback){
			this.rotate3d({
				z : 1,
				angle : angle
			},callback);

			return this;
		},

		opacity : function(value,callback){
			var elems = this.elements,
				len = elems.length,
				i = 0;

			for( ; i < len; i++ ){
				elems[i].elem.style.cssText += "opacity:"+value;
			}

			return this;
		},
		//向目标元素3d变换进行赋值
		//trans (string) : transform value
		useTransform : function(ele,options){
			var dataset = ele.lvEffectsData,
				dTranslate3d = dataset.translate3d,
				dScale3d = dataset.scale3d,
				translate3d 	= options.translate3d 	||	dTranslate3d		||  "(0,0,0)",
				scale3d 		= options.scale3d 	  	||  dScale3d 			||  "(1,1,1)",
				rotate3d 		= options.rotate3d 	  	||  dataset.rotate3d 	||  "(0,0,0,0)",
				getArray 		= lvEffects.getArrayFromVal,
				translate3dVal 	= getArray(translate3d),
				scale3dVal 		= getArray(scale3d),
				rotate3dVal 	= getArray(rotate3d),
				setTranslate3dVal,
				setScale3dVal,
				trans,
				angle,
				i = 0;

			setTranslate3dVal = dTranslate3d ? getArray(dTranslate3d) : [0,0,0];
			setScale3dVal = dScale3d ? getArray(dScale3d) : [1,1,1];

			for( ; i < 3; i++ ){
				if(translate3dVal[i] == "none"){
					translate3dVal[i] = setTranslate3dVal[i];
				}
				if(scale3dVal[i] == "none"){
					scale3dVal[i] = setScale3dVal[i];
				}
			}

			rotate3dVal[3] = rotate3dVal[3].replace(/deg/g,"");
			angle = rotate3dVal[3] * 1;

			dataset.translate3d = "("+translate3dVal.join(",")+")";
			dataset.scale3d = "("+scale3dVal.join(",")+")";
			dataset.rotate3d = rotate3d;
				
			var nextfix = translate3dVal[0].match(/\D+$/g) || "px";
			for( var x = 0; x < 3; x++ ){
				translate3dVal[x] += "px";
			}
			trans = "translate3d(" + translate3dVal.join(",") +
					") scale3d("+ scale3dVal.join(",") + 
					") rotate3d(" + rotate3dVal.join(",") + 
					"deg)";

			this.eleAddTranform(ele,trans);
		},

		eleAddTranform : function(ele,trans){
			var prefix = ["-webkit-","-moz-","-o-","-ms-",""],
				plen = prefix.length,
				j,
				tempStr = "";

			if(!trans){
				return this;
			}

			for( j = 0; j < plen; j++ ){
				tempStr += (prefix[j] + "transform : " + trans + ";");
			}

			ele.style.cssText += tempStr;

			return this;
		},

		/***********************event*********************/
		transitionEnd : function(callback){
			var _self = this,
				elems = this.elements,
				num = 0, //确保所有transitionend事件的回调只执行一次
				len = elems.length,
				i = 0,
				transitionend =  lvEffects.getTransitionEnd(),
				eventHandle;

			eventHandle = function(e){
				num++;
				if(num == len){
					setTimeout(function(){
						callback.call(_self,e);
					},0);
				}
				e.target.removeEventListener(transitionend,eventHandle,false);
			};

			for( ; i < len; i++ ){
				var ele = elems[i].elem;
				ele.addEventListener(transitionend,eventHandle,false);
			}
		}

	};


	lvEffects.fn.init.prototype = lvEffects.fn;
	
	/***************check****************/
	lvEffects.isArray = function(arr){
		return typeof arr === "array";
	};

	lvEffects.isString = function(str){
		return typeof str === "string";
	};

	lvEffects.isNum = function(num){
		return typeof num === "number";
	};

	lvEffects.isFunction = function(fn){
		return typeof fn === "function";
	};

	lvEffects.isObject = function(obj){
		return Object.prototype.toString.call(obj) === "[object Object]";
	};

	lvEffects.isElemNode = function(ele){
		var htmlReg = /HTML\w+Element/g,
			type = Object.prototype.toString.call(ele);

		if(ele.tagName && htmlReg.test(type)){
			return true;
		}
		return false;
	};

	lvEffects.hasUnit = function(array){
		var perReg = /^\d+(\D+|%)$/g;
		for( var i = 0, len = array.length; i < len; i++ ){
			if(perReg.test(array[i])){
				return true
			}
		}
		return false;
	};

	/*************get**************/
	lvEffects.getSelectorType = function(str){
		var classReg = /^\.\w+/g,
			idReg = /^#\w+/g;

		return classReg.test(str) ? "className" : idReg.test(str) ? "id" : "tagName";
	};

	lvEffects.getTargetNode = function(ele,selector){
		var parent = ele.parentNode,
			regSelector,
			upperRegSelector,
			type,
			reg;

		if(!parent)
		return null;

		if(!!selector){
			type = lvEffects.getSelectorType(selector);
			regSelector = selector.replace(/\.|#/g,"");
			upperRegSelector = regSelector.toUpperCase();
			reg = new RegExp(""+regSelector+"|"+upperRegSelector+"","g");
			return  reg.test(parent[type]) ? parent : lvEffects.getTargetNode(parent,selector);
		}

		return parent;
	};

	lvEffects.getArrayFromVal = function(val){
		var valReg = /(-*(\w\.*)+\,)+-*(\w\.*)+/g;
		return (val.match(valReg))[0].split(",");
	};

	lvEffects.getTransitionEnd = (function(){
		var transitionend;
		return function(){
			transitionend = transitionend || "transition" in document.body.style ? "transitionend" : "webkitTransitionEnd";
			return transitionend;
		};
	})();

	/***************utils*****************/
	lvEffects.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g,"");
	};

	lvEffects.savePrevObjects = function(obj){
		var tempObj = lvEffects.copy(obj);
		obj.prevObjects = tempObj;
	};

	lvEffects.copy = function(obj){
		var tempObj;
		if(lvEffects.isArray(obj)){
			return obj.concat();
		}
		if(lvEffects.isObject(obj)){
			tempObj = {};
			for( var k in obj ){
				tempObj[k] = lvEffects.copy(obj[k]);
			}
			return tempObj;
		}
		return obj;
	};

	lvEffects.unique = function(arr){
		var tempObj = {},
			resultArr = [],
			len = arr.length,
			i = 0,
			ele;

		for( ; i < len; i++ ){
			ele = arr[i];
			if(!tempObj[ele]){
				tempObj[ele] = true;
				resultArr.push(arr[i]);
			}
		}

		return resultArr;
		
	};

	lvEffects.uniqueNode = function(nodes){
		var resultArr = [],
			rlen,
			len = nodes.length,
			hasElem = nodes[0].elem ? true : false,
			i = 0,j,ele,eler,isunique = false;

		resultArr[0] = nodes[0];
		for( ; i < len; i++ ){
			isunique = false;
			rlen = resultArr.length;
			ele = hasElem ? nodes[i].elem : nodes[i];
			for( j = 0; j < rlen; j++ ){
				eler = hasElem ? resultArr[j].elem : resultArr[j];
				if( eler.isEqualNode(ele) && eler === ele ){
					isunique = true;
				}
			}
			if(!isunique)
			resultArr.push(nodes[i]);
		}

		return resultArr;
	};

	//创建3d矩阵
	lvEffects.createMatrix3d = function(translate3dVal,scale3dVal,rotate3dVal){
		var matrix3d,
			x = rotate3dVal[0] / 1,
			y = rotate3dVal[1] / 1,
			z = rotate3dVal[2] / 1,
			n = Math.sqrt( x * x + y * y + z * z),
			angle = rotate3dVal[3] / 180 * Math.PI,
			sx = scale3dVal[0] * 1,
			sy = scale3dVal[1] * 1,
			sz = scale3dVal[2] * 1,
			sc = Math.sin( angle / 2 ) * Math.cos( angle / 2 ),
			sq = Math.sin( angle / 2 ) * Math.sin( angle / 2 ),
			tempArray = [];

		if(n !== 0){
			x = x / n;
			y = y / n;
			z = z / n;
		}

		tempArray[0] = sx * ( 1 - 2 * ( y * y + z * z ) * sq );
		tempArray[1] = sy * ( 2 * ( x * y * sq + z * sc ) );
		tempArray[2] = sz * ( 2 * ( x * z * sq - y * sc ) );
		tempArray[3] = tempArray[7] = tempArray[11] = 0;
		tempArray[4] = sx * ( 2 * ( x * y * sq - z * sc ) );
		tempArray[5] = sy * ( 1 - 2 * ( x * x + z * z ) * sq );
		tempArray[6] = sz * ( 2 * ( y * z * sq + x * sc ) );
		tempArray[8] = sx * ( 2 * ( x * sq * z + y * sc ) );
		tempArray[9] = sy * ( 2 * ( y * z * sq - x * sc ) );
		tempArray[10] = sz * ( 1 - 2 * ( x * x + y * y ) * sq );
		tempArray[12] = translate3dVal[0] * 1;
		tempArray[13] = translate3dVal[1] * 1;
		tempArray[14] = translate3dVal[2] * 1;
		tempArray[15] = "1";

		matrix3d = "matrix3d("+tempArray.join(",")+")";
		
		return matrix3d;
	};

	return lvEffects;

})();

window.lvEffects = lvEffects;

})(window,document);
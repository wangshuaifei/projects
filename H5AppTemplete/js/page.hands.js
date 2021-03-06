define(["hammer"],function(Hammer){

var myHand = function(selector,options){
	options = options || {};
	this.selector = document.querySelector(selector);
	this.hammer = null;
	this.init();

};

myHand.prototype = {

	init : function(){
		this.hammer = new Hammer(this.selector);
	},

	swipe : function(callback){
		callback = callback || function(){};
		this.hammer.on('swipe',callback);
	},

	swipeLeft : function(callback){
		callback = callback || function(){};
		this.swipe(function(ev){
			if(ev.direction == 2){
				callback(ev);
			}
		});
	},

	swipeRight : function(callback){
		callback = callback || function(){};
		this.swipe(function(ev){
			if(ev.direction == 4){
				callback(ev);
			}
		});
	},

	moving : function(callback){
		callback = callback || function(){};
		this.hammer.off("pan",callback);
		this.hammer.on("pan",callback);
	}

};

return myHand;

});
(function(window,undefined){
var D = function(selector,options){

	var opts = {
		//canvas font
		globalFontStyle : "normal",
		globalFontSize : 24,
		globalFontColor : "#ffffff",
		globalShadowBlur : 2,
		globalShadowColor : "rgba(0,0,0,1)",
		globalFontWeight : "bolder",
		globalFontFamily : "微软雅黑",
		//video
		videoUrl : "media/STYX HELIX.mp4",
		videoUrls : [],
		autoplay : false,
		//effects
		upperNum : {
			//当弹幕数超过一定数额时，取消文字的全局特效（如阴影等）
			//ps:火狐爸爸不给力啊，向谷歌势力低头
			"firefox" : 500,
			"safari" : 800,
			"chrome" : 2000,
			"ie" : 900,
			"edge" : 1100
		},
		scale : 1,
		rotate : 0,
		//controls
		DMEachRowSpace : 5, //每一行弹幕之间的间距
		downFrame : 1, //降帧倍率,优化弹幕滚动流畅度	
		loop : false,
		staticDMDuration : 3, //在头部和底部的弹幕显示时间(s)
		//elements
		controls : {
			"play" : ".Dplayer-play",
			"progress" : ".Dplayer-progress",
			"preProgressBar" : ".Dplayer-preProgressBar",
			"progressBar" : ".Dplayer-progressBar",
			"progressBtn" : ".Dplayer-progressBtn",
			"volume" : ".Dplayer-volume",
			"volumeBar" : ".Dplayer-volumeBar",
			"volumeBtn" : ".Dplayer-volumeBtn",
			"volumeIcon" : ".Dplayer-volumeIcon",
			"fullScreen" : ".Dplayer-fullScreen",
			"DMDisplayControl" : ".Dplayer-DMDisplayControl",
			"looper" : ".Dplayer-looper",
			"settings" : ".Dplayer-settings"
		},
		//data
		DM : {
			length : 0,
			textDM : {
				length : 0,
				data : []
			}
		}
	};

	//播放器id
	this.id = document.querySelectorAll(".Dplayer-container").length;
	//播放器容器
	this.wrapper = document.querySelector(selector);
	//播放器宽度
	this.width = this.wrapper.offsetWidth;
	//播放器高度
	this.height = this.wrapper.offsetHeight;
	//获取屏幕宽高(旋转时重新设置)
	this.screenWidth = window.screen.width;
	this.screenHeight = window.screen.height;
	//获取用于控制video的html标签的高度
	this.controlsBoxHeight = 40;
	//检查容器是否小于600px
	this.smallWrapper = this.width < 600 ? true : false;
	//获取设备信息（pc/移动端）
	var ua = navigator.userAgent;
	this.device = (/ipad|iphone|android/i).test(navigator.userAgent) ? "Dplayer-mobile" : "Dplayer-pc";
	this.isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
	//判断浏览器（有些浏览器对文字阴影的绘制效率太坑爹)
	this.isFireFox = ua.indexOf("Firefox") > -1;
	this.isIE = (!!window.ActiveXObject || "ActiveXObject" in window);
	this.isEdge = ua.indexOf("Edge") > -1;
	this.isChrome = ua.indexOf("Chrome") > -1;
	this.isSafari = ua.indexOf("Chrome") < 0 && ua.indexOf("Safari") > -1;
	//是否去除特效
	this.removeSomeEffects = false;
	//设置容器的状态/ small/normal
	this.setWrapperBox(this.smallWrapper);
	//合并选项
	this.options = extend(opts,options);

	this.init();
};

D.prototype.init = function(){
	this.windowResize();
	this.Video.init(this);
	this.Canvas.init(this);//调用Canvas
	this.DMsystem.init(this); //启用弹幕系统
};

D.prototype.Video = {

	init : function(D){
		this.D = D;
		this.createVideo();
	},

	createVideo : function(){
		var video = document.createElement('video');
			video.type = "video/mp4";
		if( !this.isSupportVideo(video) ){
			alert("no html5");
			return false;
		}
		
		this.createCache(video);
		this.appendVideoToWrapper();
		this.createVideoControlsElement();
	},

	createCache : function(video){
		//在本对象里保存用的一些变量
		this.video = video;
		this.duration = 0;
		this.currentTime = 0;
		this.volume = 0;
		this.playing = false;
		this.ending = false;
		this.elem  = {};
	},

	appendVideoToWrapper : function(){
		var videos = this.D.wrapper.querySelectorAll("video");

		for( var i = 0, video; video = videos[i++]; ){
			this.D.wrapper.removeChild(video);
		}

		this.D.wrapper.appendChild(this.video);
		this.resizeVideo();
		this.loadProxyVideo(this.D.options.videoUrl);
	},

	createVideoControlsElement : function(){
		var D = this.D,
			controls = D.options.controls,
			controlsBox = D.wrapper.querySelector('div.Dplayer-controls-box'),
			templetes = "";

		if(controlsBox){
			//如果当前容器已存在相同元素，则进行移除
			D.wrapper.removeChild(controlsBox);
		}
		//创建控制标签
		controlsBox = document.createElement('div');
		templetes   = this.getElementTempletes(controls);

		controlsBox.className = "Dplayer-controls-box";
		controlsBox.innerHTML = templetes;

		D.wrapper.appendChild(controlsBox);
	},

	getElementTempletes : function(controls){
		var templetes = ''+
		'<div class="'+controls.play.substring(1)+' Dplayer-controls-btn" data-type="play"></div>'+
		'<div class="Dplayer-progress-box">'+
			'<div class="'+controls.progress.substring(1)+'">'+
				'<div class="'+controls.preProgressBar.substring(1)+'"></div>'+
				'<div class="'+controls.progressBar.substring(1)+'">'+
					'<div class="'+controls.progressBtn.substring(1)+'"></div>'+
				'</div>'+
			'</div>'+
			'<div class="Dplayer-progress-time">'+
				'<span class="Dplayer-currentTime">00:00</span>'+
				'<span class="Dplayer-duration">00:00</span>'+
			'</div>'+
		'</div>'+
		'<div class="Dplayer-volume-box Dplayer-controls-btn">'+
			'<div class="Dplayer-volume-bglayer">'+
				'<div class="Dplayer-volume-num">100</div>'+
				'<div class="'+controls.volume.substring(1)+'">'+
					'<div class="'+controls.volumeBar.substring(1)+'">'+
						'<div class="'+controls.volumeBtn.substring(1)+'"></div>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="'+controls.volumeIcon.substring(1)+'"></div>'+
		'</div>'+
		'<div class="'+controls.looper.substring(1)+' Dplayer-controls-btn"></div>'+
		'<div class="'+controls.DMDisplayControl.substring(1)+' Dplayer-controls-btn"></div>'+
		'<div class="'+controls.fullScreen.substring(1)+' Dplayer-controls-btn"></div>';

		return templetes;
	},

	resizeVideo : function(){
		this.video.style.width  =  this.D.width + "px";
		this.video.style.height = (this.D.height - this.D.controlsBoxHeight) + "px";
	},

	isSupportVideo : function(video){
		return !!video.canPlayType;
	},

	loadProxyVideo : function(src,callback){

		//代理模式,这里可以干一些其他的事情
		this.loadVideo(src,callback);
	},

	loadVideo : function(src,callback){

		var _self = this,
			video = this.video;

		callback = callback || function(){};

		video.ondurationchange = function(e){
			_self.duration = video.duration;
			_self.resetDuration();
			_self.initEvent(); //初始化事件
			_self.D.resize(); //重新调整各元素大小
			callback(video);
		};

		video.onerror = function(e){
			alert('加载出错');
		};

		video.src = src;
	},

	//event
	initEvent : function(){
		this.bindVideoEvent();
		this.initVideoListener();
	},

	// 给ele元素绑定各自的播放器事件
	bindVideoEvent : function(){
		var wrapper = this.D.wrapper,
			controls = this.D.options.controls,
			_self = this,
			evs = "ontouchstart" in document ? "touchstart" : "mousedown",
			evm = "ontouchstart" in document ? "touchmove" : "mousemove",
			eve = "ontouchstart" in document ? "touchend" : "mouseup",
			click = "ontouchstart" in document ? "touchend" : "click";

		if(this.elem.play){
			return false;
		}

		this.elem.play 			= wrapper.querySelector(controls.play);
		this.elem.progress 		= wrapper.querySelector(controls.progress);
		this.elem.progressBtn 	= wrapper.querySelector(controls.progressBtn);
		this.elem.volumeIcon 	= wrapper.querySelector(controls.volumeIcon);
		this.elem.volume 		= wrapper.querySelector(controls.volume);
		this.elem.volumeBtn 	= wrapper.querySelector(controls.volumeBtn);
		this.elem.looper 		= wrapper.querySelector(controls.looper);
		this.elem.DMDisplayControl 	= wrapper.querySelector(controls.DMDisplayControl);
		this.elem.fullScreen 	= wrapper.querySelector(controls.fullScreen);

		this.elem.progressBar 	= wrapper.querySelector(".Dplayer-progressBar");
		this.elem.progressBox 	= wrapper.querySelector('.Dplayer-progress-box');
		this.elem.volumeNum 	= wrapper.querySelector(".Dplayer-volume-num");
		this.elem.volumeBox 	= wrapper.querySelector(".Dplayer-volume-box");
		this.elem.volumeInnerBox = wrapper.querySelector(".Dplayer-volume-bglayer");
		this.elem.volumeBar 	= wrapper.querySelector(".Dplayer-volumeBar");

		//调整默认设置
		this.D.setLoop(this.D.options.loop);

		// 播放/暂停
		this.elem.play.addEventListener(click,function(e){
			var status = _self.playing ? "pause" : "play";
			_self[status](this);
		},false);

		// 循环
		this.elem.looper.addEventListener(click,function(e){
			var status = _self.video.loop ? false : true;
			_self.video.loop = status;
			_self.changeStyleOfLooper(this,status);
		},false);

		// 清楚/显示 弹幕
		this.elem.DMDisplayControl.addEventListener(click,function(e){
			_self.D.DMsystem.DMDisplay = !_self.D.DMsystem.DMDisplay;
			this.setAttribute("data-display",_self.D.DMsystem.DMDisplay);
		},false);

		//全屏
		this.elem.fullScreen.addEventListener(click,function(e){
			var tarEle = _self.D.wrapper,
				status = (tarEle.getAttribute("data-isFullScreen") == "yes");
				full = status ?
					(document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen) :
					(tarEle.requestFullScreen || tarEle.webkitRequestFullScreen || tarEle.mozRequestFullScreen);

			//如果支持元素全屏
			if(full){
				_self.goElementFullScreen(tarEle,status,full);
				return false;
			}

			//不支持元素全屏/ ios safari，android mobile
			_self.goVideoFullScreen(tarEle,status);

		},false);

		//全屏change
		document.addEventListener("fullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
				wrapper.setAttribute("data-isFullScreen","no");
			}

		},false);

		document.addEventListener("webkitfullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
				wrapper.setAttribute("data-isFullScreen","no");
			}

		},false);

		document.addEventListener("mozfullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
				wrapper.setAttribute("data-isFullScreen","no");
			}

		},false);

		//点击进度条
		this.elem.progress.addEventListener(click,function(e){
			e = e.changedTouches ? e.changedTouches[0] : e;

			var tar = this,
				x = e.clientX - tar.getBoundingClientRect().left,
				currentTime = position2time(x);

			_self.setCurrentTime(currentTime - 1);
			_self.play(_self.elem.play);
		});

		//拖动进度条
		this.elem.progressBtn.addEventListener(evs,function(e){
			e.preventDefault();
			e.stopPropagation();
			this.setAttribute("data-status","dragable");
			_self.pause(_self.elem.play);
		},false);

		this.elem.progress.addEventListener(evm,function(e){
			e.preventDefault();
			e.stopPropagation();

			var btn = _self.elem.progressBtn,
				dragable = btn.getAttribute("data-status");

			if(!dragable || dragable != "dragable"){
				return false;
			}

			var progress = _self.elem.progress,
				x = getMousePositionInElement(progress,e).x,
				offsetX = (x - _self.elem.progressBar.clientWidth) >> 0,
				currentTime = position2time(x);

			btn.style.webkitTransform = "translate3d("+offsetX+"px,0px,0px)";
			btn.style.mozTransform = "translate3d("+offsetX+"px,0px,0px)";
			btn.style.oTransform = "translate3d("+offsetX+"px,0px,0px)";
			btn.style.transform = "translate3d("+offsetX+"px,0px,0px)";

			_self.setCurrentTime(currentTime);
		},false);
	
		//防止拖动后的小bug
		document.body.addEventListener(eve,function(e){
			e.preventDefault();
			e.stopPropagation();
			var btn = _self.elem.progressBtn,
				dragable = btn.getAttribute("data-status");
			if(dragable && dragable == "dragable")
			endProgressDrag(_self.elem.progressBtn);
		},false);

		//点击音量标签
		//打开音量控制选项
		this.elem.volumeIcon.addEventListener(click,function(e){
			e.stopPropagation();
			e.preventDefault();

			if(!_self.isVolumeBoxShow){
				_self.elem.volumeInnerBox.style.display = "block";
				_self.isVolumeBoxShow = true;
				return;
			}

			if(_self.video.volume > 0){
				_self.tempVolume = _self.video.volume;
				_self.setvolume(0);
				return;
			}

			_self.setvolume( (_self.tempVolume * 100) || 100);
		},false);

		//关闭音量控制选项
		this.D.wrapper.addEventListener(click,function(e){
			if(_self.isVolumeBoxShow){
				_self.elem.volumeInnerBox.style.display = "none";
				_self.isVolumeBoxShow = false;
			}
		},false);

		//点击音量条
		this.elem.volumeInnerBox.addEventListener(click,function(e){
			e.stopPropagation();
			e.preventDefault();

			var y = getMousePositionInElement(this,e).y,h,dy;
			y = y < 20 ? 20 : y;
			h = this.clientHeight;
			dy = (( h - y ) * 100 / (h - 20)) >> 0;

			_self.setvolume(dy);
		},false);

		//拖动音量条
		this.elem.volumeBtn.addEventListener(evs,function(e){
			e.preventDefault();
			e.stopPropagation();
			this.setAttribute("data-status","dragable");
		},false);

		this.elem.volumeInnerBox.addEventListener(evm,function(e){
			e.preventDefault();
			e.stopPropagation();

			var dragable = _self.elem.volumeBtn.getAttribute("data-status");

			if(!dragable || dragable != "dragable"){
				return false;
			}

			//因为音量盒的高度比拖动条的高度要高，而我们为了优化体验是在盒子上监听的
			//拖动事件，所以需要对位置和高度进行计算
			var y = getMousePositionInElement(this,e).y,
				h = this.clientHeight,
				dy;

			y  = y < 20 ? 20 : y;
			dy = (( h - y ) * 100 / (h - 20)) >> 0;

			_self.setvolume(dy);

		},false);

		document.body.addEventListener(eve,function(e){
			e.preventDefault();
			e.stopPropagation();
			_self.elem.volumeBtn.setAttribute("data-status","false");
		},false);
		
		/**********************/

		// 杂项
		//进度条拖动结束后触发
		function endProgressDrag(ele){
			ele.setAttribute("data-status","false");
			ele.style.webkitTransform = "translateX(0px)";
			ele.style.mozTransform = "translateX(0px)";
			ele.style.oTransform = "translateX(0px)";
			ele.style.transform = "translateX(0px)";

			_self.play(_self.elem.play);
		}

		//将拖动结束位置转换为跳转时间
		function position2time(x){
			var duration = _self.duration;

			return ( ( duration * x / _self.elem.progress.clientWidth ) << 0 );
		}

		//获取鼠标在元素内的位置
		function getMousePositionInElement(ele,e){
			e = e.touches ? e.touches[0] : e;
			var x = (e.clientX || e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft ) - ele.getBoundingClientRect().left,
				y = (e.clientY || e.pageY - document.body.scrollTop - document.documentElement.scrollTop ) - ele.getBoundingClientRect().top;

			return {
				x : x,
				y : y
			};
		}
	},

	// 监听播放器事件
	initVideoListener : function(){
		var video = this.video,
			_self = this;

		//abort
		video.onabort = function(e){
			//视频中止
		};

		video.onended = function(e){
			//播放结束
			_self.pause(_self.elem.play);
			_self.ending = true;

			//重置弹幕
			_self.D.DMsystem.resetDM(_self.D.Canvas.canvas.width);

			//进行下一个视频的播放
			_self.playNextVideo();
		};

		video.onerror = function(e){
			//播放过程中加载出错
		};

		video.onloadedmetadata = function(e){
			//加载视频信息
		};

		video.onprogress = function(e){
			//加载中
			if(video.readyState == 4){
				var time = (video.buffered.end(0) - video.buffered.start(0)) || 0;
				_self.changeStyleOfProgress(".Dplayer-preProgressBar",time);
			}
		};

		video.ontimeupdate = function(e){
			//播放时间更新时
			_self.currentTime = video.currentTime;
			var temp = _self.getTimeFormat(video.currentTime);
			_self.changeStyleOfTime(".Dplayer-currentTime",temp);

			if(_self.playing)
			_self.changeStyleOfProgress(".Dplayer-progressBar",video.currentTime);
		};

		video.onplaying = function(e){
			//播放时
			_self.playing = true;
			_self.ending = false;
		};

		video.onpause = function(e){
			//暂停时
			_self.playing = false;
			var time = video.buffered.end(0) - video.buffered.start(0);
			_self.changeStyleOfProgress(".Dplayer-preProgressBar",time);
		};

		video.onseeked = function(e){
			//进度条跳转时
			_self.currentTime = video.currentTime;
			_self.D.DMsystem.resetDM(_self.D.Canvas.canvas.width); //重置弹幕
		};

		video.onsuspend = function(e){
			//由于出错而导致媒体播放中止
		};

		video.onvolumechange = function(e){
			//音量改变
			_self.volume = video.volume;
			_self.changeStyleOfvolume(video.volume * 100);
		};

		video.onwaiting = function(e){
			//缓冲时
			var time = video.buffered.end(0) - video.buffered.start(0);
			_self.changeStyleOfProgress(".Dplayer-preProgressBar",time);
		};

	},

	// 播放器动作
	play : function(ele){
		var Canvas = this.D.Canvas,
			_self = this;
		this.video.play();
		ele.setAttribute('data-type','pause');

		//重新开始动画
		window.cancelAnimationFrame(this.D.loop);
		this.D.loop = window.requestAnimationFrame(function(time){
			_self.D.step(0,Canvas,_self,_self.D.DMsystem,Canvas.canvas,Canvas.context);
		});
	},

	pause : function(ele){
		this.video.pause();
		ele.setAttribute('data-type','play');
	},

	// 设置播放器参数
	setCurrentTime : function(time){
		this.video.currentTime = time;
	},

	setvolume : function(volume){
		this.video.volume = volume / 100;
	},

	playNextVideo : function(){
		if(this.D.options.loop){
			return false;
		}
		var nextVideo = this.D.options.videoUrls.shift();

		if(nextVideo){
			this.setPlayingVideo(nextVideo);
		}
	},

	setPlayingVideo : function(videoUrl){
		var _self = this;
		this.loadProxyVideo(videoUrl,function(){
			_self.D.options.videoUrl = videoUrl;
			_self.setCurrentTime(0);
			_self.pause(_self.elem.play);
			_self.playing = false;
			_self.changeStyleOfProgress(".Dplayer-progressBar",0);
			_self.changeStyleOfProgress(".Dplayer-preProgressBar",0);
			_self.changeStyleOfTime(".Dplayer-currentTime","00:00");
		});
	},

	resetDuration : function(){
		var duration = this.duration,
			temp = this.getTimeFormat(duration);

		this.changeStyleOfTime(".Dplayer-duration",temp);
	},

	// 改变播放器相关样式
	changeStyleOfLooper : function(ele,status){
		ele.setAttribute("data-type", ( status ? "loop" : "" ) );
	},

	changeStyleOfProgress : function(selector,time){
		var position = this.getPlayingPosition(time),
			progressBar = this.elem.progress.querySelector(selector);

		progressBar.style.width =  position + "%";
	},

	changeStyleOfTime : function(selector,time){
		this.D.wrapper.querySelector(selector).innerHTML = time;
	},

	changeStyleOfvolume : function(val){
		this.elem.volumeNum.innerHTML = val >> 0;
		this.elem.volumeBar.style.height = val + "%";
	},

	//元素全屏
	goElementFullScreen : function(ele,isFullScreen,fn){

		if(isFullScreen){
			ele.setAttribute("data-isFullScreen","no");
			//退出全屏
			fn.call(document);
			this.D.Canvas.resizeCanvas();
			return;
		}
		//启用全屏
		fn.call(ele);
		this.D.Canvas.resizeCanvasInFullScreen();
		ele.setAttribute("data-isFullScreen","yes");
	},

	//移动设备伪全屏(由于移动设备目前只支持video全屏，我们需要调整)
	goVideoFullScreen : function(ele,isFullScreen){
		if(isFullScreen){
			ele.setAttribute("data-isFullScreen","no");
			this.D.Canvas.resizeCanvas();
			
			return;
		}

		ele.setAttribute("data-isFullScreen","yes");
		this.D.Canvas.resizeCanvasInMobileFullScreen();
	},

	//杂项
	//获取目前进度条的位置
	getPlayingPosition : function(time){
		return time / this.duration * 100;
	},

	//获取格式化时间
	getTimeFormat : function(time) {
		var sec = ( time % 60 ) >> 0,
			min = ( time / 60 ) >> 0,
			hour = ( time / 3600 ) >> 0;

		if( min < 10 ){
			min = "0" + "" + min;
		}

		if( sec < 10 ){
			sec = "0" + "" + sec;
		}

		if(hour == 0){
			return min + ":" + sec;
		}

		return hour + ":" + min + ":" +sec;
	}

};

D.prototype.Canvas = {
	init : function(D){
		this.D = D;
		this.createCanvas();
	},

	createCanvas : function(){
		var canvas = document.createElement('canvas');
		
		canvas.className = "Dplayer-canvas";

		this.createCache(canvas);
		this.appendToWrapper(canvas);
	},

	createCache : function(canvas){
		this.canvas  				= canvas;
		this.context 				= canvas.getContext('2d');
		this.globalStyleHasChanged 	= false; //是否改变了canvas全局样式
	},

	appendToWrapper : function(canvas){
		var wrapper = this.D.wrapper,
			cvs = wrapper.querySelectorAll('canvas');

		for( var i = 0, l = cvs.length; i < l; i++ ){
			wrapper.removeChild(cvs[i]);
		}
		wrapper.appendChild(canvas);
		
		this.resizeCanvas();
	},

	resizeCanvas : function(){

		var w = this.D.width,
			h = this.D.height - this.D.controlsBoxHeight;

		this.canvas.width  = w;
		this.canvas.height = h;

		this.D.DMsystem.setDMRows(this.D,this.canvas);
	},

	resizeCanvasInFullScreen : function(){
		//仅在支持元素全屏的时候调用这个
		this.canvas.width  = window.screen.width;
		this.canvas.height = window.screen.height;

		this.D.DMsystem.setDMRows(this.D,this.canvas);
	},

	resizeCanvasInMobileFullScreen : function(){
		//移动设备伪全屏时调用这个
		var w = window.innerWidth,
			h = window.innerHeight;

		this.canvas.width  = w;
		this.canvas.height = h;

		this.D.DMsystem.setDMRows(this.D,this.canvas);
	},

	clearCanvas : function(cv,cxt){
		cxt.clearRect(0,0,cv.width,cv.height);
	},

	setBaseTextStyle : function(cxt){
		var options = this.D.options,
			tanX = Math.tan(options.rotate * Math.PI / 180),
			tanY = Math.tan(0 * Math.PI / 180),
			x 	 = this.canvas.width / 2,
			y 	 = this.canvas.height / 2;

		cxt.font 	  = options.globalFontStyle + " normal " +
						options.globalFontWeight + " " +
						options.globalFontSize + "px " +
						options.globalFontFamily;

		cxt.fillStyle = options.globalFontColor;
		cxt.textAlign = "center";

		if(!this.D.removeSomeEffects && !this.D.isAndroid){
			cxt.shadowBlur  = options.globalShadowBlur;
			cxt.shadowColor = options.globalShadowColor;
			cxt.setTransform(options.scale, tanX, tanY, options.scale, x, y);
			cxt.translate( -x , -y );
		}

		this.globalStyleHasChanged = true;
	},

	//根据用户的样式替换全局样式
	replaceSomeStyle : function(cxt,DM,options){
		if(DM.fontSize)
		cxt.font = DM.fontSize + "px Microsoft Yahei "+options.globalFontWeight;
		if(DM.color)
		cxt.fillStyle = DM.color;
	},

	//去除默认特效
	removeBaseEffects : function(len){
		var D 		 = this.D,
			upperNum = D.options.upperNum,
			remove 	 = (D.isIE && len > upperNum.ie) || (D.isSafari && len > upperNum.safari) ||
						(D.isChrome && len > upperNum.chrome) || (D.isEdge && len > upperNum.edge) ||
						(D.isFireFox && len > upperNum.firefox);

		D.removeSomeEffects = !!remove;
	},

	drawDM : function(cxt,DM,options){
		cxt.save();
		this.replaceSomeStyle(cxt,DM,options);
		cxt.fillText(DM.text,DM.x,DM.y);
		cxt.restore();
		if(!DM.width)
		DM.width = cxt.measureText(DM.text).width;
	}
};

D.prototype.DMsystem = {
	
	init : function(D){
		this.D = D;
		this.createCache();

		for( var key in this.D.options.DM ){
			this.DM = this.D.options.DM;
			this.initDM();
			break;
		}
	},

	createCache : function(){
		this.DM 	= {};
		this.DMDisplay = true;			//是否显示弹幕
		this.rows 	= this.rows || [];  //最多能够生成弹幕的行数 	
		this.idx 	= 0; 				//循环体的初始下标，用于优化循环
	},

	//获取弹幕
	initDM : function(){
		var cv = this.D.Canvas.canvas,
			cxt = this.D.Canvas.context,
			len = this.DM.textDM.data.length;

		this.D.options.DM = this.DM;
		//用于计算宽度
		this.D.Canvas.setBaseTextStyle(cxt);

		for( var i = 0; i < len; i++ ){
			var type = this.DM.textDM.data[i].type,
				text = this.DM.textDM.data[i].text,
				spos = cxt.measureText(text).width + cv.width;

			this.DM.textDM.data[i].x = (type == "slide" ? spos : cv.width/2 );
			this.DM.textDM.data[i].y = 0;
			this.DM.textDM.data[i].speed = (type == "slide" ? ((Math.random() * 3 + 2) >> 0) : 0);
			this.DM.textDM.data[i].hasShowed = false;
			this.DM.textDM.data[i].isDisplaying = false;
		}

		//按出现时间排序
		this.DM.textDM.data.sort(function(a,b){
			return a.currentTime - b.currentTime;
		});

		this.D.Canvas.removeBaseEffects(this.DM.textDM.data.length);
	},

	//重置所有弹幕的位置和状态
	resetDM : function(width){
		if(!this.DM)
		return;

		var D 			= this.D,
			DMs 		= this.DM.textDM.data,
			currentTime = this.D.Video.currentTime << 0 || 0,
			cxt 		= this.D.Canvas.context,
			_self 		= this;
			this.idx 	= 0;

		//停止循环，防止创建多个动画循环
		window.cancelRequestAnimationFrame(D.loop);

		for( var i = 0, DM ; DM = DMs[i++]; ){
			if(DM.currentTime < currentTime){
				//跳转时如果弹幕显示的时间在当前时间之前时不需要重置
				continue;
			}
			DM.x 			= (DM.type == "slide" ? width + cxt.measureText(DM.text).width : width / 2);
			DM.y 			= 0;
			DM.hasShowed 	= false;
			DM.isDisplaying = false;
		}

		D.Canvas.globalStyleHasChanged = false;
		D.step((D.runTime || 0),D.Canvas,D.Video,this,D.Canvas.canvas,D.Canvas.context);
	},

	//计算有多少行的弹幕
	setDMRows : function(D,canvas){
		var options = D.options,
			temp;

		this.rowNum = ( canvas.height / ( options.globalFontSize * options.scale + options.DMEachRowSpace ) ) >> 0;
		this.rows 				= []; //滚动弹幕行数
		this.staticTopRows 		= []; //头部静止弹幕行数
		this.staticBottomRows 	= []; //底部静止弹幕行数
		//创建空闲行，表明弹幕应显示在哪一行
		for( var i = 0; i < this.rowNum; i++ ){
			this.rows.push({
				idx : i,
				rowHeight : (options.globalFontSize + options.DMEachRowSpace) * (i + 1)
			});

			temp = (i < ((this.rowNum / 2) << 0)) ? this.staticTopRows : this.staticBottomRows;

			temp.push({
				idx : i,
				rowHeight : (options.globalFontSize + options.DMEachRowSpace) * (i + 1)
			});

		}
		//重置弹幕位置
		this.resetDM(canvas.width);
	},

	//获取哪一行可以存放新弹幕
	getFreeRow : function(DM){
		if(DM.type == "slide")
		return this.getFreeSlideRow(DM);
		return this.getFreeStaticRow(DM);
	},

	getFreeSlideRow : function(DM){
		var options = this.D.options,
			row 	= this.rows.shift(),
			i 		= (Math.random() * this.rowNum) >> 0;

		//如果存在空闲行，则返回相应的空闲行，否则随机选取一行进行返回
		return row ? row : {
			idx : i,
			rowHeight : (options.globalFontSize + options.DMEachRowSpace) * (i + 1),
			speedChange : true
		};
	},

	getFreeStaticRow : function(DM){
		var options = this.D.options,
			row 	= DM.type == "top" ? this.staticTopRows.shift() : this.staticBottomRows.pop(),
			i 		= (Math.random() * this.rowNum) >> 0;

		//如果存在空闲行，则返回相应的空闲行，否则随机选取一行进行返回
		return row ? row : {
			idx : i,
			rowHeight : (options.globalFontSize + options.DMEachRowSpace) * (i + 1)
		};
	},

	//重设循环开始位置(i初始值),简化循环
	resetStartIdx : function(DMs){
		this.idx = this.idx || 0;
		for( var i = this.idx, DM; DM = DMs[i++]; ){
			if( !DM.hasShowed ){
				return;
			}
			this.idx = i;
		}
	},

	//更新位置
	refresh : function(DM){
		//如果弹幕已经显示，则速度不变
		if( DM.row ){
			DM.x -= DM.speed;
			DM.y = DM.row.rowHeight;
			return;
		}

		DM.row = this.getFreeRow(DM);
		//如果弹幕没有空闲行，则改变运行速度达到不会重叠的效果
		if(DM.row.speedChange){
			DM.speed += 1;
		}
		DM.x -= DM.speed;
		DM.y = DM.row.rowHeight;
	},

	//判断并回收弹幕
	recovery : function(DM,currentTime){
		var isSlide = DM.type == "slide" ? true : false;
		if(isSlide){
			this.recverySlide(DM);
			return;
		}

		this.recoveryStatic(DM,currentTime);
	},

	//回收滚动弹幕
	recverySlide : function(DM){
		if( DM.x >= 0 - DM.width ){
			DM.isDisplaying = true;
			return;
		}

		DM.isDisplaying = false;
		DM.hasShowed = true;
		if(!DM.row.speedChange)
		this.rows.unshift(DM.row);
		DM.row = null;
	},

	//回收静止弹幕
	recoveryStatic : function(DM,currentTime){
		if( currentTime - DM.currentTime < this.D.options.staticDMDuration ){
			DM.isDisplaying = true;
			return;
		}

		DM.isDisplaying = false;
		DM.hasShowed = true;
		if( DM.type == "top" )
		this.staticTopRows.unshift(DM.row);
		else
		this.staticBottomRows.push(DM.row);
		DM.row = null;
	}
};

D.prototype.resize = function(){
	//播放器宽度
	this.width = this.wrapper.offsetWidth;
	//播放器高度
	this.height = this.wrapper.offsetHeight;
	//检查容器是否小于600px
	this.smallWrapper = this.width < 600 ? true : false;
	//设置容器的状态/ small/normal
	this.setWrapperBox(this.smallWrapper);

	this.Video.resizeVideo();
	this.Canvas.resizeCanvas();
};

D.prototype.windowResize = function(){
	var _self = this;
	window.onresize = null;
	window.onresize = function(){
		
	};
};

D.prototype.setWrapperBox = function(status){

	addClass(this.wrapper,this.device);
	addClass(this.wrapper,"Dplayer-container");

	if(status){
		this.wrapper.setAttribute("data-size","smaller");
		return;
	}

	this.wrapper.setAttribute("data-size","normal");
};

//普通弹幕的循环
D.prototype.normalStep = function(Canvas,Video,DMsystem,cv,cxt){
	var	options = this.options,
		DMs = DMsystem.DM.textDM.data,
		currentTime = ( Video.currentTime << 0 ) || 0;

	DMsystem.resetStartIdx(DMs);  	//更新循环开始下标

	if(!this.Canvas.globalStyleHasChanged)
	Canvas.setBaseTextStyle(cxt);	//设置文字基本样式

	for( var i = DMsystem.idx, DM; DM = DMs[i++]; ){
		if( DM.currentTime > currentTime ){
			break; //简化循环
		}
		if( DM.currentTime < currentTime && !DM.isDisplaying ){
			DM.hasShowed = true;
			continue;
		}
		DMsystem.refresh(DM); 			//更新位置
		Canvas.drawDM(cxt,DM,options); 	//绘制
		DMsystem.recovery(DM,currentTime);  		//判断弹幕是否显示完毕并回收相关行
	}
};

//高级弹幕循环
D.prototype.specialStep = function(){

};

//总循环
D.prototype.step = function(time,Canvas,Video,DMsystem,cv,cxt){
	var _self = this,
		count = _self.getCount();

	if(count % _self.options.downFrame == 0 && Video.playing){
		Canvas.clearCanvas(cv,cxt); 	//清除画布

		if(this.DMsystem.DMDisplay)
		_self.normalStep(Canvas,Video,DMsystem,cv,cxt);
	}

	_self.count++;
	_self.runTime = time;

	_self.loop = window.requestAnimationFrame(function(time){
		_self.step(time,Canvas,Video,DMsystem,cv,cxt);
	});
};

//others

//计数器,缓解性能压力用
D.prototype.getCount = function(){
	return this.count || (this.count = 1);
};

/*******************method***********************/
//打印设置信息
D.prototype.printSettings = function(){
	for( var i in this ){
		console.log(this[i]);
	}
};

//获取相关信息
D.prototype.getThisCanvas = function(){
	return this.Canvas.canvas;
};

D.prototype.getThisContext = function(){
	return this.Canvas.context;
};

D.prototype.getThisVideo = function(){
	return this.Video.video;
};

D.prototype.getCurrentTime = function(){
	return this.Video.currentTime;
};

D.prototype.getIsPlaying = function(){
	return this.Video.playing;
};

D.prototype.getVolume = function(){
	return this.Video.video.volume * 100;
};

D.prototype.getIsSilent = function(){
	return this.Video.video.muted;
};

D.prototype.getPlayingVideo = function(){
	return this.options.videoUrl;
};

D.prototype.getWidth = function(){
	return this.width;
};

D.prototype.getHeight = function(){
	return this.height;
};

D.prototype.getPlayBackRate = function(){
	return this.Video.video.playbackRate;
};

D.prototype.getAllDM = function(){
	return this.DMsystem.DM;
};

//设置全局文字颜色
D.prototype.setFontColor = function(color){
	this.options.globalFontColor = color || this.options.globalFontColor;
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局文字大小
D.prototype.setFontSize = function(size){
	this.options.globalFontSize = size || this.options.globalFontSize;
	this.DMsystem.setDMRows(this,this.Canvas.canvas);
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局文字样式
D.prototype.setFontStyle = function(style){
	this.options.globalFontStyle = style || this.options.globalFontSize;
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局文字font-weight
D.prototype.setFontWeight = function(size){
	this.options.globalFontWeight = size || this.options.globalFontWeight;
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局文字字体
D.prototype.setFontFamily = function(family){
	this.options.globalFontFamily = family || this.options.globalFontFamily;
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局旋转角度
D.prototype.setRotate = function(angle){
	this.options.rotate = angle;
	this.Canvas.globalStyleHasChanged = false;
};

//设置全局缩放
D.prototype.setScale = function(scale){
	this.options.scale = scale;
	this.Canvas.globalStyleHasChanged = false;
	this.DMsystem.setDMRows(this,this.Canvas.canvas);
};

//设置用于去除特效的弹幕上限值
D.prototype.setUpperNum = function(options){
	for( var i in this.options.upperNum ){
		if(options[i]){
			this.options.upperNum[i] = options[i];
		}
	}
	this.Canvas.removeBaseEffects(this.DMsystem.DM.textDM.data.length);
};

//设置降帧倍率
D.prototype.setDownFrameVal = function(num){
	this.options.downFrame = num * 1;
};

//改变弹幕行距
D.prototype.changeRowSpace = function(space){
	this.options.DMEachRowSpace = space || this.options.DMEachRowSpace;
	this.DMsystem.setDMRows(this,this.Canvas.canvas);
};

// (不)显示弹幕
D.prototype.setDMDisplay = function(display){
	this.DMsystem.DMDisplay = display;
	this.Video.elem.DMDisplayControl.setAttribute("data-display",display);
};

//设置自动播放
D.prototype.setAutoplay = function(autoplay){
	this.options.autoplay = autoplay ? "autoplay" : "false";
	this.Video.video.setAttribute("autoplay",this.options.autoplay);
};

//停止播放
D.prototype.pause = function(){
	this.Video.pause(this.Video.elem.play);
};

//播放
D.prototype.play = function(){
	this.Video.play(this.Video.elem.play);
};

//快进
D.prototype.fastForward = function(time){
	time = time || 0;
	this.Video.video.currentTime += time;
};

//快退
D.prototype.rewind = function(time){
	time = time || 0;
	this.Video.video.currentTime -= time;
};

//改变播放速度
D.prototype.setPlayBackRate= function(speed){
	this.Video.video.playbackRate = speed;
};

//设置当前时间
D.prototype.setCurrentTime = function(time){
	if(isNaN(time * 1)){
		var tempArr = time.split(":"),
			len = tempArr.length,
			hour = len-3 < 0 ? 0 : tempArr[len-3]; 

		time = tempArr[len-1] * 1 + tempArr[len-2] * 60 + hour * 3600;
	}
	this.Video.setCurrentTime(time);
};

//添加视频地址
D.prototype.addVideoUrl = function(url){
	if(!url) return;
	this.options.videoUrls.push(url);
};

//变更视频地址
D.prototype.changeVideoUrl = function(url){
	if(!url) return;
	this.Video.setPlayingVideo(url);
};

//播放下一个视频
D.prototype.playNextVideo = function(){
	this.Video.playNextVideo();
};

//改变音量值
D.prototype.changeVolume = function(val){
	this.Video.setvolume(val);
};

//静音
D.prototype.silent = function(){
	this.Video.setvolume(0);
};

//开启循环
D.prototype.setLoop = function(loop){
	this.options.loop = loop;
	this.Video.video.loop = loop;
	this.Video.changeStyleOfLooper(this.Video.elem.looper,loop);
};

//改变宽高
D.prototype.changeWidth = function(width){
	this.wrapper.style.width = width + "px";
	this.resize();
};

D.prototype.changeHeight = function(height){
	this.wrapper.style.height = height + "px";
	this.resize();
}

//添加普通弹幕
D.prototype.addNewNormalDM = function(DM){
	this.DMsystem.DM.textDM.data.push(DM);
	this.DMsystem.DM.textDM.length += 1;
};

//添加普通弹幕数组
D.prototype.addNewNormalDMArray = function(DMArr){
	var len = DMArr.length;
	this.DMsystem.DM.textDM.data = this.DMsystem.DM.textDM.data.concat(DMArr);
	this.DMsystem.DM.textDM.length += length;
};

//更新弹幕库
D.prototype.insert = function(DM){
	this.DMsystem.DM = DM;
	this.DMsystem.initDM();
};

/******************************************************************/
var extend = function(sourceObj,targetObj){

	for( var key in sourceObj ){

		var sk = sourceObj[key],
			tk = targetObj[key],
			type = Object.prototype.toString.call(sk);

		if( type == "[object Object]" && tk ){
			sourceObj[key] = extend(sk,tk);
		} else {
			sourceObj[key] = (tk || sk);
		}
	}

	return sourceObj;

};

var hasClass = function(ele,className){
	if(!className || className == ""){
		return false;
	}

	var eCls = ele.className,
		eClsArr = eCls.split(" ");

	for(var i = 0, clsName; clsName = eClsArr[i++]; ){
		if( clsName == className ){
			return true;
		}
	}

	return false;
};

var addClass = function(ele,className){

	if(!className || className == ""){
		return false;
	}

	if(hasClass(ele,className)){
		return false;
	}

	var cls = " " + className,
		eCls = ele.className;

	ele.className = eCls + cls;

};

var removeClass = function(ele,className){
	if(!className || className == ""){
		return false;
	}

	if(hasClass(ele,className)){
		var eCls = " " + ele.className + " ",
			eClsRemoved = eCls.replace(" "+className+" "," "),
			eClsRemoved = eClsRemoved.replace(/(^\s+)|(\s+$)/g,"");

		ele.className = eClsRemoved;
	}

};

window.requestAnimationFrame = window.requestAnimationFrame || 
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimationFrame ||
								window.oRequestAnimationFrame ||
								window.msRequestAnimationFrame;

window.cancelRequestAnimationFrame = window.cancelAnimationFrame ||
									window.webkitCancelAnimationFrame ||
									window.webkitCancelRequestAnimationFrame ||
									window.mozCancelRequestAnimationFrame ||
									window.oCancelRequestAnimationFrame ||
									window.msCancelRequestAnimationFrame;

window.DPlayer = D;

})(window);
(function(window,undefined){
var D = function(selector,options){

	var opts = {
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
			"biggerScreen" : ".Dplayer-biggerScreen",
			"looper" : ".Dplayer-looper",
			"settings" : ".Dplayer-settings"
		},
		//loop
		downFrame : 1, //降帧倍率,优化弹幕滚动流畅度
		//video
		videoUrl : "media/STYX HELIX.mp4",
		autoplay : false,
		//canvas font
		baseFontSize : 20,
		baseFontColor : "#ffffff",
		baseShadowBlur : 6,
		baseShadowColor : "rgba(0,0,0,1)",
		baseFontWeight : "bolder",
		//effects
		upperNum : {
			//当弹幕数超过一定数额时，取消文字的全局特效（如阴影等）
			//ps:火狐爸爸不给力啊，向谷歌势力低头
			"firefox" : 500,
			"safari" : 1000,
			"chrome" : 2000,
			"ie" : 900,
			"edge" : 1100
		},
		//row
		rowSpace : 5
	};

	//播放器容器
	this.wrapper = document.querySelector(selector);
	//播放器宽度
	this.width = this.wrapper.offsetWidth;
	//播放器高度
	this.height = this.wrapper.offsetHeight;
	//获取屏幕宽高(旋转时重新设置)
	this.screenWidth = window.screen.width;
	this.screenHeight = window.screen.height;
	//检查容器是否小于600px
	this.smallWrapper = this.width < 600 ? true : false;
	//获取设备信息（pc/移动端）
	this.device = (/ipad|iphone|android/i).test(navigator.userAgent) ? "Dplayer-mobile" : "Dplayer-pc";
	//设置容器的状态/ small/normal
	this.setWrapperBox(this.smallWrapper);
	//合并选项
	this.options = extend(opts,options);

	this.init();

};

D.prototype.init = function(){
	this.windowResize();
	this.Video.init(this);
	this.Canvas.init(this.wrapper,this.DMsystem,this);
	this.DMsystem.init(this.Video.video,this.Canvas,this);
};

D.prototype.Video = {

	init : function(D){

		this.D = D;
		this.createVideo();
	},

	createVideo : function(){
		var video = document.createElement('video');
		video.type = "video/mp4";

		if( !this.supportVideo(video) ){
			//不支持html5
			alert("no html5");
			return false;
		}

		this.video = video;
		this.elem = {};

		this.addVideoNode();
		this.createVideoControls();
	},

	addVideoNode : function(){
		var videos = this.D.wrapper.querySelectorAll("video");

		for( var i = 0, video; video = videos[i++]; ){
			this.D.wrapper.removeChild(video);
		}

		this.D.wrapper.appendChild(this.video);
		this.resizeVideo();
		this.loadProxyVideo(this.D.options.videoUrl);
	},

	createVideoControls : function(){

		var D = this.D,
			controls = D.options.controls,
			controlsBox = D.wrapper.querySelector('div.Dplayer-controls-box');

		if(controlsBox){
			D.wrapper.removeChild(controlsBox);
		}

		controlsBox = document.createElement('div');
		controlsBox.className = "Dplayer-controls-box";

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
			'<div class="'+controls.biggerScreen.substring(1)+' Dplayer-controls-btn"></div>'+
			'<div class="'+controls.fullScreen.substring(1)+' Dplayer-controls-btn"></div>';

		controlsBox.innerHTML = templetes;

		D.wrapper.appendChild(controlsBox);
	},

	resizeVideo : function(){
		this.video.style.width = this.D.width + "px";
		this.video.style.height = (this.D.height - 40) + "px";
	},

	supportVideo : function(video){
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
			callback(video);
		};

		video.onerror = function(e){
			alert('加载出错');
		};

		video.src = src;
	},

	//event
	initEvent : function(){
		this.bindBtn();
		this.initListener();
	},

	// 给ele元素绑定各自的播放器事件
	bindBtn : function(){
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

		this.elem.play = wrapper.querySelector(controls.play);
		this.elem.progress = wrapper.querySelector(controls.progress);
		this.elem.progressBtn = wrapper.querySelector(controls.progressBtn);
		this.elem.volumeIcon = wrapper.querySelector(controls.volumeIcon);
		this.elem.volume = wrapper.querySelector(controls.volume);
		this.elem.volumeBtn = wrapper.querySelector(controls.volumeBtn);
		this.elem.looper = wrapper.querySelector(controls.looper);
		this.elem.biggerScreen = wrapper.querySelector(controls.biggerScreen);
		this.elem.fullScreen = wrapper.querySelector(controls.fullScreen);

		this.elem.progressBar = wrapper.querySelector(".Dplayer-progressBar");
		this.elem.progressBox = wrapper.querySelector('.Dplayer-progress-box');
		this.elem.volumeNum = wrapper.querySelector(".Dplayer-volume-num");
		this.elem.volumeBox = wrapper.querySelector(".Dplayer-volume-box");
		this.elem.volumeInnerBox = wrapper.querySelector(".Dplayer-volume-bglayer");
		this.elem.volumeBar = wrapper.querySelector(".Dplayer-volumeBar");

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

		// 大屏
		this.elem.biggerScreen.addEventListener(click,function(e){

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

		//全屏change(目前mobile不支持全屏元素时可用)
		document.addEventListener("fullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
			}

		},false);

		document.addEventListener("webkitfullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
			}

		},false);

		document.addEventListener("mozfullscreenchange",function(e){
			var wrapper = _self.D.wrapper;

			if( wrapper.getAttribute("data-isFullScreen") == "yes" && _self.video.clientWidth < window.screen.width){
				_self.D.Canvas.resizeCanvas();
			}

		},false);
		//

		//点击进度条
		this.elem.progress.addEventListener(click,function(e){
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

			var y = getMousePositionInElement(this,e).y,h,dy;
			y = y < 20 ? 20 : y;
			h = this.clientHeight;
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
			console.log(e);
			var x = (e.clientX || e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft ) - ele.getBoundingClientRect().left,
				y = (e.clientY || e.pageY - document.body.scrollTop - document.documentElement.scrollTop ) - ele.getBoundingClientRect().top;

			return {
				x : x,
				y : y
			};
		}
	},

	// 监听播放器事件
	initListener : function(){
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
		window.cancelAnimationFrame(this.D.Canvas.loop);
		this.D.Canvas.loop = window.requestAnimationFrame(function(time){
			_self.D.Canvas.step(0,Canvas,_self.video,_self.D.DMsystem,Canvas.canvas,Canvas.context);
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

	setPlayingVideo : function(videoUrl){
		this.loadProxyVideo(videoUrl);
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

	goElementFullScreen : function(ele,isFullScreen,fn){

		if(isFullScreen){
			ele.setAttribute("data-isFullScreen","no");
			//退出全屏
			fn.call(document);
			this.D.Canvas.resizeCanvas();
			return;
		}

		ele.setAttribute("data-isFullScreen","yes");
		//启用全屏
		fn.call(ele);
		this.D.Canvas.resizeCanvasInFullScreen();
	},

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
	init : function(wrapper,DMsystem,D){
		this.D = D || null;
		this.wrapper = wrapper;
		this.DMsystem = DMsystem;

		//判断浏览器（有些浏览器对文字阴影的绘制效率太坑爹)
		var ua = navigator.userAgent;
		this.isFireFox = ua.indexOf("Firefox") > -1;
		this.isIE = ua.indexOf("compatible") > -1 && ua.indexOf("MSIE") > -1;
		this.isEdge = ua.indexOf("Edge") > -1;
		this.isChrome = ua.indexOf("Chrome") > -1;
		this.isSafari = ua.indexOf("Chrome") < 0 && ua.indexOf("Safari") > -1;
		//是否去除特效
		this.removeSomeEffects = false;

		this.options = this.D ? this.D.options : {
			downFrame : 1, //降帧倍率
			fnBoxHeight : 40,
			baseFontSize : 20,
			baseFontColor : "#ffffff",
			baseShadowBlur : 6,
			baseShadowColor : "rgba(0,0,0,1)",
			baseFontWeight : "bolder",
			//effects
			upperNum : {
				//当弹幕数超过一定数额时，取消文字的全局特效（如阴影等）
				//ps:火狐爸爸不给力啊，向谷歌势力低头
				"firefox" : 500,
				"safari" : 1000,
				"chrome" : 2000,
				"ie" : 900,
				"edge" : 1100
			},
			//row
			rowSpace : 5
		};
		this.createCanvas();
	},

	createCanvas : function(){
		var canvas = document.createElement('canvas');
		canvas.className = "Dplayer-canvas";

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.appendToWrapper(canvas);
	},

	appendToWrapper : function(canvas){
		var wrapper = this.wrapper,
			cvs = wrapper.querySelectorAll('canvas');

		for( var i = 0, l = cvs.length; i < l; i++ ){
			wrapper.removeChild(cvs[i]);
		}

		wrapper.appendChild(canvas);
		this.resizeCanvas();
	},

	resizeCanvas : function(){

		var w = this.wrapper.clientWidth,
			h = this.wrapper.clientHeight - (this.options.fnBoxHeight || 40);

		this.canvas.width = w;
		this.canvas.height = h;

		this.DMsystem.setDMRows(this.options,this.canvas);
	},

	resizeCanvasInFullScreen : function(){
		//支持元素全屏的时候调用这个
		this.canvas.width = window.screen.width;
		this.canvas.height = window.screen.height;

		this.DMsystem.setDMRows(this.options,this.canvas);
	},

	resizeCanvasInMobileFullScreen : function(){
		var w = window.innerWidth,
			h = window.innerHeight;

		this.canvas.width = w;
		this.canvas.height = h;

		this.DMsystem.setDMRows(this.options,this.canvas);
	},

	clearCanvas : function(cv,cxt){
		cxt.clearRect(0,0,cv.width,cv.height);
	},

	setBaseTextStyle : function(cxt){
		var options = this.options;

		this.baseStyleHasChanged = true;

		cxt.font = options.baseFontSize + "px Microsoft Yahei "+options.baseFontWeight;
		cxt.fillStyle = options.baseFontColor;

		if(!this.D.removeSomeEffects){
			cxt.shadowBlur = options.baseShadowBlur;
			cxt.shadowColor = options.baseShadowColor;
		}

	},

	//根据用户的样式替换全局样式
	replaceSomeStyle : function(cxt,DM,options){
		if(DM.fontSize)
		cxt.font = DM.fontSize + "px Microsoft Yahei "+options.baseFontWeight;
		if(DM.color)
		cxt.fillStyle = DM.color;
	},

	//去除默认特效
	removeBaseEffects : function(len){
		var upperNum = this.options.upperNum,
			remove = (this.isIE && len > upperNum.ie) || (this.isSafari && len > upperNum.safari) ||
					(this.isChrome && len > upperNum.chrome) || (this.isEdge && len > upperNum.edge) ||
					(this.isFireFox && len > upperNum.firefox);

		if(remove){
			this.removeSomeEffects = true;
		}

	},

	drawDM : function(cxt,DM,options){
		cxt.save();
		this.replaceSomeStyle(cxt,DM,options);
		cxt.fillText(DM.text,DM.x,DM.y);
		cxt.restore();
		if(!DM.width)
		DM.width = cxt.measureText(DM.text).width;
	},

	//普通弹幕的循环
	normalStep : function(Canvas,currentTime,DMsystem,cv,cxt){
		var	options = this.options,
			DMs = DMsystem.DM.textDM.data;

		Canvas.clearCanvas(cv,cxt); //清除画布
		DMsystem.resetStartIdx(DMs);  //重置开始位置

		if(!this.baseStyleHasChanged)
		Canvas.setBaseTextStyle(cxt);	//设置文字基本样式

		for( var i = DMsystem.idx, DM; DM = DMs[i++]; ){
			if( DM.currentTime > currentTime ){
				break;
			}
			if( DM.currentTime < currentTime && !DM.isDisplaying ){
				DM.hasShowed = true;
				continue;
			}
			DMsystem.refresh(DM); 		//更新位置
			Canvas.drawDM(cxt,DM,options); 	//绘制
			DMsystem.recovery(DM);  	//判断弹幕是否显示完毕并回收相关行
		}
	},

	//高级弹幕循环
	specialStep : function(){

	},

	//总循环
	step : function(time,Canvas,video,DMsystem,cv,cxt){
		var _self = this,
			count = _self.getCount(),
			currentTime = (video.currentTime >> 0) || 0;

		if(count % _self.options.downFrame == 0 && !video.paused){
			_self.normalStep(Canvas,currentTime,DMsystem,cv,cxt);
		}

		_self.count++;
		_self.runTime = time;

		_self.loop = window.requestAnimationFrame(function(time){
			_self.step(time,Canvas,video,DMsystem,cv,cxt);
		});
	},

	//计数器,缓解性能压力用
	getCount : function(){
		return this.count || (this.count = 1);
	}
};

D.prototype.DMsystem = {
	
	init : function(video,Canvas){
		this.Canvas = Canvas;
		this.video = video;
		this.getDM();
	},

	//获取弹幕
	getDM : function(){
		var cv = this.Canvas.canvas,
			cxt = this.Canvas.context,
			gradient = cxt.createLinearGradient(0,0,cv.width,cv.height);

		gradient.addColorStop(0,"#ff00cc");
		gradient.addColorStop(1,"#66aa00");
		//ajax

		this.DM = {
			length : 0,
			textDM : {
				length : 0,
				data : [{
					text : "helloWorld",
					fontSize : 32,
					color : "#66ccff",
					type : "slide",
					x : cv.width,
					y : 0,
					time : "00:32",
					speed : 3,
					currentTime : 32,
					hasShowed : false,
					isDisplaying : false
				}],
			}
		};

		for( var i = 0; i < 1998; i++ ){
			this.DM.textDM.data.push({
				text : "helloWorld" + i,
				type : "slide",
				x : cv.width,
				y : 0,
				time : "00:32",
				speed : (Math.random() * 3 + 2) >> 0,
				currentTime : (Math.random() * 100) >> 0,
				hasShowed : false,
				isDisplaying : false
			});

			if( i % 10 == 0){
				this.DM.textDM.data[i].color = "#ccff00";
			}
		}

		//按出现时间排序
		this.DM.textDM.data.sort(function(a,b){
			return a.currentTime - b.currentTime;
		});

		this.Canvas.removeBaseEffects(this.DM.textDM.data.length);
	},

	//重置所有弹幕的位置和状态
	resetDM : function(width){
		if(!this.DM)
		return;

		var DMs = this.DM.textDM.data,
			currentTime = (this.video.currentTime << 0) || 0;

		this.idx = 0;
		window.cancelRequestAnimationFrame(this.Canvas.loop);

		for( var i = 0, DM ; DM = DMs[i++]; ){
			if(DM.currentTime < currentTime){
				continue;
			}
			DM.x = width;
			DM.y = 0;
			DM.hasShowed = false;
			DM.isDisplaying = false;
		}

		this.Canvas.step((this.Canvas.runTime || 0),this.Canvas,this.video,this,this.Canvas.canvas,this.Canvas.context);
	},

	//计算有多少行的弹幕
	setDMRows : function(options,canvas){
		this.rowNum = ( canvas.height / ( options.baseFontSize + options.rowSpace ) ) >> 0;
	
		//创建空闲行，表明弹幕应显示在哪一行
		this.rows = [];
		for( var i = 0; i < this.rowNum; i++ ){
			this.rows.push({
				idx : i,
				rowHeight : (options.baseFontSize + options.rowSpace) * i
			});
		}

		//重置弹幕位置
		this.resetDM(canvas.width);
	},

	//获取哪一行没有弹幕
	getFreeRow : function(){
		var options = this.Canvas.options,
			row = this.rows.shift();

		if(!row){
			var i = (Math.random() * this.rowNum) >> 0;

			return {
				idx : i,
				rowHeight : (options.baseFontSize + options.rowSpace) * i,
				speedChange : true
			};
		}

		return row;
	},

	//重设循环开始位置(i初始值)
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
		if( DM.row ){
			DM.x -= DM.speed;
			DM.y = DM.row.rowHeight;
			return;
		}

		DM.row = this.getFreeRow();
		if(DM.row.speedChange)
		DM.speed += 1;
		DM.x -= DM.speed;
		DM.y = DM.row.rowHeight;
	},

	//判断并回收弹幕
	recovery : function(DM){
		if( DM.x < 0 - DM.width ){
			DM.isDisplaying = false;
			DM.hasShowed = true;
			if(!DM.row.speedChange)
			this.rows.unshift(DM.row);
			DM.row = null;
			return;
		}

		DM.isDisplaying = true;
	},
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
//others
//打印设置信息
D.prototype.printSettings = function(){
	for( var i in this ){
		console.log(this[i]);
	}
};


var extend = function(sourceObj,targetObj){

	for( var key in sourceObj ){

		var sk = sourceObj[key],
			tk = targetObj[key];

		if( Object.prototype.toString.call(sk) == "[object Object]" && tk ){
			sourceObj[key] = extend(sk,tk);
			continue;
		}

		sourceObj[key] = (tk || sk);
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
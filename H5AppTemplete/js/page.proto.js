define(['jquery','swiper','pageScroll','pageSwiper','pageConfig'],function($,Swiper,Scroll,myHand,config){

var Page = function(options){
	options = options || {};

	this.menu = options.menu || ".menu";
	this.menuLink = options.menuLink || ".menulink";
	this.back = options.back || ".back";
	this.detailLink = options.detailLink || ".detail-link";
	this.local = window.location.href;
	this.path = this.local.substring(0,this.local.lastIndexOf("/")+1);
	this.pages = config.menuPage;
	this.detailPages = config.detailPage;

	this.ev = "ontouchstart" in document ? "touchend" : "click";

	this.init();

};

Page.prototype = {

	init : function(){
		this.eventListen();
	},

	eventListen : function(){
		var _self = this,
			ev = this.ev,
			transitionEnd = "transitionEnd" in document ? "transitionEnd" : "webkitTransitionEnd";

		$(this.menu).on(ev,function(e){
			$('#all-wrapper').toggleClass('mode-active');
		});

		$(this.menuLink).on(ev,function(e){
			e.preventDefault();
			e.stopPropagation();

			var linkID = $(this).attr('data-link'),
				pagelist = _self.pages.pagelist;

			_self.loadProxyPages(linkID,pagelist,"menu");
		});

		$(this.back).on(ev,function(e){
			var flag = $(this).attr("data-flag");
			_self.closePage(flag);
		});

		$('#page-box').on(transitionEnd,function(){
			_self.pageSlideEnd("#page-menu");
		});

		$('#page-detail').on(transitionEnd,function(){
			_self.pageSlideEnd("#page-detail");
		});

	},

	detailPageEventListen : function(){
		var _self = this,
			ev = this.ev;

		$(this.detailLink).off(ev).on(ev,function(e){
			e.preventDefault();
			e.stopPropagation();
			var linkID = $(this).attr('data-link'),
				pagelist = _self.detailPages.pagelist;

			_self.loadProxyPages(linkID,pagelist,"detail");
		});
	},

	//前置判断
	loadProxyPages : function(linkID,pagelist,type){
		if(linkID == "homepage"){
			this.resetPage();
			return;
		}

		for( var i = 0, page; page = pagelist[i++]; ){
			var id = page.id;
			if(id == linkID){
				this.loadPages(id,page,type);
			}
		}
	},

	//加载单页
	loadPages : function(id,page,type){
		var cache = page.pageCache,
			_self = this;

		if(cache){
			_self.end(page,cache);
			return;
		}

		$.ajax({
			"type" : "get",
			"url" : this.path + id + ".html",
			"cache" : false,
			"dataType" : "html",
			"success" : function(pageDom){
				var sources = page.sources,
					div = document.createElement('div');

				div.innerHTML = pageDom;

				pageDom = div.querySelector('.page');

				if(sources && sources.length > 0){
					_self.loadSources(page,pageDom,type);
					return;
				}

				_self.end(page,pageDom,type);
			},
			"fail" : function(status){

			}
		});
	},

	//加载单页资源
	loadSources : function(page,pageDom,type){
		var sources = page.sources,
			temp = "",
			_self = this;

		$.get(page.sourceUrl,{},function(res){
			for(var i = 0, source; source = sources[i++]; ){
				temp = source.callback.call(_self,res) || "";
				pageDom.querySelector(source.wrapper).innerHTML = temp;
			}

			_self.end(page,pageDom,type);
			
		});
	},

	//加载图片
	lazyloadImages : function(){
		this.lazyloadImage();
	},

	//
	lazyloadImage : function(){
		var imgObj = $('.lazy-img[data-status=unload]').eq(0),
			img = document.createElement('img'),
			_self = this;
			
		if(imgObj.length == 0){
			return;
		}
		
		var src = imgObj.attr('data-origin');

		img.onload = function(){
			imgObj.attr({
				"data-status" : "loaded",
				"src" : src
			});
			setTimeout(function(){
				_self.lazyloadImage();
			},30);
		};

		imgObj.attr('data-status',"loading");
		img.src = src;
	},

	//重置首页样式
	resetPage : function(){
		$('#all-wrapper').removeClass('mode-active');
	},

	detailPage : function(){
		$('#page-detail').addClass('page-active');
	},

	//关闭详情页面
	closePage : function(flag){
		if(flag == "menu"){
			$('#page-box').removeClass('page-active');
			return;
		}

		$('#page-detail').removeClass('detail-active');
	},

	//transitionEnd
	pageSlideEnd : function(wrapper){
		var status = $(wrapper).attr('data-status');
		if(status == "hide"){
			$(wrapper).attr('data-status',"show");
			this.lazyloadImages();
		} else {
			$(wrapper).attr('data-status',"hide");
		}
	},

	end : function(page,pageDom,type){
		if(type == "detail"){
			this.detailPagesEnd(page,pageDom);
			return;
		}

		if( !page.pageCache ){
			page.pageCache = pageDom;
		}

		this.menuPageLoadEnd(pageDom);
		this.resetPage();
		this.detailPageEventListen();
		this.createScroll();
		page.callback(pageDom);
	},

	//添加内容到菜单（一级）页面上
	menuPageLoadEnd : function(pageDom){
		$('#page-menu').find(".page-wrapper").hide().html(pageDom).show();
		$('#page-box').addClass('page-active');
	},

	//detail pages
	detailPagesEnd : function(page,pageDom){
		this.detailPageLoadEnd(pageDom);
		page.callback(pageDom);
	},

	//添加内容到详细（二级）页面上
	detailPageLoadEnd : function(pageDom){
		$('#page-detail').find(".page-wrapper").hide().html(pageDom).show();
		$('#page-detail').addClass('detail-active');
	},

	//创建页面滚动
	createScroll : function(){
		//创建iscroll
		var tempScroll = new Scroll('#page-menu .page-wrapper', {
		    mouseWheel: true,
		    scrollBar: true
		});
	}

};

return Page;

});
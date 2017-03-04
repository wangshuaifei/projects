var Page = function(options){
	options = options || {};

	this.menu = options.menu || ".menu";
	this.menuLink = options.menuLink || ".menulink";
	this.local = window.location.href;
	this.path = this.local.substring(0,this.local.lastIndexOf("/")+1);
	this.pages = {
		loadCount : 0,
		pagelist : [{
			"name" : "图片",
			"id" : "images",
			"pageCache" : "",
			"callback" : function(pageDom){
				
			},
			"sourceUrl" : "",
			"sources" : [{
				"wrapper":".img-other",
				"callback" : function(data){
					var temp = '<li class="img-item"><img src="images/loading.gif" data-origin="images/1.png" class="lazy-img" data-status="unload" /></li>'+
						'<li class="img-item"><img src="images/loading.gif" data-origin="images/2.jpg" class="lazy-img" data-status="unload" /></li>';
					return temp;
				}
			},{
				"wrapper":".img-text",
				"callback" : function(data){
					var temp = "我来，我到，我GG";
					return temp;
				}
			}]
		}]
	};

	this.init();

};

Page.prototype = {

	init : function(){
		this.eventListen();
	},

	eventListen : function(){
		var _self = this,
			transitionEnd = "transitionEnd" in document ? "transitionEnd" : "webkitTransitionEnd";

		$(this.menu).on('click',function(e){
			$('#all-wrapper').toggleClass('mode-active');
		});

		$(this.menuLink).on('click',function(e){
			e.preventDefault();
			e.stopPropagation();

			var linkID = $(this).attr('data-link'),
				pagelist = _self.pages.pagelist;

			if(linkID == "homepage"){
				_self.resetPage();
				return;
			}

			for( var i = 0, page; page = pagelist[i++]; ){
				var id = page.id;
				if(id == linkID){
					_self.loadPages(id,page);
				}
			}

		});

		$('#page-box').on(transitionEnd,function(){
			var status = $('#page-menu').attr('data-status');
			if(status == "hide"){
				$('#page-menu').attr('data-status',"show");
				_self.lazyloadImages();
			}
		});

	},

	//加载单页
	loadPages : function(id,page){
		var cache = page.pageCache,
			_self = this;
		if(cache){
			return cache;
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
					_self.loadSources(page,pageDom);
					return;
				}

				_self.end(page,pageDom);
			},
			"fail" : function(status){

			}
		});
	},

	//加载单页资源
	loadSources : function(page,pageDom){
		var sources = page.sources,
			temp = "",
			_self = this;

		$.get(page.sourceUrl,{},function(res){
			for(var i = 0, source; source = sources[i++]; ){
				temp = source.callback.call(_self,res);
				pageDom.querySelector(source.wrapper).innerHTML = temp;
			}

			_self.end(page,pageDom);
			
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

	end : function(page,pageDom){
		if( !page.pageCache ){
			this.pages.loadCount++;
			page.pageCache = pageDom;
		}

		$('#page-menu').find(".page-wrapper").hide().html(pageDom).show();
		$('#page-box').addClass('page-active');
		this.resetPage();
		page.callback(pageDom);
	}

};

new Page();
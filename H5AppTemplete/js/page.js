(function(window,document,undefined){

var path = window.location.href,
	pages = {
		loadAfter : true,
		loadCount : 0,
		pagelist : [{
			"name" : "图片",
			"id" : "images",
			"sourceLoad" : false,
			"pageCache" : "",
			"callback" : function(pageDom){
				$('#page-menu').find(".page-wrapper").hide().html(pageDom).show();
				$('#page-box').addClass('page-active');
				resetPage();
			},
			"source" : [{
				"wrapper":".img-other",
				"url" : ""
			}]
		}]
	};

$('.menu').on('click',function(e){
	$('#all-wrapper').addClass('mode-active');
});

$('.menulink').on('click',function(e){
	e.preventDefault();
	e.stopPropagation();

	var linkID = $(this).attr('data-link'),
		pagelist = pages.pagelist;

	if(linkID == "homepage"){
		resetPage();
		return;
	}

	for( var i = 0, page; page = pagelist[i++]; ){
		var id = page.id;
		if(id == linkID){
			loadPages(id,page);
		}
	}

});

//加载单页
function loadPages(id,page){
	var cache = page.pageCache;
	if(cache){
		return cache;
	}

	$.ajax({
		"type" : "get",
		"url" : path + id + ".html",
		"dataType" : "html",
		"success" : function(pageDom){
			var source = page.source;
			if(source && source.length > 0)
			loadSources(page,pageDom,0);
			else
			allComplete(page,pageDom);
		},
		"fail" : function(status){

		}
	});
}

//加载单页资源
function loadSources(page,pageDom,index){
	var source = page.source,
		len = source.length,
		item = source[index];

	$.get(item.url,{},function(res){
		var wrapper = document.createElement('div');
			wrapper.innerHTML = pageDom;
			wrapper.querySelector(item.wrapper).innerHTML = '<img src="images/1.png" style="max-width:50%;" >';
			pageDom = wrapper.innerHTML;
		
		index++;
		if(index === len){
			allComplete(page,pageDom);
			return;
		}
		loadSources(page,pageDom,index);
	});
}

//重置首页样式
function resetPage(){
	$('#all-wrapper').removeClass('mode-active');
}

//确定单页所有内容载入完毕后
function allComplete(page,pageDom){
	pages.loadCount++;
	page.hasLoaded = true;
	page.pageCache = pageDom;
	page.callback(pageDom);
}

})(window,document);
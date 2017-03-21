define(function(){

var config = {};

var pageConfig = {
	pagelist : [
		{
			"name" : "图片",
			"id" : "images",
			"pageCache" : "",
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
			}],
			"callback" : function(pageDom){
				
			}
		},{
			"name" : "评论",
			"id" : "comments",
			"pageCache" : "",
			"sourceUrl" : "",
			"sources" : [
				{
					"wrapper" : ".comments",
					"callback" : function(data){
						var temp = "<li>1</li><li>2</li><li>3</li><li>4</li>";
						return temp;
					}
				}
			],
			"callback" : function(pageDom){

			}
		}
	]
};

var detailConfig = {
	pagelist : [
		{
			"name" : "详情",
			"id" : "detail",
			"sourceUrl" : "",
			"sources" : [
				{
					"wrapper" : ".content",
					"callback" : function(data){
						var temp = "<li>asdasdasd</li>";
						return temp;
					}
				}
			],
			"callback" : function(pageDom){

			}
		}
	]
};

config.menuPage = pageConfig;
config.detailPage = detailConfig;

return config;

});
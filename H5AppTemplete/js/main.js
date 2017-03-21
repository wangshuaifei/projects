require.config({
	urlArgs : "v="+(new Date().getTime()),
	paths : {
		"jquery" : "plugs/jquery.min",		//jquery
		"swiper" : "plugs/swiper.min",		//swiper
		"iscroll" : "plugs/iscroll-probe",	//iscroll
		"hammer" : "plugs/hammer.min",	//hammer
		"pageConfig" : "./page.config", 	//页面配置代码
		"pageScroll" : "./page.scroll", 	//整合iscroll.js
		"pageSwiper" : "./page.swiper",		//整合hammer.js
		"page" : "./page.proto"				//主代码
	},
	shim : {
		"pageSwiper" : {
			deps : ["hammer"]
		},
		"pageScroll" : {
			deps : ["iscroll"],
			exports : "Scroll"
		},
		"page" : {
			deps : ["jquery","swiper","pageScroll","pageSwiper","pageConfig"],
			exports : "Page"
		}
	}
});

require(['jquery','page'],function($,Page){

$(function(){

var page = new Page();

});

});
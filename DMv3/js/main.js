jQuery(function($){

//初始化
var wrapper = document.querySelector(".wrapper");
var DMer; //弹幕插件保存变量

var iscroll = new IScroll(".scroll-wrapper",{
	mouseWheel : true,
	scrollbars : true,
	fadeScrollbars : true
});

var video = document.getElementById("video");

$('.control-settings').on("click",'a',function(e){

	e.preventDefault();
	e.stopPropagation();

	var set = $(this).attr("data-set") || "normal";

	$('.control-settings').find('li').removeClass("active");

	$(this).parent().addClass("active");

	tabChange(set);

});


//切换选项卡
function tabChange(set){

	var $tabs = $('.scroll').find(".panel");

	$tabs.hide();

	$('.scroll').find(".panel[data-setting='"+set+"']").show();

	iscroll.refresh();

}

tabChange("normal");

$('.dropdown-menu').on("click","a",function(e){

	var val = $(this).attr("data-val");

	$(this).parents(".btn-group").attr("data-val",val).find("button").text(val);

});

/***************************************************************************************************/

//普通弹幕提交
var normal = [],
	index = 0;

$('#normal-submit-btn').on("click",function(e){

	//弹幕数
	var num = $("#normal-danmu-num").val() || 0;
	//弹幕文本
	var text = $("#normal-danmu-text").val() || "";
	//弹幕方向
	var direc = $('#normal-danmu-direc').attr("data-val") || "rtol";
	//弹幕时间曲线
	var timing = $('#normal-danmu-timing').attr("data-val") || "linear";

	var types = ["slide","top","bottom"];

	for( var i = 0; i < num; i++ ){

		var rand = Math.random() * 100 >> 0;

		normal.push({
			text : text,
			type : types[ ( Math.random() * 3 >> 0 ) % 3],
			change : false,
			fontSize : "24px",
			color : "#ffcc44",
			time : rand
		});

	}

	normal.sort(function(a,b){
		return a.time - b.time;
	});

	DMer.direction(direc);
	DMer.timing(timing);

	video.play();

	DMer.start();

});

video.ontimeupdate = function(e){
	var t = video.currentTime << 0;
	for( var i = index,dm; dm = normal[i++]; ){
		if( dm.time > t ) break;
		index = i;
		DMer.inputData(dm);
	}
};

//初始化弹幕插件
video.ondurationchange = function(e){
	DMer = DanMuer(wrapper,{});
};

});
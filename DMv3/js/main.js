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

	$(this).parents(".btn-group").attr("data-val",val).find("button").html(val+' <span class="caret"></span>');

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

		var rand = Math.random() * 220 >> 0;

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

/***************************************************************************************************/

//高级弹幕设置

$('.inner-select').on("click","a",function(e){

	var $val = $(this).attr("data-val");

	$('.owner-box').removeClass("o-active");

	$('.owner-box[data-val="'+$val+'"]').addClass("o-active");

	iscroll.refresh();

});



/***************************************************************************************************/

//修改过滤设置

$('#filter-add-btn').on("click",function(e){

	var $key = $("#filter-danmu-add-key").val(),
		$val = $("#filter-danmu-add-val").val();

	if(!$key || !$val) return false;

	DMer.addFilter($key,$val);

});

$('#filter-remove-btn').on("click",function(e){

	var $key = $("#filter-danmu-remove-key").val(),
		$val = $("#filter-danmu-remove-val").val();

	if(!$key) return false;

	DMer.removeFilter($key,$val);

});

/***************************************************************************************************/

//修改全局样式

$("#normal-change-btn").on("click",function(e){

	var fontSize = $("#normal-danmu-size").val() + "px" || "20px",
		fontStyle = $('#normal-danmu-fontStyle').attr("data-val"),
		fontWeight = $('#normal-danmu-fontWeight').attr("data-val"),
		color = $("#normal-danmu-color").val() || "#FFFFFF",
		opacity = $("#normal-danmu-opacity").val() / 100 || 1,
		family = $("#normal-danmu-family").attr("data-val"),
		graType = $("#normal-danmu-gradient-type").attr("data-val"),
		graSX = $("#normal-danmu-gradient-startX").val() * 1,
		graSY = $("#normal-danmu-gradient-startY").val() * 1,
		graEX = $("#normal-danmu-gradient-endX").val() * 1,
		graEY = $("#normal-danmu-gradient-endY").val() * 1,
		graSColor = $("#normal-danmu-gradient-startColor").val() || "#FFFFFF",
		graEColor = $("#normal-danmu-gradient-endColor").val() || "#FFFFFF",
		checked = $("#use-gradient")[0].checked;

	DMer.changeStyle({
		fontSize : fontSize,
		fontFamily : family,
		fontStyle : fontStyle,
		fontWeight : fontWeight,
		fontColor : color,
		opacity : opacity
	});

	if( !checked ) return false;

	DMer.addGradient(graType,{
		startX : graSX,
		startY : graSY,
		endX : graEX,
		endY : graEY,
		colorStops : [{
			"point" : 0,
			"color" : graSColor
		},{
			"point" : 1,
			"color" : graEColor
		}]
	});

});

/***************************************************************************************************/

//修改全局样式

$("#filter-add-btn").on("click",function(e){

	var key = $("#filter-danmu-add-key").val();

	if(!key) return false;

	var val = $("#filter-danmu-add-val").val() || "";

});

/***************************************************************************************************/

//其他控制选项

//启动
$("#all-start").on("click",function(e){

	DMer.start();

});
//停止
$("#all-stop").on("click",function(e){

	DMer.stop();

});
//运行
$("#all-play").on("click",function(e){

	DMer.run();

});
//暂停
$("#all-pause").on("click",function(e){

	DMer.pause();

});
//清除
$("#all-clear").on("click",function(e){

	DMer.clear();

});
//重置
$("#all-reset").on("click",function(e){

	DMer.reset(0);

});
//禁用
$("#all-disable").on("click",function(e){

	DMer.disableEffect();

});
//启用
$("#all-disable").on("click",function(e){

	DMer.enableEffect();

});
//FPS
var timer,
	$msg = $(".showMsg");
$("#all-fps").on("click",function(e){

	clearInterval(timer);
	timer = setInterval(function(){
		$msg.html(DMer.getFPS());
	},500);

});
//设置大小
$("#all-resize").on("click",function(){

	var $w = $("#canvas-danmu-width").val() * 1,
		$h = $("#canvas-danmu-height").val() * 1;

	DMer.setSize($w,$h);

});

});
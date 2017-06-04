//对象构建以及行为操作
(function(window,Math,undefined){

var Mota = {},
	MotaSprites,  //Sprites类
	stages = null, //保存所有场景
	UI = null, //保存所有UI
	currentStage,
	canvas, //作用的canvas
	unit, //地图单元size
	UWNum, //地区的单元格数
	UHNum;

var getTimes = function(uWidth,uHeight){
	return ( unit / Math.max( uWidth, uHeight ) ).toFixed(2);
};

//分解保存数据信息
Mota.initData = function(cv,data,Sprites,wrapper){

	unit = data.unit || 60;
	stages = data.stages || null;
	UI = data.UI;
	MotaSprites = Sprites;
	UWNum = data.width;
	UHNum = data.height;

	var wrapWidth = wrapper.clientWidth,
		wrapHeight = wrapper.clientHeight;

	if( wrapHeight > wrapWidth ){
		alert("请横屏游玩");
	}

	var trueUnit = Math.min( ( wrapHeight / UHNum >> 0) , unit),
		width =  UWNum * trueUnit;

	unit = trueUnit;

	cv.width = width;
	cv.height = trueUnit * UHNum;

	canvas = cv;

	Mota.unit = unit;
	Mota.UHNum = UHNum;
	Mota.UWNum = UWNum;
};

//重置场景
Mota.resetStage = function(stage){
	stage = stage || currentStage.stageName;
	this.Character.resetChars(stage);
	this.Stage.changeStage(stage);
};

//重置游戏
Mota.reset = function(){
	this.resetStage("stage_1");
};

/*################################################################*/

//场景数据处理
Mota.Stage = (function(){

	var background,
		UIBox,
		stageChanged = true;

	//生成背景
	var createBg = function(){
		if( !currentStage ) return false;

		var newCanvas = document.createElement("canvas"),
			ncxt = newCanvas.getContext("2d"),
			width = Mota.UWNum * unit,
			height = Mota.UHNum * unit,
			pattern = ncxt.createPattern(currentStage.bgImg,"repeat");

		newCanvas.width = width;
		newCanvas.height = height;

		ncxt.save();
		ncxt.fillStyle = pattern;
		ncxt.fillRect(0,0,width,height);
		ncxt.restore();

		background = newCanvas;
	};

	//生成UI
	var createUI = function(options){

		if( !currentStage ) return false;
		
		options = options || {};

		if(!options.changed) return false;

		var uiCanvas = document.createElement("canvas"),
			uicxt = uiCanvas.getContext("2d"),
			scores = UI.scores,
			width = scores.width * unit,
			height = scores.height * unit;

		uiCanvas.width = width;
		uiCanvas.height = height;

		uicxt.strokeStyle = "orange";
		uicxt.fillStyle = "rgba(0,0,0,0.6)";
		uicxt.fillRect(0,0,width,height);
		uicxt.strokeRect(0,0,width,height);
		UIBox = uiCanvas;
	};

	//生成敌人
	var createEnemies = function(){

		if(!currentStage) return false;
		//生成敌人
		var enemies = currentStage.enemies;

		for( var character in enemies ){

			var thisChar = enemies[character];

			Mota.Character.addChar(thisChar,character); //添加到人物类中

		}

	};

	//生成中立对象
	var createBuilds = function(){

		if(!currentStage) return false;
		//生成中立对象
		var builds = currentStage.builds;

		for( var character in builds ){

			var thisChar = builds[character];

			Mota.Character.addChar(thisChar,character); //添加到人物类中

		}

	};

	//解析场景数据并创建相关对象
	var changeStage = function(stage){
		
		if( !stages || !stages[stage] ){
			console.log("并未传入初始数据或者数据丢失，程序运行停止");
			return false;
		}

		currentStage = stages[stage];

		currentStage.stageName = stage;

		if( !currentStage.bgImg ){

			var uWidth = currentStage.widthUnit,
				uHeight = currentStage.heightUnit,
				scale = getTimes(uWidth,uHeight);

			//生成背景原件
			currentStage.bgImg = MotaSprites.getCharImage(currentStage.name,currentStage.x,currentStage.y,uWidth,uHeight,scale);
		
		}

		//生成背景
		createBg();

		//生成ui
		createUI({
			changed : true
		});

		//生成敌人
		createEnemies();

		//生成中立对象
		createBuilds();

		stageChanged = true;
	};

	//变更场景
	var initStage = function(stage){
		stage = stage || "stage_1";
		changeStage(stage);
	};

	//下一场景
	var nextStage = function(){
		var num = currentStage.stageName.split("_")[1],
			idx = num * 1 + 1;

		changeStage("stage_" + idx);
	};

	//上一场景
	var prevStage = function(){
		var num = currentStage.stageName.split("_")[1],
			idx = num - 1 <= 0 ? 1 : num - 1;

		changeStage("stage_" + idx);
	};

	//获取当前场景
	var getCurrentStage = function(){
		return currentStage;
	};

	//获取背景
	var getBackground = function(){
		return background;
	};

	var getUIBox = function(){
		return UIBox;
	};

	return {
		initStage : initStage,
		nextStage : nextStage,
		changeStage : changeStage,
		prevStage : prevStage,
		getCurrentStage : getCurrentStage,
		getBackground : getBackground,
		getUIBox : getUIBox,
		stageChanged : stageChanged
	};

})();

/*################################################################*/
//人物处理
Mota.Character = (function(){

	var chars = {},
		wrapper = document.querySelector(".wrapper");

	//创建每个动作的帧图片
	var createStep = function(action){
		var sids = action.sids,
			uWidth = action.widthUnit,
			uHeight = action.heightUnit,
			colNum = action.colNum,
			x, y,
			row,
			col,
			scale = getTimes( uWidth, uHeight);

		action.steps = [];

		for( var i = 0, sid; sid = sids[i++]; ){

			row = Math.ceil( sid / colNum );
			col = sid - ( row - 1 ) * colNum;
			x = ( col - 1 ) * uWidth;
			y = ( row - 1 ) * uHeight;

			var cv = MotaSprites.getCharImage(action.name,x,y,uWidth,uHeight,scale);
			action.steps.push(cv);
		}
	};

	//创建每个人物所有动作的帧图片
	var createSteps = function(character){

		for( var action in character ){

			var act = character[action];

			if( Object.prototype.toString.call(act) != '[object Object]' || !act.name ){
				continue;
			}

			createStep(act);
		}

	};

	//添加一个新人物
	var addChar = function(cha,charName,unPush){//unPush指不添加到chars中的对象

		if( !stages || !cha ){
			console.log("并未传入初始数据，程序运行停止");
			return false;
		}

		createSteps(cha);

		cha.show = cha.show === false ? false : true;
		cha.currentAction = cha.currentAction || "down";
		cha.life = cha.life || 1000;
		cha.atk = cha.atk || 10;
		cha.def = cha.def || 10;
		cha.money = cha.money || 0;
		cha.exp = cha.exp || 0;

		//将pid转换成坐标
		var pid = cha.pid.split("_")[1] * 1,
			row = Math.ceil( pid / Mota.UWNum ),
			col = pid - ( row - 1 ) * Mota.UWNum,
			x = ( col - 1 ) * unit,
			y = ( row - 1 ) * unit;

		cha.x = x;
		cha.y = y;

		cha.width = unit;
		cha.height = unit;

		if(unPush){
			return cha;
		}

		if(!chars[cha.stage]) chars[cha.stage] = {};
		chars[cha.stage][charName] = cha;
	};

	//删除一个人物
	var delChar = function(charName){
		var stage = chars[currentStage.stageName];
		if(stage[charName])
		delete stage[charName];
	};

	//获取活动对象
	var getChars = function(){
		return chars;
	};

	//重置活动对象
	var resetChars = function(stage){
		if(stage){
			chars[stage] = null;
			return false;
		}

		chars = null;
		chars = {};
	};

	return {
		addChar : addChar,
		delChar : delChar,
		resetChars : resetChars,
		getChars : getChars
	};

})();

/*################################################################*/

if( typeof module !== "undefined" && module.exports ){
	module.exports = Mota;
} else if( typeof define == "function" && define.amd ){
	define(function(){ return Mota; });
} else {
	window.Mota = Mota;
}

})(window,Math);
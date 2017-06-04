//具体实现
require.config({
	urlArgs : "v="+(new Date().getTime()),
	paths : {
		"Sprites" : "Sprites",
		"Mota" : "Mota",
		"Data" : "data"
	}
});

require(["Sprites","Mota","Data"],function(MotaSprites,Mota,MotaData){

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

var msp = MotaSprites,
	mt = Mota,
	mda = MotaData,
	canavs = document.querySelector("#canvas"),
	wrapper = document.querySelector(".wrapper"),
	cxt = canvas.getContext("2d");

var chars,    //活动对象类
	background, //背景对象
	UIBox,		//ui组件
	cw, //画布宽度
	ch, //画布高度
	prev = 0, //上一次保存时间
	standTime = 100, //当循环累计时间超过本值得时候才会进行一次动作
	pastTime = standTime, //已经消耗的时间
	pastTimeForCount = standTime / 1.4, //用于处理事件的已经消耗时间
	hero, //英雄对象
	unit, //单位像素
	currentStage; //目前的场景

//载入精灵
msp.addGroup(mda.sprites,function(){
	mt.initData(canvas,mda,msp,wrapper); //初始化(必须)
	mt.Stage.initStage();		 //初始化舞台

	cw = canvas.width;		
	ch = canvas.height;

	prev = new Date().getTime(); //上一次保存时间
	hero = mt.Character.addChar(mda.hero,"hero",true);//创建勇者
	unit = mt.unit;
	currentStage = mt.Stage.getCurrentStage();
	UIBox = mt.Stage.getUIBox();

	listen(); //绑定事件

	loop(mt.Stage,mt.Character,hero,0); //循环开始
});


//监听事件
var action;

function listen(){

	var keyVal = {
		"k37" : "left",
		"k38" : "up",
		"k39" : "right",
		"k40" : "down"
	};

	function getAction(code){
		if(keyVal["k"+code])
		action = keyVal["k"+code];
	}

	document.onkeydown = function(e){
		e = e || event;
		getAction(e.keyCode);
	};

	document.onkeyup = function(){
		action = "";
	};
};

var move = {

	count : function(hero,cha){
		var atk = cha.atk,
			def = cha.def,
			life = cha.life,
			h_atk = hero.atk,
			h_def = hero.def;

		if( h_atk <= def ){
			return "???";
		}

		if( atk < h_def ){
			return hero.life;
		}

		var h_life = hero.life,
			e_life = cha.life;
		
		while( tempLife > 0 ){
			var subMe = atk - h_def,
				subEm = h_atk - def;

			h_life -= subMe;
			e_life -= subEm;

			if( e_life <= 0 ){
				return h_life;
			}
		}

		return "???";
	},

	deal : function(chaName,cha,hero){
		if( hero.team & cha.team ){
			return false;
		}

		var life = this.count(hero,cha);

		if( life == "???" ){
			console.log("敌人太过强大");
			return false;
		}

		hero.life = life;
		hero.money += cha.money;
		hero.exp += cha.exp;

		mt.Character.delChar(chaName);

	},
	collide : function(nPid,nx,ny,UWNum,UHNum,unit,chars){
		if( ny < 0 || ny >= UHNum * unit || nx < 0 || nx >= UWNum * unit ){
			return false;
		}

		var charArr = Object.getOwnPropertyNames(chars);
		for( var i = 0, cha; cha = charArr[i++]; ){
			if( chars[cha].pid == ( "p_" + nPid ) && chars[cha].show ){
				this.deal(cha,chars[cha],hero);
				return false;
			}
		}

		return true;
	},

	up : function(hero,unit,currentStage,chars){
		var pid = hero.pid.split("_")[1],
			y = hero.y,
			nextPid = pid - mt.UWNum,
			ny = y - unit;

		if( this.collide(nextPid,hero.x,ny,mt.UWNum,mt.UHNum,unit,chars) ){
			pid = nextPid ;
			y = ny;
		}

		hero.currentAction = "up";
		hero.pid = "p_"+pid;
		hero.y = y;
	},

	down : function(hero,unit,currentStage,chars){
		var pid = hero.pid.split("_")[1] >> 0,
			y = hero.y,
			nextPid = pid + mt.UWNum,
			ny = y + unit;

		if( this.collide(nextPid,hero.x,ny,mt.UWNum,mt.UHNum,unit,chars) ){
			pid = nextPid ;
			y = y + unit;
		}

		hero.currentAction = "down";
		hero.pid = "p_"+pid;
		hero.y = y;
	},

	left : function(hero,unit,currentStage,chars){
		var pid = hero.pid.split("_")[1],
			x = hero.x,
			nextPid = pid - 1,
			nx = x - unit;

		if( this.collide(nextPid,nx,hero.y,mt.UWNum,mt.UHNum,unit,chars) ){
			pid = nextPid;
			x = x - unit;
		}

		hero.currentAction = "left";
		hero.pid = "p_"+pid;
		hero.x = x;
	},

	right : function(hero,unit,currentStage,chars){
		var pid = hero.pid.split("_")[1] >> 0,
			x = hero.x,
			nextPid = pid + 1,
			nx = x + unit;

		if( this.collide(nextPid,nx,hero.y,mt.UWNum,mt.UHNum,unit,chars) ){
			pid = nextPid;
			x = x + unit;
		}

		hero.currentAction = "right";
		hero.pid = "p_"+pid;
		hero.x = x;
	}

};

//绘制
function draw(cxt,background,chars,hero){
	var chaArr = Object.getOwnPropertyNames(chars);
	//绘制背景
	cxt.drawImage(background,0,0);

	var uiw = UIBox.width,
		uih = UIBox.height;
	//绘制UI
	cxt.drawImage(UIBox,0,0,uiw,uih,unit,unit,uiw,uih);

	//绘制勇者
	var h_act = hero[hero.currentAction],
		h_steps = h_act.steps,
		len = h_steps.length,
		idx = h_act.idx % len,
		step = h_steps[idx];

	cxt.drawImage(step,0,0,step.width,step.height,hero.x,hero.y,hero.width,hero.height);
	h_act.idx++;

	//绘制其他
	for( var i = 0, chaName; chaName = chaArr[i++]; ){
		var cha = chars[chaName];
		if(!cha.show){
			continue;
		}
		var	act = cha[cha.currentAction],
			steps = act.steps,
			len = steps.length,
			idx = act.idx % len,
			step = steps[idx],
			width = cha.width,
			height = cha.height;

		cxt.drawImage(step,0,0,step.width,step.height,cha.x,cha.y,width,height);
		act.idx++;
	}
}

//计算
function setup(chars){
	if(action && move[action])
	move[action](hero,unit,currentStage,chars);
};

//游戏循环
function loop(Stage,Char,hero,past){

	requestAnimationFrame(function(now){
		loop(Stage,Char,hero,now-prev);
		prev = now;
	});
	
	if( Stage.stageChanged ){
		var currentStage = Stage.getCurrentStage();
		chars = Char.getChars()[currentStage.stageName];
		background = Stage.getBackground();
		Stage.stageChanged = false;
	}

	past = Math.max( past, 0 );
	pastTime -= past;
	pastTimeForCount -= past;

	if( pastTimeForCount <= 0 ){
		setup(chars);
		pastTimeForCount = standTime / 1.4;
	}

	if( pastTime <= 0 ){
		pastTime = standTime;
		cxt.clearRect(0,0,cw,ch);
		draw(cxt,background,chars,hero);
	}
}

});
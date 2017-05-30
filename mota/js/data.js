(function(){
var Brave_Team = 1, //勇士队
 	Maou_Team = 2,  //魔王队
	Neutral_Team = 5; //中立队(建筑或者地形等)
/*************************************************************************************/
//场景数据
var MotaData = {
	"unit" : 60,
	"width" : 20, //整个场景地图的size num * unit
	"height" : 13,
	"UI" : {
		"scores" : {},
		"dialog" : {}
	},
	"stages" : {
		"stage_1" : {
			"name" : "map",
			"x" : 64,
			"y" : 0,
			"widthUnit" : 32,
			"heightUnit" : 32, //获取相关精灵的size
			"enemies" : {},
			"builds" : {},
			"startPid" : "p_214"
		},
		"stage_2" : {
			"name" : "map",
			"x" : 64,
			"y" : 0,
			"widthUnit" : 32,
			"heightUnit" : 32, //获取相关精灵的size
			"enemies" : {},
			"builds" : {},
			"startPid" : "p_44"
		}
	}
};

/*************************************************************************************/
//拷贝对象
var copyCharacters = function(obj){
	if( typeof obj != "object" ){
		return obj;
	} else if( obj instanceof Array ){
		return [].concat(obj);
	} else {
		var tempObj = {};
		for( var key in obj ){
			tempObj[key] = copyCharacters(obj[key]);
		}
		return tempObj;
	}
};
//合成对象
var extend = function(obj,targetObj){
	var nObj = copyCharacters(obj);
	for( var key in targetObj ){
		nObj[key] = targetObj[key];
	}
	return nObj;
};
/*************************************************************************************/
//人物数据

//勇者
var yongzhe = {
	//生成精灵图
	"down" : {
		"name" : "yongzhe",
		"widthUnit" : 32,
		"heightUnit" : 32,
		"sids" : [1,2,3,4], //第一行的1,2,3,4
		"steps" : [],
		"colNum" : 4, //所在精灵表对应的等距列数
		"idx" : 0
	},
	"up" : {
		"name" : "yongzhe",
		"widthUnit" : 32,
		"heightUnit" : 33,
		"sids" : [13,14,15,16],
		"steps" : [],
		"colNum" : 4,
		"idx" : 0
	},
	"left" : {
		"name" : "yongzhe",
		"widthUnit" : 32,
		"heightUnit" : 32,
		"sids" : [5,6,7,8],
		"steps" : [],
		"colNum" : 4,
		"idx" : 0
	},
	"right" : {
		"name" : "yongzhe",
		"widthUnit" : 32,
		"heightUnit" : 32,
		"sids" : [9,10,11,12],
		"steps" : [],
		"colNum" : 4,
		"idx" : 0
	},
	"currentAction" : "down",
	"show" : true,
	"pid" : "p_1",
	"life" : 1000,
	"atk" : 10,
	"def" : 10,
	"money" : 0,
	"exp" : 0,
	"callName" : "勇者",
	"team" : Brave_Team
};

//砖墙
var stoneWall = {
	"static" : {
		"name" : "map",
		"widthUnit" : 32,
		"heightUnit" : 32,
		"sids" : [2],
		"steps" : [],
		"colNum" : 4,
		"idx" : 0
	},
	"currentAction" : "static",
	"show" : true,
	"pid" : "p_5",
	"team" : Neutral_Team
};

/*******************stage1*********************/
function createBuilds(obj,targetObj,arr,opts){

	opts = opts || {};

	for( var i = 0, elem; elem = arr[i++]; ){
		opts.pid = "p_" + elem;
		obj[name+i] = extend(targetObj,opts);
	}

}

function createRowArr(start,num){
	var tempArr = [];
	for( var i = 0; i < num; i++ ){
		tempArr.push(start + i);
	}
	return tempArr;
};

function createColArr(start,num){
	var width = MotaData.width,
		tempArr = [];

	for( var i = 0 ; i < num; i++ ){
		tempArr.push( start + i * width );
	}

	return tempArr;
};

var stages = MotaData.stages,
	stg1 = stages.stage_1;

var stgRowArr_1 = createRowArr(8,13).concat(createRowArr(8+12*20,13)),
	stgColArr_1 = createColArr(8,13).concat(createColArr(20,13));
	stg_1_wallArr = stgColArr_1.concat(stgRowArr_1);

createBuilds(stg1.builds,stoneWall,stg_1_wallArr,{
	"stage" : "stage_1",
	"team" : Neutral_Team
});

/*****************************************/

var stg2 = stages.stage_2;
stg2.enemies.yz1 = copyCharacters(yongzhe);
stg2.enemies.yz1.stage = "stage_2";


MotaData.hero = copyCharacters(yongzhe);
MotaData.hero.pid = stg1.startPid;

/*************************************************************************************/

/*************************************************************************************/
//精灵表数据
MotaData.sprites = [
	{
		"name" : "map",
		"src" : "source/images/map.png" //材料，地图
	},
	{
		"name" : "map2",
		"src" : "source/images/map2.png" //材料，地图
	},
	{
		"name" : "yongzhe",
		"src" : "source/images/yongzhe.png" //勇者
	},
	{
		"name" : "sailaimu_lv1",
		"src" : "source/images/shilaimu_01.png" //低级史莱姆
	},
	{
		"name" : "sailaimu_lv2",
		"src" : "source/images/shilaimu_02.png" //中级史莱姆
	},
	{
		"name" : "sailaimu_lv3",
		"src" : "source/images/shilaimu_03.png" //勇者史莱姆
	},
	{
		"name" : "sailaimu_lv4",
		"src" : "source/images/shilaimu_04.png" //暗黑史莱姆
	},
	{
		"name" : "sailaimu_lv5",
		"src" : "source/images/shilaimu_05.png" //史莱姆之王
	}
];
/*************************************************************************************/


if( typeof module !== "undefined" && module.exports ){
	module.exports = MotaData;
} else if( typeof define == "function" && define.amd ){
	define(function(){ return MotaData; });
} else {
	window.MotaData = MotaData;
}

})();
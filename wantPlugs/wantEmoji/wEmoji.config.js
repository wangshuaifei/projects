(function(window){

var path = "http://localhost/OwnerProjects/wantPlugs/wantEmoji/",  //项目所在的根地址
	emojis = {
	"paopao" : {
		"name" : "泡泡", //名字
		"col" : 10, //每一行最大的表情个数(建议填选的时候值不要太大或太小)
		"path" : path+"emojiSources/paopao/", //相对于项目根地址的路径
		"enable" : true, //是否启用本表情包
		"sources" : ["1.jpg","2.jpg","3.jpg","4.jpg","6.jpg","7.jpg","8.jpg",
					 "9.jpg","10.jpg","11.jpg","12.jpg","13.jpg","14.jpg","15.jpg","16.jpg",
					 "17.jpg","18.png","19.png","20.png","21.png","22.png","23.png","24.png",
					 "25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png",
					 "33.png","34.png","35.png","36.png","37.png","38.jpg","39.png","40.png",
					 "41.jpg","42.png","43.png","44.png"
					] //中间的值也支持{title:"笑",url:"1.jpg"}的形式,且可单独设置
	},
	"paopao2" : {
		"name" : "泡泡2",
		"col" : 4,
		"path" : path+"emojiSources/paopao/",
		"enable" : true,
		"sources" : ["1.jpg","2.jpg","3.jpg","4.jpg","6.jpg","7.jpg","8.jpg",
					 "9.jpg","10.jpg","11.jpg","12.jpg","13.jpg","14.jpg","15.jpg","16.jpg",
					 "17.jpg","18.png","19.png","20.png","21.png","22.png","23.png","24.png",
					 "25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png",
					 "33.png","34.png","35.png","36.png","37.png","38.jpg","39.png","40.png",
					 "41.jpg","42.png","43.png","44.png"
					]
	},
	"paopao3" : {
		"name" : "泡泡3",
		"col" : 8,
		"path" : path+"emojiSources/paopao/",
		"enable" : true,
		"sources" : ["1.jpg","2.jpg","3.jpg","4.jpg","6.jpg","7.jpg","8.jpg",
					 "9.jpg","10.jpg","11.jpg","12.jpg","13.jpg","14.jpg","15.jpg","16.jpg",
					 "17.jpg","18.png","19.png","20.png","21.png","22.png","23.png","24.png",
					 "25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png",
					 "33.png","34.png","35.png","36.png","37.png","38.jpg","39.png","40.png",
					 "41.jpg","42.png","43.png","44.png"
					]
	},
	"huaji" : {
		"name" : "滑稽",
		"col" : 8,
		"path" : path+"emojiSources/huaji/",
		"enable" : true,
		"sources" : ["1.jpg","2.jpg","3.jpg","4.jpg","6.jpg","7.jpg","8.jpg",
					 "9.jpg","10.jpg","11.jpg","12.jpg","13.jpg","18.jpg","19.jpg","22.jpg"
					]
	},
	"baidu" : {
		"name" : "百度表情",
		"col" : 10,
		"path" : path+"emojiSources/tiebaemoji/",
		"enable" : true,
		"sources" : ["1.png","2.png","3.png","4.png","6.png","7.png","8.png",
					 "9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png",
					 "17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png",
					 "25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png",
					 "33.png","34.png","35.png","36.png","37.png","38.png","39.png","40.png",
					 "41.png","42.png","43.png","44.png","45.png","46.png","47.png","48.png",
					 "49.png","50.png"
					]
	}
};

window.emojis = emojis;

})(window);
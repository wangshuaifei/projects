var DMs = [];
for( var i = 0; i < 498; i++ ){
	var pos = i % 10 == 0 ? "top" : i % 9 == 0 ? "bottom" : "slide";
	DMs.push({
		text : "我是弹幕" + i,
		type : pos,
		time : "00:32",
		currentTime : (Math.random() * 96) >> 0
	});

	if( i % 10 == 0){
		DMs[i].color = "#ccff00";
	}
}

var H5Player = new DPlayer(".container",{
	autoplay : true,
	mode : "player",
	DM : {
		length : 0,
		textDM : {
			length : 0,
			data : DMs
		}
	}
});
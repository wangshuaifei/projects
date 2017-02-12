//author:孤月
//date:2015/07/17
//变量定义
var sWay 	= document.getElementById("way_choose"),	   //获取得到图片链接的方式
	sGetUrl = "",										   //当获取方式为链接时,存放获取的链接地址
	sFile	= "",										   //当获取方式为本地时,存放获取的文件信息
	sType	= "",										   //获取要转换的格式
	nQuali	= document.getElementById("quality");	   		//获取图片转换的质量(压缩比)

var urlInput  = document.getElementById("urlGet"),
	file 	  = document.getElementById("file"),
	sourceImg = document.getElementById("source_img"),
	previewImg= document.getElementById("preview_img"),
	canvas	  = document.getElementById("canvas"),
	typeList  = document.querySelector(".type_list"),
	turnTo	  = document.getElementById("turnTo"),
	download  = document.getElementById("download");

var mimeTypeGet,		//获取img格式
	canDownload=false,	//是否可以开始下载
	cross,				//是否是外链
	go=true;			//是否文件或链接或转换格式改变


//获取要转换的目标图片类型
function getType () {
	var type;
	//侦听click事件
	typeList.addEventListener("click",function(e){
		e = e || event;
		if(e.target.tagName.toLowerCase()!="li")
		return;
		var val = e.target.innerHTML;
		var ch = typeList.children;
		
		for(var x=0;x<ch.length;x++)
		ch[x].setAttribute("class","");
		e.target.setAttribute("class","bgAdd");
		
		//当目标类型改变时，允许转换
		if(sType!=val.toLowerCase)
		go = true;

		sType = val.toLowerCase();
		if(sType=="jpg")
		{
			document.getElementById("quality").style.display="inline-block";
			document.querySelector(".t2").style.display="none";
			document.querySelector(".t1").style.display="block";
		}
		else{
			document.getElementById("quality").style.display="none";
			document.querySelector(".t1").style.display="none";
			document.querySelector(".t2").style.display="block";
		}
	},false);
}

//获取图片取得方式
function wayChange(){
	//侦听change事件
	sWay.addEventListener("change",function(){
		var fc = document.querySelector(".file_choose"),
			ui = document.querySelector(".url_input");
		(sWay.value=="本地文件选择")?FileShow():UrlShow();
		function FileShow(){
			fc.style.display = "block";
			ui.style.display = "none";
			cross = false;
		};

		function UrlShow(){
			fc.style.display = "none";
			ui.style.display = "block";
			cross = true;
		}

		turnTo.style.display = "none";
		download.style.display="none";
		file.value = "";
		urlGet.value = "";
	},false);
}

//当文件域变化
function fileChange(){
	file.addEventListener("change",function(){

		//读取文件
		var files = file.files[0];
		var reader = new FileReader();
		reader.onload = function(e){
			go = true;
			e = e || event;
			sourceImg.src = e.target.result;
			turnTo.style.display = "inline-block";
			download.style.display="inline-block";
			transformImg();
		};
		reader.readAsDataURL(files);
	},false);
}

//当地址输入完毕
function urlInputEnd(){
	var match;
	urlInput.addEventListener("blur",function(){
		//匹配链接
		if(!urlInput.value)
		return;
		match = /.jpg|.png|.gif|.bmp/;
		sGetUrl = urlGet.value;
		var temp = sGetUrl.substring(sGetUrl.lastIndexOf("."));
		if(match.test(temp))
		{
			sourceImg.src = sGetUrl;
			sourceImg.onload = function(){
				go = true;
				turnTo.style.display = "inline-block";
				download.style.display="inline-block";
				transformImg();
			};
		}
	},false)
}

//压缩比变化时
function qualityChange(){
	nQuali.onchange = function(e){
		//限制取值
		var val = e.target.value.toFixed(0);
		if(!val || val>100 || val<10)
		nQuali.value = 50;
	};
}

//img下载
function downlo(){
	download.onclick = function(){
		if(canDownload)
		{  
			// 加工image data，替换mime type
			var imgData = previewImg.src.replace(mimeTypeGet,'image/octet-stream');
			//download
			var down = document.getElementById("downIMG");
			down.href = imgData;
			down.download = "IGotIt-"+(new Date()).getTime()+"."+(sType?sType:"jpg");
			var mouseEv = document.createEvent("MouseEvents");
			mouseEv.initMouseEvent("click",false,false,window,0,0,0,0,0,false,false,false,false,0,null);
			down.dispatchEvent(mouseEv);
		} else {
			alert("请先进行转换!");
		}
	};
}

//转换
function transformImg(){
	turnTo.onclick = function(e){
		e = e || event;
		e.stopPropagation();
		e.preventDefault();
		var type = sType || "jpg" ,
			mimeType,
			newImage = new Image(),
			cv = canvas,
			ct = cv.getContext('2d');
		
		if(type=="jpg")
		mimeType = "image/jpeg";
		else
		mimeType = "image/"+type;

		mimeTypeGet  = mimeType;

		if(cross && go){
			//获取外链地址并将其传入服务器
			var xhr = new XMLHttpRequest();
			var nForm = new FormData();

			nForm.append("url",sourceImg.src);
			nForm.append("type",sourceImg.src.substring(sourceImg.src.lastIndexOf('.')));
			
			xhr.open('POST','php/send.php');
			xhr.send(nForm);

			xhr.addEventListener("load",function(e){
				go = false;
				var newSrc = e.target.responseText;
				newImage.src = newSrc;
				newImage.onload = function(){
					previewImg.src=trans().src;
					nForm.append("del",true);
					xhr.open("POST",'php/del.php');
					xhr.send(nForm);
				};
			},false);
		} else if(go){
			newImage.src = sourceImg.src;
			previewImg.src=trans().src;
		}

		function trans(){
			cv.width = newImage.width;
			cv.height= newImage.height;
			ct.drawImage(newImage,0,0);
			if(mimeType=="image/jpeg")
			var newData = cv.toDataURL(mimeType,nQuali.value/100);
			else
			var newData = cv.toDataURL(mimeType); 
			var nImage = new Image();
			nImage.src = newData;
			canDownload = true;
			downlo();
			return nImage;
		}
	};
}

function init(){
	getType();
	wayChange();
	fileChange();
	urlInputEnd();
	qualityChange();
}

init();
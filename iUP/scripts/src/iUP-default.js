define(function(){

	var iup,
		box = document.querySelector(".iUP-images-box"),
		fileEle = document.getElementById("iUP-choose");

	function init(){

		fileEle.onchange = function(e){
			var files = fileEle.files;

			readFiles(files);

		};

	}

	function readFiles(files){

		for( var i = 0, file; file = files[i++]; ){
			iup.input(file,i,function(data){
				var tpl = '<div class="iUP-item">'+
					'<div class="iUP-layer iUP-hide"></div>'+
					'<div class="iUP-image">'+
						'<img src="'+data.dataUrl+'" data-id="'+data.id+'">'+
					'</div>'+
					'<div class="iUP-close iUP-hide">X</div>'+
				'</div>';

				box.innerHTML += tpl;
			});
		}

	}

	return function(iUP){
		iup = iUP
		init();
	};

});
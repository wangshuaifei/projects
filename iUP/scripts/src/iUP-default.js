define(function(){

	var iup,
		box = document.querySelector(".iUP-images-box"),
		upBtn = document.querySelector(".iUP-btn"),
		fileEle = document.getElementById("iUP-choose");

	function init(){

		fileEle.onchange = function(e){
			var files = fileEle.files;

			readFiles(files);

		};

		box.onclick = function(e){

			var tar = e.target,
				clist = tar.classList,
				hasClass = false;

			for( var i = 0, list; list = clist[i++]; ){
				if( list == "iUP-close" ){
					hasClass = true;
					break;
				}
			}

			if(!hasClass) return false;

			var item = tar.parentNode,
				id = item.querySelector(".iUP-image").getAttribute("data-id");

			iup.delete(id);
			
			item.classList.push("iUP-hide");

		};

		upBtn.onclick = function(e){



		};

	}

	function readFiles(files){

		for( var i = 0, file; file = files[i++]; ){
			iup.input(file,i,function(data){
				var tpl = '<div class="iUP-item">'+
					'<div class="iUP-layer iUP-hide"></div>'+
					'<div class="iUP-image" data-id="'+data.id+'">'+
						'<img src="'+data.dataUrl+'">'+
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
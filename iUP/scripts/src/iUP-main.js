define(function(require){

	var fns = {

		files : [],

		input : function(file,id,callback){
			
			callback = callback || function(){};

			if( !id ) {
				console.log("请填写id");
				return false;
			}

			if( !file || !this.isImage(file) ){
				console.log("文件不存在或者类型不正确");
				return false;
			}

			this.reader(file,id,callback);

		},

		isImage : function(file){
			var reg = new RegExp("image");
			return reg.test(file.type);
		},

		reader : function(file,id,callback){

			var reader = new FileReader(),
				_self = this;

			reader.onload = function(e){
				var res = e.target.result,
					obj = {
						file : file,
						dataUrl : res,
						id : id
					};

				_self.files.push(obj);

				callback(obj,_self.files);
			};

			reader.onerror = function(e){
				console.log("文件不能被读取");
			};

			reader.readAsDataURL(file);

		},

		getFileNum : function(){
			return this.files.length;
		},

		clear : function(){
			this.files.length = 0;
		},

		delete : function(id){
			if(!id){
				console.log("请填写id");
				return false;
			};

			for( var i = 0, file; file = this.files[i++]; ){
				if(file.id == id){
					this.files.splice(i-1,1);
					break;
				}
			}

		},

		upload : function(options){
			
			var url = options.url || "",
				type = options.type || "file",
				success = options.success || function(){},
				fail = options.fail || function(){};

			var fd = new FormData(),
				xhr = new XMLHttpRequest(),
				_self = this;

			if(!url) return false;

			if( type == "upfile" ){
				for( var i = 0, fileObj; fileObj = this.files[i++]; ){
					fd.append("file_"+i,fileObj.file);
				}
				fd.append("type","file");
			} else {
				for( var i = 0, fileObj; fileObj = this.files[i++]; ){
					fd.append("imgBase64Src_"+i,fileObj.dataUrl);
				}
				fd.append("type","dataUrl");
			}
				

			xhr.onload = function(e){
				success(e);
			};

			xhr.onerror = function(e){
				fail(e);
			};

			xhr.upload.onprogress = function(e){
				var obj = {
					total : e.total,
					loaded : e.loaded
				};

				_self.progress = obj;
			};

			xhr.open("post",url);

			xhr.send(fd);

		},

		getProgress : function(){
			return this.progress;
		}
		
	};

	var proxy = function(prop){
		return !!fns[prop] && fns[prop].bind(fns);
	};

	return {
		input : proxy("input"),
		clear : proxy("clear"),
		delete : proxy("delete"),
		getFileNum : proxy("getFileNum"),
		upload : proxy("upload"),
		getProgress : proxy("getProgress")
	};

});
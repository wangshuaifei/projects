(function(window){

require.config({
	baseUrl : "./scripts",
	paths : {
		"iUP" : "src/iUP-main",
		"tpl_default" : "src/iUP-default"
	},
	urlArgs : "v=" + (new Date()).getTime()
});

require(["iUP","tpl_default"],function(iUP,def){

	def(iUP);

});

})(this);
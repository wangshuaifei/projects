(function(window,Math,undefined){

class watch3D {
    //参数配置
    constructor(opts){

        this.auto = opts.auto === false ? false : true;

        this.box = opts.wrapper || "body";

        this.num = Math.min(opts.num || 0,4) || 18;

        this.resource = opts.resource || "";

        this.width = opts.width || 100;

        this.height = opts.height || 100;

        this.tips = opts.tips || {}; //放置tips

        this.maxY = opts.maxY || 5;

        this.unit = this.width / this.num;

        this.translateZ = ( this.unit / 2 ) / ( Math.tan( Math.PI / 180 * 360 / this.num / 2 ) ) - 5;

        this.stage = null;

        this.rotateBox = null;

        this.lists = null;

        this.rotateAngle = { x : 0, y : 0 };

        this.error = opts.error || function(){};

        this.init();

    }
    //检查传入的资源类型（element或src）
    checkType(target){
        return Object.prototype.toString.call(target) === '[object String]' ? "string" : "element";
    }
    //生成单元列表
    _createList(i,src){
        let list = document.createElement("div");
        list.className += "watch3D-list list-"+(i+1);
        list.style.backgroundImage = "url("+src+")";
        list.style.backgroundRepeat = "no-repeat";
        list.style.backgroundPosition = -this.unit * i +"px 0px";
        list.style.height = this.height + "px";
        list.style.width = this.unit+"px";
        list.style.webkitTransform = "rotateY("+(i*360/this.num)+"deg) rotateZ(0deg) translateZ("+this.translateZ+"px)";
        list.style.transform = "rotateY("+(i*360/this.num)+"deg) rotateZ(0deg) translateZ("+this.translateZ+"px)";

        return list;
    }
    //初始化组件
    init(){

        this.box = this.checkType(this.box) === "string" ? document.querySelector(this.box) : this.box;

        this._template();

        if(this.auto)
        this.loadResources();
    }
    //加载资源
    loadResources(){

        if( typeof this.resource === "string" && !!this.resource )
        this._loadSingle();

    }
    _loadSingle(){
        let img = new Image();
        let _self = this;
        img.onload = function(){
            let fg = document.createDocumentFragment();

            for( let i = 0; i < _self.num; i++ ){
                let list = _self._createList(i,_self.resource);
                fg.appendChild(list);
            }
            _self.lists.appendChild(fg);
            _self.lists.style.height = this.height+"px";
        };
        img.onerror = function(){
            _self.error("图片加载失败");
        };
        img.src = this.resource;
    }
    //加载中的事件处理
    _loading(){

    }
    //加载完成的事件处理
    _loadend(){

    }
    //触摸开始
    _start(){

    }
    //触摸中
    _move(){

        let angle = this.rotateAngle;

        this.rotateBox.style.cssText = "-webkit-transform: rotateX("+angle.y+"deg) rotateY("+angle.x+"deg);\
                                        transform: rotateX("+angle.y+"deg) rotateY("+angle.x+"deg);"
    }
    //触摸结束
    _end(){

    }
    //更新模板
    _template(){

        this.box.innerHTML = "";

        let tpl = '<div class="watch3D">\
                    <div class="watch3D-container">\
                        <div class="watch3D-bg"></div>\
                        <div class="watch3D-wrapper">\
                            <div class="watch3D-lists"></div>\
                       </div>\
                   </div>\
                </div>';

        this.box.innerHTML = tpl;

        this.stage = this.box.querySelector(".watch3D");

        this.rotateBox = this.box.querySelector(".watch3D-wrapper");

        this.lists = this.box.querySelector(".watch3D-lists");

        this._eventBind();
    }
    //事件绑定
    _eventBind(){

        let start = "ontouchstart" in document ? "touchstart" : "mousedown";
        let move = "ontouchmove" in document ? "touchmove" : "mousemove";
        let end = "ontouchend" in document ? "touchend" : "mouseup";

        let ele = this.stage;

        let draging = false;

        let prevPoint = { x : 0, y : 0 };

        let _self = this;

        let rx = this.rotateAngle.x;
        let ry = this.rotateAngle.y;

        ele["on"+start] = function (e) {
            draging = true;
            let x = e.screenX || e.touches[0].screenX;
            let y = e.screenY || e.touches[0].screenY;

            prevPoint = { x , y };

            _self._start(prevPoint);
        };

        ele["on"+move] = function (e) {
            e.stopPropagation();
            e.preventDefault();

            if(!draging) return false;

            let x = e.screenX || e.touches[0].screenX || e.changeTouches[0].screenX;
            let y = e.screenY || e.touches[0].screenY || e.changeTouches[0].screenY;

            rx += (x - prevPoint.x);
            ry += (y - prevPoint.y);

            prevPoint.x = x;
            prevPoint.y = y;

            if( ry > _self.maxY ) ry = _self.maxY;
            else if( ry < -_self.maxY ) ry = -_self.maxY;

            _self.rotateAngle = { x : rx , y : ry };

            _self._move();
        };

        ele["on"+end] = function (e) {
          draging = false;
          _self._end();
        };

        ele.onmouseleave = function () {
          draging = false;
          _self._end();
        };

    }
}

new watch3D({
   wrapper : ".wrapper",
   width: 4000,
   height : 2000,
   resource : "src/sources/sun.jpg"
});

})(window,Math);
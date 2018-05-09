(function(window,Math,undefined){

class watch3D {
    //参数配置
    constructor(opts){

        this.auto = opts.auto === false ? false : true;

        this.box = opts.wrapper || "body";

        this.num = opts.num >= 4 ? opts.num : 18;

        this.resource = opts.resource || "";

        this.width = opts.width || 100;

        this.height = opts.height || 100;

        this.tips = opts.tips || {}; //放置tips

        this.maxY = opts.maxY || 15;

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
    _createList(i,src,id){

        let list = document.createElement("div");
        list.className += "watch3D-list list-"+(id+1);
        list.style.backgroundImage = "url("+src+")";
        list.style.backgroundRepeat = "no-repeat";
        list.style.backgroundPosition = -this.unit * i +"px 0px";
        list.style.backgroundSize = "cover";
        list.style.height = this.height + "px";
        list.style.width = this.unit+"px";
        list.style.webkitTransform = "translate(-50%,-50%) rotateY("+(id*360/this.num)+"deg) rotateZ(0deg) translateZ("+this.translateZ+"px)";
        list.style.transform = "translate(-50%,-50%) rotateY("+(id*360/this.num)+"deg) rotateZ(0deg) translateZ("+this.translateZ+"px)";

        return list;
    }
    //生成tip
    _createTip(id,data){
        
        let tip = this.tips[id];

        let tpl = '<div class="tip" style="">\
                        <div class="tip-point">\
                        </div>\
                        <div class="tpl-content">\
                        </div>\
                    </div>';

        return tpl;

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

        if( !this.resource ) return false;

        if( typeof this.resource === "string" )
        this._loadSingle();
        else
        this._loadMulti();

    }
    //加载单张图片
    _loadSingle(){
        let img = new Image();
        let _self = this;
        let fg = document.createDocumentFragment();

        img.onload = function(){

            for( let i = 0; i < _self.num; i++ ){
                let list = _self._createList(i,_self.resource,i);
                fg.appendChild(list);
            }

            _self._loading( { loaded : 1, total : 1 } );
            _self._loadend( {
                fg,
                success : { num : 1, list : [_self.resource] },
                fail : { nnum : 0, list : [] }
            } );
        };
        img.onerror = function(){
            _self._loading( { loaded : 1, total : 1 } );
            _self._loadend( {
                fg,
                success : { num : 0, list : [] },
                fail : { nnum : 1, list : [_self.resource] }
            } );
        };
        img.src = this.resource;
    }
    //加载图片数组
    _loadMulti(){
        let _self = this;
        let len = _self.resource.length;
        let loaded = {
            num : 0,
            list : []
        };
        let failed = {
            num : 0,
            list : []
        };
        let fg = document.createDocumentFragment();

        for( let i = 0,item; item = this.resource[i++]; ){
            (function(i,item){
                let img = new Image();
                img.onload = function () {
                    loaded.num++;
                    loadCheck();
                };
                img.onerror = function () {
                    failed.num++;
                    loadCheck();
                };

                function loadCheck(){
                    _self._loading( { loaded: loaded.num + failed.num, total : len } );

                    let list = _self._createList( 0, item, i - 1 );

                    fg.appendChild(list);

                    if( loaded.num === len - failed.num )
                    _self._loadend( {
                        fg,
                        success : loaded,
                        fail : failed
                    } );
                }

                img.src = item;
            }(i,item));
        }
    }
    //加载中的事件处理
    _loading(){

    }
    //加载完成的事件处理
    _loadend(data){
        this.lists.appendChild(data.fg);
        this.lists.style.height = this.height + "px";
    }
    //触摸开始
    _start(){

    }
    //触摸中
    _move(){

        let angle = this.rotateAngle;

        this.rotateBox.style.cssText = "-webkit-transform: translateZ("+(1050 - this.translateZ)+"px) rotateX("+angle.y+"deg) rotateY("+angle.x+"deg);\
                                        transform: translateZ("+(1050 - this.translateZ)+"px) rotateX("+angle.y+"deg) rotateY("+angle.x+"deg);"
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

        this.container = this.box.querySelector(".watch3D-container");

        this.rotateBox = this.box.querySelector(".watch3D-wrapper");

        this.rotateBox.style.cssText = "-webkit-transform: translateZ("+(1050 - this.translateZ)+"px);\
                                        transform: translateZ("+(1050 - this.translateZ)+"px)";

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
    width: 4032,
    height : 500,
    num : 8,
    resource : [
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png",
        "src/sources/lt.png"
    ]
});

})(window,Math);
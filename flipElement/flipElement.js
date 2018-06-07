(function(window,Math,undefined){

class FlipElement {
    constructor(opts){
        //插件容器
        this.box = document.querySelector(opts.wrapper || "body");
        //插件内部容器 .flip-element-container
        this.elem = null;
        //包裹元素 .flip-element-wrapper
        this.wrapper = null;
        //是否执行展开状态，true为展开，false为收拢
        this.doShow = true;
        //被折叠的条目元素集合
        this.items = opts.items || [];
        //封面元素
        this.faceItem = opts.face || "";
        //是否正在动画中
        this.animating = false;

        //初始化
        this.init();

    }

    bindEvent(){
        let items = this.box.querySelectorAll(".flip-item");
        //获取封面元素
        let face = this.box.querySelector(".flip-element-face");

        let _self = this;

        //调节封面高度
        face.style.height = this.firstItemHeight + "px";

        //绑定点击事件
        this.elem.onclick = function(){
            //如果在动画中，返回false
            if(_self.animating) return false;

            _self.animating = true;

            //切换状态
            _self.doShow ?  _self.show(items,face) : _self.hide(items,face);
        };
    }

    hide(items,face){
        let _self = this;
        let last = items[items.length-1];

        //防止样式变化导致的显示和动画BUG，需要在动画完成后调整样式
        _self.hideAll(last,function () {
            //调整封面
            face.style.webkitTransform = "translateZ(2px) rotateX(0deg)";
            face.style.transform = "translateZ(2px) rotateX(0deg)";
            //
            setTimeout(function(){
                for( let item of items ){
                    item.style.height = _self.firstItemHeight + "px";
                    item.style.overflow = "hidden";
                }
                _self.animating = false;
            },100);
        });
        _self.doShow = true;
    }

    hideAll(wrap,callback){
        let _self = this;

        callback = callback || function(){};

        if( !this.parent(wrap,"flip-item") ){
            callback();
            return false;
        }

        let transEnd = function(){
            let newWrap = _self.parent(wrap,"flip-item");

            wrap.removeEventListener("webkitTransitionEnd",transEnd);
            wrap.removeEventListener("transitionend",transEnd);

            if(newWrap) _self.hideAll(newWrap,callback);
        };

        wrap.addEventListener("webkitTransitionEnd",transEnd);
        wrap.addEventListener("transitionend",transEnd);

        wrap.style.webkitTransform = "rotateX(180deg) translateZ(-1.1px)";
        wrap.style.transform = "rotateX(180deg) translateZ(-1.1px)";
    }

    init(){
        //初始化模板
        this.initTemplate();
        //重新设置样式
        this.reInitStyle();
        //绑定事件
        this.bindEvent();
    }

    initItemStyle(index,elem){
        let ang = index == 0 ? 0 : 180;
        let transZ = index == 0 ? 0 : -1.1;
        elem.style.webkitTransform = "rotateX("+ang+"deg) translateZ("+transZ+"px)";
        elem.style.transform = "rotateX("+ang+"deg) translateZ("+transZ+"px)";
    }

    initTemplate(){
        //创建代码片段
        let fg = document.createDocumentFragment();
        //保存前一个item元素
        let prev = null;
        //索引
        let index = 0;
        //生成基本模板
        this.box.innerHTML = '<div class="flip-element-container">' +
                                '<div class="flip-element-wrapper">' +
                                    '<div class="flip-element-face">'+
                                        '<div class="flip-face-bg"></div>'+
                                        '<div class="flip-face-img">'+this.faceItem+'</div>'+
                                    '</div>'+
                                '</div>' +
                            '</div>';
        //赋值保存
        this.elem = this.box.querySelector(".flip-element-container");
        this.wrapper = this.box.querySelector(".flip-element-wrapper");

        //生成折叠结构
        for( let item of this.items ){
            let div = document.createElement("div");
            div.classList.add("flip-item");
            div.innerHTML = '<div class="flip-item-bg flip-element-bg"></div>'+
                            '<div class="flip-content">'+
                                item.text +
                            '</div>';
            //如果已存在父节点，则将新节点挂载在父节点下，否则挂在代码片段的根节点下
            prev ? prev.appendChild(div) : fg.appendChild(div);
            prev = div;
            //初始化节点样式
            this.initItemStyle(index,div);
            index++;
        }

        this.wrapper.appendChild(fg);
    }

    parent(target,selector){
        let par = target.parentNode;
        if( !par ) return null;
        let classes = par.classList;
        if( classes && classes.contains(selector) ){
            return par;
        }
        return this.parent(par,selector);
    }

    reInitStyle(){

        let items = this.wrapper.querySelectorAll(".flip-item");

        for( let [index,item] of items.entries() ){
            //获取每个节点内容的高度，并对背景元素的高度进行重设
            let ch = item.querySelector(".flip-content").clientHeight;
            item.querySelector(".flip-item-bg").style.height = ch + "px";
            //如果为第一个节点，记录下其内容高度（用于后面对封面高度的设置）,并调整节点的高度，用于调节样式显示问题
            if( index === 0 ){
                this.firstItemHeight = ch;
                item.style.height = ch + "px";
            }
            //调整所有节点的高度（为了保证样式显示正确）
            item.style.height = this.firstItemHeight + "px";
        }
    }

    select(selector,boxer = this.box){
        return boxer.querySelector(selector) || null;
    }

    show(items,face){
        let _self = this;
        //从第二个元素开始展开
        let first = items[1];
        face.style.webkitTransform = "translateZ(-2px) rotateX(-180deg)";
        face.style.transform = "translateZ(-2px) rotateX(-180deg)";

        //调整样式显示方式
        setTimeout(function(){
            for( let item of items ){
                item.style.height = "auto";
                item.style.overflow = "visible";
            }
        },100);

        _self.showAll(first,function(){
            _self.animating = false;
        });
        _self.doShow = false;
    }

    showAll(wrap,callback){

        let _self = this;

        callback = callback || function(){};

        let transEnd = function(){

            let newWrap = _self.select(".flip-item",wrap);

            wrap.removeEventListener("webkitTransitionEnd",transEnd);
            wrap.removeEventListener("transitionend",transEnd);

            if(newWrap) _self.showAll(newWrap,callback);
            else callback();

        };

        wrap.addEventListener("webkitTransitionEnd",transEnd);
        wrap.addEventListener("transitionend",transEnd);

        wrap.style.webkitTransform = "rotateX(0deg) translateZ(0px)";
        wrap.style.transform = "rotateX(0deg) translateZ(0px)";
    }
}

//调用1
new FlipElement({
    wrapper : '.box',
    face : "<div style='text-align: center;font-size: 20px;color: #876;'>hello,world!</div>",
    items : [
        {
            text : '<div class="title">1.sadasd</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">2.sadasd</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">3.sadasd</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">4.sadasd</div><div class="content">阿瑟大时代撒旦</div>'
        }
    ]
});

//调用2
new FlipElement({
    wrapper : '.box2',
    face : "<img src='bg2.jpg' >",
    items : [
        {
            text : '<div class="title">1.sadasddsa</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">2.sadasdsad</div><div class="content">阿瑟大时代撒旦<div>asdasdsadsa</div></div>'
    },
        {
            text : '<div class="title">3.sadasdda</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">4.sadasdads</div><div class="content">阿瑟大时代撒旦</div>'
        }
    ]
});

})(window,Math);
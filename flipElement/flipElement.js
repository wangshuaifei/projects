(function(window,Math,undefined){

class FlipElement {
    constructor(opts){
        this.box = document.querySelector(opts.wrapper || "body");

        this.elem = null;

        this.wrapper = null;

        this.doShow = true;

        this.items = opts.items || [];

        this.faceItem = opts.face || "";

        this.init();
    }

    bindEvent(){
        let items = this.box.querySelectorAll(".flip-item");
        let face = this.box.querySelector(".flip-element-face");
        let first = items[1];
        let last = items[items.length-1];
        let _self = this;

        this.elem.onclick = function(){
            if( _self.doShow ){
                items[0].style.height = "auto";
                face.style.webkitTransform = "translateZ(-1px) rotateX(-180deg)";
                face.style.transform = "translateZ(-1px) rotateX(-180deg)";
                _self.showAll(first);
                _self.doShow = false;
            } else {
                _self.hideAll(last,function () {
                    face.style.webkitTransform = "translateZ(2px) rotateX(0deg)";
                    face.style.transform = "translateZ(2px) rotateX(0deg)";
                    setTimeout(function(){
                        items[0].style.height = _self.firstItemHeight + "px";
                    },300);
                });
                _self.doShow = true;
            }

        };
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
        this.initTemplate();
        this.reInitStyle();
        this.bindEvent();
    }

    initStyle(index,elem){
        let ang = index == 0 ? 0 : 180;
        elem.style.webkitTransform = "rotateX("+ang+"deg) translateZ(-1.1px)";
        elem.style.transform = "rotateX("+ang+"deg) translateZ(-1.1px)";
    }

    initTemplate(){
        let fg = document.createDocumentFragment();

        let prev = null;

        let index = 0;

        this.box.innerHTML = '<div class="flip-element-container">' +
                                '<div class="flip-element-wrapper">' +
                                    '<div class="flip-element-face">'+
                                        '<div class="flip-face-bg"></div>'+
                                        '<div class="flip-face-img">'+this.faceItem+'</div>'+
                                    '</div>'+
                                '</div>' +
                            '</div>';

        this.elem = this.box.querySelector(".flip-element-container");
        this.wrapper = this.box.querySelector(".flip-element-wrapper");

        for( let item of this.items ){
            let div = document.createElement("div");
            div.classList.add("flip-item");
            div.innerHTML = '<div class="flip-item-bg flip-element-bg"></div>'+
                            '<div class="flip-content">'+
                                item.text +
                            '</div>';
            prev ? prev.appendChild(div) : fg.appendChild(div);
            prev = div;
            this.initStyle(index,div);
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
            let ch = item.querySelector(".flip-content").clientHeight;
            item.querySelector(".flip-item-bg").style.height = ch + "px";
            if( index === 0 ){
                this.firstItemHeight = ch;
                item.style.height = ch + "px";
            }
        }
    }

    select(selector,boxer = this.box){
        return boxer.querySelector(selector) || null;
    }

    showAll(wrap){
        let _self = this;

        let transEnd = function(){

            let newWrap = _self.select(".flip-item",wrap);

            wrap.removeEventListener("webkitTransitionEnd",transEnd);
            wrap.removeEventListener("transitionend",transEnd);

            if(newWrap) _self.showAll(newWrap);
        };

        wrap.addEventListener("webkitTransitionEnd",transEnd);
        wrap.addEventListener("transitionend",transEnd);

        wrap.style.webkitTransform = "rotateX(0deg) translateZ(0px)";
        wrap.style.transform = "rotateX(0deg) translateZ(0px)";
    }
}

new FlipElement({
    wrapper : '.box',
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

new FlipElement({
    wrapper : '.box2',
    face : "<img src='bg2.jpg' >",
    items : [
        {
            text : '<div class="title">1.sadasddsa</div><div class="content">阿瑟大时代撒旦</div>'
        },
        {
            text : '<div class="title">2.sadasdsad</div><div class="content">阿瑟大时代撒旦</div>'
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
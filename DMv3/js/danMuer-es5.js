"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window, Math, undefined) {

	var loop = Symbol("loop");
	var init = Symbol("init"); //初始化
	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	//es6

	var normalDM = function () {
		function normalDM(cv) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_classCallCheck(this, normalDM);

			this.save = [];
			this.canvas = cv;
			this.cxt = cv.getContext('2d');

			this.width = 0;
			this.height = 0;

			this.rows = {
				slide: [],
				top: [],
				bottom: []
			};
			this.leftTime = opts.leftTime || 2000;
			this.space = opts.space || 10;
			this.unitHeight = 0;
			this.rowNum = 0;

			this.startIndex = 0;
			this.looped = false;

			this.changeStyle(opts);
		}

		//更新canvas size


		_createClass(normalDM, [{
			key: "getSize",
			value: function getSize() {
				this.width = this.canvas.width;
				this.height = this.canvas.height;

				this.countRows();
			}

			//生成通道行

		}, {
			key: "countRows",
			value: function countRows() {
				var unitHeight = parseInt(this.globalSize) + this.space;
				var rowNum = (this.height - 20) / unitHeight >> 0;

				var rows = this.rows;

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = Object.keys(rows)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var key = _step.value;

						rows[key] = [];
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				for (var i = 0; i < rowNum; i++) {
					var obj = {
						y: unitHeight * i + 20
					};
					rows.slide.push(obj);

					i >= rowNum / 2 ? rows.bottom.push(obj) : rows.top.push(obj);
				}

				this.unitHeight = unitHeight;
				this.rowNum = rowNum;
			}

			//获取通道

		}, {
			key: "getRow",
			value: function getRow(item) {

				if (item.row) return item.row;

				var _ref = [this.rows, item.type],
				    rows = _ref[0],
				    type = _ref[1];

				var row = type != "bottom" ? rows[type].shift() : rows[type].pop();
				var tempRow = {
					y: 20 + this.unitHeight * (Math.random() * this.rowNum << 0),
					speedChange: type == "slide"
				};

				return row || rempRow;
			}

			//添加

		}, {
			key: "add",
			value: function add(obj) {
				if (!obj) return;

				if (this.looped) this.countWidth([obj]);

				this.save.push(obj);
			}

			//清除

		}, {
			key: "clear",
			value: function clear() {
				this.save = [];
			}

			//改变全局样式

		}, {
			key: "changeStyle",
			value: function changeStyle() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				this.globalSize = opts.fontSize || this.globalSize || "24px"; //字体大小
				this.globalFamily = opts.fontFamily || this.globalFamily || "微软雅黑"; //字体
				this.globalStyle = opts.fontStyle || this.globalStyle || "normal"; //字体样式
				this.globalWeight = opts.fontWeight || this.globalWeight || "normal"; //字体粗细
				this.globalColor = opts.fontColor || this.globalColor || "#ffffff"; //字体颜色

				this.globalChanged = true;
			}

			//启用全局样式

		}, {
			key: "initStyle",
			value: function initStyle(cxt) {

				this.globalChanged = false;

				this.font();

				cxt.font = this.globalFont;
				cxt.textBaseline = "middle";
				cxt.fillStyle = this.globalColor;
			}

			//计算宽度

		}, {
			key: "countWidth",
			value: function countWidth(items) {
				var cxt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.cxt;

				this.looped = true;
				var cw = this.width;
				var _ref2 = [0],
				    i = _ref2[0],
				    item = _ref2[1];

				for (; item = items[i++];) {
					var w = cxt.measureText(item.text).width >> 0;
					item.width = w;
					item.x = cw + 20;
					if (item.type != "slide") item.x = (cw - w) / 2;
				}
			}

			//合并字体

		}, {
			key: "font",
			value: function font() {
				this.globalFont = this.globalStyle + " normal" + " " + this.globalWeight + " " + this.globalSize + " " + this.globalFamily;
			}

			//更新单独样式

		}, {
			key: "updateStyle",
			value: function updateStyle(item, cxt) {
				cxt.font = this.globalStyle + " normal" + " " + this.globalWeight + " " + item.globalSize + " " + this.globalFamily;
				cxt.fillStyle = item.color || this.globalColor;
			}

			//重置弹幕

		}, {
			key: "reset",
			value: function reset() {
				var items = this.save;
				var _ref3 = [this.width, this.leftTime],
				    w = _ref3[0],
				    leftTime = _ref3[1];
				var _ref4 = [0],
				    i = _ref4[0],
				    item = _ref4[1];

				for (; item = items[i++];) {
					if (item.type == "slide") {
						item.x = w;
						item.rowRid = false;
					} else {
						item.leftTime = leftTime;
					}
					item.recovery = false;
				}
				this.startIndex = 0;
			}

			//计算

		}, {
			key: "step",
			value: function step(item, time) {

				var row = this.getRow(item);

				if (row.speedChange) {
					row.speedChange = false;
					item.speed += Math.random() * 3 + 1 >> 0;
				}

				item.leftTime ? item.leftTime -= time : "";

				item.x -= item.speed * time / 16 >> 0;
				item.y = item.y || row.y;
				item.row = row;
			}

			//绘制

		}, {
			key: "draw",
			value: function draw(item, cxt) {

				if (item.recovery) return false;

				cxt.save();
				if (item.change) {
					this.updateStyle(item, cxt);
				}
				cxt.fillText(item.text, item.x, item.y);
				cxt.restore();
			}

			//回收弹幕和通道

		}, {
			key: "recovery",
			value: function recovery(item, w) {

				if (item.type == "slide") {
					item.recovery = this.recoverySlide(item, w);
					return false;
				}

				item.recovery = this.recoveryStatic(item);
			}
		}, {
			key: "recoverySlide",
			value: function recoverySlide(item, w) {

				var x = item.x;
				var iw = item.width;

				if (!item.rowRid && x + iw + 20 <= w) {
					this.rows[item.type].unshift(item.row);
					item.rowRid = true;
				}

				if (x > -iw) return false;

				return true;
			}
		}, {
			key: "recoveryStatic",
			value: function recoveryStatic(item) {
				if (item.leftTime > 0) return false;

				this.rows[item.type].unshift(item.row);

				return true;
			}

			//更新下标

		}, {
			key: "refresh",
			value: function refresh(items) {
				var _ref5 = [this.startIndex],
				    i = _ref5[0],
				    item = _ref5[1];

				for (; item = items[i++];) {
					if (!item.recovery) return false;
					this.startIndex = i;
					item.row = null;
				}
			}
		}, {
			key: "update",
			value: function update(w, h, time) {

				var items = this.save;
				var cxt = this.cxt;

				cxt.clearRect(0, 0, w, h);

				this.globalChanged && this.initStyle(cxt); //初始化全局样式

				!this.looped && this.countWidth(items); //计算文本宽度以及初始化位置（只执行一次）

				this.refresh(items); //更新初始下标startIndex

				var _ref6 = [this.startIndex],
				    i = _ref6[0],
				    item = _ref6[1];

				for (; item = items[i++];) {
					this.step(item, time);
					this.draw(item, cxt);
					this.recovery(item, w);
				}
			}
		}]);

		return normalDM;
	}();

	//main


	var DM = function () {
		//初始化
		function DM(wrap) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_classCallCheck(this, DM);

			if (!wrap) {
				throw new Error("没有设置正确的wrapper");
			}

			//datas
			this.wrapper = wrap;
			this.width = wrap.clientWidth;
			this.height = wrap.clientHeight;
			this.canvas = document.createElement("canvas");
			this.canvas2 = document.createElement("canvas");
			this.normal = new normalDM(this.canvas, opts);

			this.name = opts.name || "";

			//status
			this.drawing = opts.auto || false;
			this.startTime = new Date().getTime();

			//fn
			this[init]();
			this[loop]();
		}

		_createClass(DM, [{
			key: "inputData",
			value: function inputData() {
				var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) != "object" || !obj.type) {
					return false;
				}
				this.normal.add(obj);
			}
		}, {
			key: init,
			value: function value() {
				this.canvas.style.cssText = "position:absolute;z-index:100;";
				this.canvas2.style.cssText = "position:absolute;z-index:101;";
				this.setSize();
				this.wrapper.appendChild(this.canvas);
				this.wrapper.appendChild(this.canvas2);
			}

			//设置宽高

		}, {
			key: "setSize",
			value: function setSize() {
				var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.width;
				var h = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.height;


				if (!Number.isInteger(w) || w < 0 || !Number.isInteger(h) || h < 0) return false;

				this.canvas.width = w;
				this.canvas.height = h;
				this.canvas2.width = w;
				this.canvas2.height = h;

				this.normal.getSize();
			}

			//启用

		}, {
			key: "start",
			value: function start() {
				if (this.drawing) return false;

				this.drawing = true;
				this[loop]();
			}

			//停止

		}, {
			key: "stop",
			value: function stop() {
				this.drawing = false;
			}

			//loop

		}, {
			key: loop,
			value: function value() {
				var _this = this;

				var normal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.normal;
				var prev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.startTime;


				if (!this.drawing) {
					return false;
				}

				var now = new Date().getTime();

				normal.update(this.width, this.height, now - prev);
				requestAnimationFrame(function () {
					_this[loop](normal, now);
				});
			}
		}]);

		return DM;
	}();

	var DMer = new DM(document.querySelector(".wrapper"), {
		name: "dm1",
		fontColor: "#66ccff"
	});

	DMer.start();

	/*setInterval(function(){
 	let i = Math.random() * 1000 >> 0;
 	DMer.inputData({
 		text : "hello, " + i,
 		type : "slide",
 		speed : 2
 	});
 },1000);*/

	setInterval(function () {
		var i = Math.random() * 200 >> 0;
		DMer.inputData({
			text: "world, " + i,
			type: "slide",
			speed: 2
		});
	}, 200);

	/*let d = new DM(document.querySelector(".wrapper2"),{
 	name : "dm2"
 });
 
 d.start();*/
})(window, Math);
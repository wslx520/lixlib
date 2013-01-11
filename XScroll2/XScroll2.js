/*
	Javascript图片切换类：XScroll2
	版本：0.1
	作者：脚儿网/jo2.org
	使用说明：
	从任意序号跳转到任意序号，都只有一次滚动,不过会切换方向
	欢迎使用，欢迎转载，但请勿据为己有
	更新记录：
	2013/1/9:减少变量
*/
var _ = {
	id:function (id) {
		//this.id=id;
		return "string" == typeof id ? document.getElementById(id) : id;
	},
	Extend:function(defaults, news) {
		for (var property in news) {
			defaults[property] = news[property];
		}
		return defaults;
	},
	Bind:function(object, fun) {
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function() {
			return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		}
	},
	On:(function(){
		return (window.addEventListener) ? function(eType,eFunc,eObj) {
			eObj.addEventListener(eType,eFunc,false);
		} : function(eType,eFunc,eObj) {
			eObj.attachEvent("on"+eType,eFunc);
		};
	})(),
	getCss:function(elm){
		return elm.currentStyle || document.defaultView.getComputedStyle(elm, null);
	},
	cutover:function(arr,cur,cls){
		for(var i=0,l=arr.length;i<l;i++){
			if(arr[i].className.indexOf(cls) != -1) {
				arr[i].className = arr[i].className.replace(cls,'');
			}
		}
		arr[cur].className = arr[cur].className.replace(/\s$/g,'') + ' ' + cls;
	},
	setCss:function(elm,css){
		for(var c in css) {
			elm.style[c] = css[c];
		}
	},
	setAlpha:(function(){ 		
		return (-[1,]) ? function (obj,alpha) {
				obj.style.opacity = alpha * 0.01;
			} : function(obj,alpha){
				obj.style.filter = "alpha(opacity=" + alpha + ")";
			};
	})()
}


var XScroll2 = function (elm,option) {
	return new XScroll2.main(elm,option);
}
XScroll2.main = function(elm,option) {
	this.slider = _.id(elm);
	this.items = this.slider.children;
	this.count = this.items.length;
	/* 初始化选项 */
	this.reset(option);
	
	var drt = this.defaults.direct;
	this.direct = ['left','top'][drt % 2];
	//console.log(this.direct)
	this.step = this.defaults.step || (drt % 2 ? this.slider.offsetHeight : this.slider.offsetWidth);
	this.speed = Math.ceil(1000/this.defaults.fps);
	this.ing = this.defaults.ing/this.speed;
	this.auto = this.defaults.auto;
	/* 页码翻页功能 */
	this.pager = _.id(this.defaults.pager);
	this.next = this.now = this._time = 0;
	/* 移动变量 */
	this._timer = null;
	/* 初始化完毕 */
	
	this.init();	
}
XScroll2.prototype = {
	init:function(){
		var len = this.count,
			root = this;
		/*	*/
		var posi = (root.defaults.how==0) ? "position:absolute;" : '',
			fl = (root.direct =='left') ? "float:left;" : "",
			W = (root.direct =='left') ? (2*root.step+'px') : null,
			H = (root.direct =='top') ? (2*root.step+'px') : null,
			css = fl+"display:none; z-index:5;"+posi;
		console.log(H);	
		while (len-- > 0){
			this.items[len].style.cssText = css;
		}
		_.setCss(this.slider,{position:'absolute',left:'0',top:0,width:W,height:H});
		_.setCss(this.slider.parentNode,{position:'relative',overflow:'hidden'});
		_.setCss(this.items[0],{zIndex:10,display:'block'});
		this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.delay)) ;
		if(this.defaults.pause) {
			_.On('mouseout',function(){
				root.Continue();
			},this.slider);
			_.On('mouseover',function(){
				root.Pause();
			},this.slider);
		}
		this.pager && this.Pager();
		this.Run = this.run();
	},
	reset:function(ops){
		this.defaults = {
			how:0,
			direct:0,
			delay:4000,
			auto:true,
			pause:true,
			event:'mouseover',
			past:0,
			fps:50,
			ing:500,
			Tween:easeInStrong
		}
		_.Extend(this.defaults,ops);
	},
	fix:function(){
		//console.log(this.next);
		for(var i=0,l=this.count;i<l;i++) {
			if(i != this.now && i != this.next) {
				this.items[i].style.display = 'none';
			}
		}
		this.curS.style.display = 'block';
		this.nextS.style.display = 'block';
		//console.log(this.curS);
	},
	go:function (num) {
		clearTimeout(this.timer);
		clearTimeout(this._timer);
		this._time = 0;
		//console.log(this.timer);
		this.curS = this.items[this.now];
		if(num != undefined) { this.next = num	}
		else { this.next=this.now+1; }
		//(num != undefined ) && (this.next = num) || (this.next = this.now+1);
		(this.next>= this.count ) && (this.next = 0) || (this.next < 0) && (this.next = (this.count-1));
		//console.log('num='+num +',this.next = '+ this.next);
				
		//当前项为curS,下一项为nextS,谨记
		if(this.now != this.next) {
			this.nextS = this.items[this.next];
			this.fix();
			this.Run.apply(this);
			if(this.pager)  { _.cutover(this.pages,this.next,'on')};
			this.now = this.next;
		}
		//this.defaults.how = Math.round(0+Math.random()*3);
	},
	run:function(elm,callback) {
		
		var effects = [
			function(){
				this.curS.style.zIndex = '5';
				this.nextS.style.zIndex = '10';
				var op0=0,root = this;
				function fading(){
					if(op0 < 100){
						_.setAlpha(root.nextS,(op0+=4));
						root._timer = setTimeout(fading,root.speed);
					} else {
						//console.log(op0);
						_.setAlpha(root.nextS,100);
						root.curS.style.display = 'none';
						op0=0;
						root.auto && (root.timer = setTimeout(_.Bind(root,root.Next),root.defaults.delay));
					}
				}
				fading();
			},
			function(){
				if(this.next < this.now) {
					this._end = 0;
					this._begin = -this.step;
				}else {
					this._begin = 0;
					this._end = -this.step;
				}
				this._c = this._end - this._begin;
				
				this.Move();
			}
		];
		return effects[this.defaults.how];
		
	},
	Move:function(){
		clearTimeout(this.timer);
		if(this._c && (this._time++ <= this.ing)){
			// this.Moving(Math.floor(this.tween(this._time,this._begin,this._c,this.ing)));
			this.Moving(Math.floor(this._begin + this.defaults.Tween(this._time/this.ing)*this._c));
			this._timer = setTimeout(_.Bind(this,this.Move),this.speed);
		} else {
			this.Moving(this._end);
			this._time = 0;
			this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.delay));
		}
	},
	Moving:function(p){
		this.slider.style[this.direct] = p +'px';
	},
	Prev:function(){
		this.go(--this.next);
	},
	Next:function(){
		this.go(++this.next);
	},
	Pause:function(){
		clearTimeout(this.timer);
		this.auto = false;
		//console.log('Pause!' + this.timer);
	},
	Continue:function(){
		//this.Pause();
		clearTimeout(this.timer);
		this.auto = true;
		this.timer = setTimeout(_.Bind(this,this.Next),this.defaults.delay);
	},
	Pager:function(){
		this.pages = this.pager.children;
		var page = this.pager;
		var	evt = this.defaults.event,
			pl = this.pages.length,
			root = this,
			to;
		for(var i = 0; i< pl; i++){
			(function(i){
				_.On(evt,
					function(){
						root.Pause();
						to = setTimeout(function(){root.go(i)},root.defaults.past);
					},
					root.pages[i]);
				_.On('mouseout',
					function(){
						if(root.defaults.auto) root.auto = true;
						clearTimeout(to);
					},
					root.pages[i]);	
			})(i);
		}
	}
}

XScroll2.main.prototype = XScroll2.prototype;

function QuadOut(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
}
function easeOutStrong(p) {
	return 1 - --p * p * p * p
}
function easeInStrong(p) {
	return (Math.pow((p-1), 3) +1);
}

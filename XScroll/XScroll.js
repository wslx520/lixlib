/*
	Javascript图片切换类：XScroll
	版本：0.3
	作者：脚儿网/jo2.org
	使用说明：欢迎使用，欢迎转载，但请勿据为己有
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
		return function() {
			return fun.apply(object, Array.prototype.slice.call(arguments,2));
		}
	},
	Create:function(o,pro){
		var e=document.createElement(o);
		//pro = pro || {};
		//alert(pro['name']);
		for(var p in pro){
			e.setAttribute(p,pro[p]);
		}
		return e;
	},
	On:(function(){
		return (window.addEventListener) ? function(eType,eFunc,eObj) {
			eObj.addEventListener(eType,eFunc,false);
		} : function(eType,eFunc,eObj) {
			eObj.attachEvent("on"+eType,eFunc);
		};
	})(),
	addClass:function(elm,cls){
		if(elm.className.indexOf(cls) == -1) {
			elm.className +=' '+cls;
			////console.log(elm.className);
		}
	},
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
	setAlpha:(function(){
		return (-[1,]) ? function (obj,alpha) {
				obj.style.opacity = alpha * 0.01;
			} : function(obj,alpha){
				obj.style.filter = "alpha(opacity=" + alpha + ")";
			};
	})(),
	setCss:function(elm,css){
		for(var c in css) {
			elm.style[c] = css[c];
		}
	},
	setPos:function(obj,pos){
		for(var p in pos) {
			obj.style[p] = pos[p] + 'px';
		}
	}
}
//alert(_.id('idContainer'));

var XScroll = function (elm,option) {
	return new XScroll.main(elm,option);
}
XScroll.main = function(elm,option) {
	this.wraper = _.id(elm);
	this.items = this.wraper.children;
	this.count = this.items.length;
	/* 初始化选项 */
	this.reset(option);
	//console.log(this.defaults);
	this.how = this.defaults.how;
	//this.
	this.auto = this.defaults.auto;

	//console.log(this.step)
	//console.log(this.fan);
	this.speed = 1000/this.defaults.fps;
	this.ing = this.defaults.ing/this.speed;
	// this.runtimes = this.ing/this.speed;
	this.tween = this.defaults.Tween;
	this.auto = this.defaults.auto;
	/* 页码翻页功能 */
	this.pager = this.defaults.pager;
	this.event = this.defaults.event;
	this.pause = this.defaults.pause;
	this.next = this.now = this.time = 0;
	/* 初始化完毕 */
	this._time = 0;
	this.init();


}
XScroll.prototype = {
	reset:function(ops){
		this.defaults = {
			how:0,
			direct:0,
			auto:4000,
			fps:50,
			ing:500,
			pause:true,
			event:'mouseover',
			Tween:QuadOut
		}
		_.Extend(this.defaults,ops);
	},
	init:function(){
		var len = this.count,
			root = this,
			items = root.items;
		while (len-- > 0){
			items[len].style.cssText = "position:absolute; display:none; z-index:5;top:0;left:0;"
		}

		_.setCss(items[0],{zIndex:10,display:'block'});

		var drt = this.defaults.direct;
		this.direct = ['left','top'][drt % 2];

		this.fan = (drt > 1) ? -1 : 1;
		this.step = this.defaults.step || (drt % 2 ? this.wraper.offsetHeight : this.wraper.offsetWidth);
		this.step *= this.fan;
		this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.auto)) ;
		if(this.pause) {
			_.On('mouseout',function(){
				root.Cont();
			},this.wraper);
			_.On('mouseover',function(){
				root.Pause();
			},this.wraper);
		}
		if(this.pager) {
			this.pages = _.id(this.pager).children;
			var evt = this.event,
				pl = this.pages.length,
				root = this,
				to;
			while (pl--){
				(function(i){
					_.On(evt,
						function(){
							root.Pause();
							to = setTimeout(function(){root.go(i)},150);
						},
						root.pages[i]);
					_.On('mouseout',
						function(){
							clearTimeout(to);
							if(root.defaults.auto) root.auto = true;
							// root.Cont();
						},
						root.pages[i]);
				})(pl);
			}
		}
		this.Run = this.run();
	},
	fix:function(){
		var i = this.count;
		while(i--) {
			if(i == this.now || i == this.next) {
				this.items[i].style.display = 'block';
			} else {
				this.items[i].style.display = 'none';
			}
		}
	},
	go:function (num) {
		if(num != undefined) { this.next = num	}
		else { this.next=this.now+1; }
		(this.next>= this.count ) && (this.next = 0) || (this.next < 0) && (this.next = (this.count-1));
		//console.log('num='+num +',this.next = '+ this.next);
		//当前项为curS,下一项为nextS,谨记
		if(this.next != this.now) {
			clearTimeout(this.timer);
			// this._time = 0;
			// this.nextS && this.End();
			if(this.moving) this.after();
			this.curS = this.items[this.now];
			this.nextS = this.items[this.next];
			this.fix();
			this.moving = 1;
			// this.curS.style[this.direct] = this.curS.e = this.nextS.style[this.direct] = this.nextS.e = 0;

			_.setCss(this.curS,{zIndex:5})
			_.setCss(this.nextS,{zIndex:10})
			this.Run.apply(this);
			if(this.pager)  { _.cutover(this.pages,this.next,'on')};
			this.now = this.next;
		}
		//this.how = Math.round(0+Math.random()*3);

	},
	run:function(elm,callback) {
		var step = this.step,
			// How = this.How(),
			root = this,
			tween = this.tween;
		/* 根据how初始化动画方式 */
		function var4move (elms) {
			var i = elms.length;
			while(i--) {
				var elm = elms[i];
				elm.b = parseInt(elm.style[root.direct],10);
				elm.c = elm.e - elm.b;
			}
		}
		var effects = [
			function(){
				// this.nextS.c = this.curS.c = 0;
				this.nextS.f = 0;
				this.nextS._f = 100/this.ing;
				this.curS.f = 100;
				this.curS._f = -(100/this.ing);
				this.Timer([this.curS,this.nextS]);
			},
			function(){
				this.curS.e = -step;
				this.nextS.style[this.direct] = step +'px';
				this.nextS.e = 0;
				var4move([this.curS,this.nextS]);
				this.Timer([this.curS,this.nextS]);
			},
			function(){
				this.nextS.style[this.direct] = step+'px';
				this.nextS.e = 0;
				this.nextS.f = 0;
				this.nextS._f = 100/this.ing;
				var4move([this.nextS]);
				this.Timer([this.nextS]);
			},
			function(){
				this.curS.style.zIndex = 10;
				this.nextS.style.zIndex = 5;
				_.setAlpha(this.nextS,100);
				this.curS.e = -step;
				var4move([this.curS]);
				this.Timer([this.curS]);
			},
			function(){
				var curS = this.curS,
					nextS = this.nextS;
				curS.style.zIndex = 10;
				nextS.style.zIndex = 5;
				curS.e = -step/2;
				nextS.e = step/2;

				var t = 0,
					c = curS.e-0,
					ing = this.ing*2,
					direct = this.direct,
					speed = this.speed,
					//pos = {	},
					yes = 1;

					(function runing(){
						clearTimeout(root.timer);
						if(yes) {
							if(t < ing && Math.floor(curS.e-parseInt(curS.style[direct],10))){
								curS.style[direct] = Math.floor(tween(t++,0,c,ing)) +'px';
								nextS.style[direct] = Math.floor(tween(t++,0,-c,ing))+'px';
								root.timer = setTimeout(runing,speed);

							} else {
								yes = 0;
								t = 0;
								curS.style.zIndex = 5;
								nextS.style.zIndex = 10;
								root.timer = setTimeout(runing,speed);
							}
						} else {
							if(t < ing && Math.floor(0-parseInt(nextS.style[direct],10))){
								curS.style[direct] = Math.floor(tween(t++,curS.e,-c,ing)) +'px';
								nextS.style[direct] = Math.floor(tween(t++,nextS.e,c,ing))+'px';
								root.timer = setTimeout(runing,speed);
							} else {
								yes = 1;
								t = 0;
								nextS.style[direct] = 0;
								curS.style[direct] = 0;
								root.after();
							}
						}

					})(); //runing
			}
		];

		var t = +new Date();
		return effects[this.how];
	},
	after:function(){
		// if(this.moving == this.fading) {
			//console.log('end')s
			this.moving = this._time = 0;
			_.setCss(this.curS,{display:'none',zIndex:5});
			this.nextS.style[this.direct] = 0;
			_.setAlpha(this.nextS,100);
			_.setAlpha(this.curS,100);
			//this.curS.moving =this.nextS.moving = 0;
			this.Cont();
		// }

	},
	End : function  () {
		this._time = 0;
		this.moving =0;
		_.setCss(this.nextS,{zIndex:10,display:'block'})
		_.setAlpha(this.nextS,100);
		this.nextS.style[this.direct] = 0;
	},
	Timer : function  (elms) {
		clearTimeout(this.timer);
		if(this._time++ < this.ing) {
			this.Moving(elms);
			this.timer = setTimeout(_.Bind(this,this.Timer,elms),this.speed);
		} else {
			// console.log('over');
			this._time = 0;
			this.moving = 0;
			clearTimeout(this.timer);
			this.after();
		}
	},
	Moving : function  (elms) {
		var l=elms.length;
		while(l--) {
			var elm = elms[l];
			if(elm.c) {
				elm.style[this.direct] = Math.floor(this.tween(this._time,elm.b,elm.c,this.ing)) +'px';
			}
			if(elm.f != undefined) {
				_.setAlpha(elm,elm.f+=elm._f);
			}
		}
	},
	Prev:function(){
		this.go(--this.next);
	},
	Next:function(){
		this.go(++this.next);
	},
	Pause:function(){
		this.auto = false;
		if(!this.moving) clearTimeout(this.timer);
	},
	Cont:function(){
		this.auto = this.defaults.auto;
		if(!this.moving && this.auto) this.timer = setTimeout(_.Bind(this,this.Next),this.auto);
	}
}

XScroll.main.prototype = XScroll.prototype;

function QuadOut(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
}

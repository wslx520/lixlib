/*
	Javascript图片切换类：XScroll
	版本：0.2
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
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function() {
			return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
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
			////console.log(obj);
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
	this.delay = this.defaults.delay;
	this.ing = this.defaults.ing;
	
	//console.log(this.step)
	//console.log(this.fan);
	this.speed = 1000/this.defaults.fps;
	this.tween = this.defaults.Tween;
	this.auto = this.defaults.auto;
	/* 页码翻页功能 */
	this.pager = this.defaults.pager;
	this.event = this.defaults.event;
	this.pause = this.defaults.pause;
	this.next = this.now = this.time = 0;
	/* 初始化完毕 */
	this._timer = null;
	this.init();
	
	
}
XScroll.prototype = {
	reset:function(ops){
		this.defaults = {
			how:0,
			direct:0,
			delay:4000,
			auto:true,
			fps:40,
			ing:25,
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
		//_.addClass(this.wraper,'XScrollContaner');

		var drt = this.defaults.direct;
		this.direct = ['left','top'][drt % 2];
		
		this.fan = (drt > 1) ? -1 : 1;
		this.step = this.defaults.step || (drt % 2 ? this.wraper.offsetHeight : this.wraper.offsetWidth);
		this.step *= this.fan;
		this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.delay)) ;
		if(this.pause) {
			_.On('mouseout',function(){
				root.Cont();
			},this.wraper);
			_.On('mouseover',function(){
				root.Pause();
			},this.wraper);
		}
		this.pager && this.Pager();
		this.Hower = this.How();
		this.Run = this.run();
	},
	fix:function(){
		for(var i=0,l=this.count;i<l;i++) {
			if(i != this.now && i != this.next) {
				this.items[i].style.display = 'none';
			}
		}
		_.setAlpha(this.curS,100);
		_.setAlpha(this.nextS,100);
	},
	go:function (num) {
		if(num != undefined) { this.next = num	}
		else { this.next=this.now+1; }
		(this.next>= this.count ) && (this.next = 0) || (this.next < 0) && (this.next = (this.count-1));
		//console.log('num='+num +',this.next = '+ this.next);
		//当前项为curS,下一项为nextS,谨记
		if(this.next != this.now) {
			clearTimeout(this.timer);
			clearTimeout(this._timer);
			this.curS = this.items[this.now];
			this.nextS = this.items[this.next];
			clearTimeout(this.curS._timer);
			clearTimeout(this.nextS._timer);
			this.fix();
			this.moving = this.fading = 0;
			this.curS.moving = this.nextS.moving = this.nextS.fading = this.curS.fading = 0;
			this.curS.style[this.direct] = this.curS.e = this.nextS.style[this.direct] = this.nextS.e = 0;
			
			_.setCss(this.curS,{zIndex:5,display:'block'})
			_.setCss(this.nextS,{zIndex:10,display:'block'})
			this.Run.apply(this);
			if(this.pager)  { _.cutover(this.pages,this.next,'on')};
			this.now = this.next;
			//curS.style.display = 'block';
		}
		//this.how = Math.round(0+Math.random()*3);
		
	},
	run:function(elm,callback) {
		var step = this.step,
			How = this.Hower,
			root = this,
			tween = this.tween;
		//console.log("Run Now!")
		/* 根据how初始化动画方式 */
		
		var effects = [
			function(){
				How.fadeIn([this.nextS]);
				How.fadeOut([this.curS]);
			},
			function(){
				this.curS.e = -step;
				this.nextS.style[this.direct] = step +'px';
				
				How.move([this.nextS,this.curS]);
			},
			function(){
				this.nextS.style[this.direct] = step+'px';
				How.move([this.nextS]);
			},
			function(){
				this.curS.style.zIndex = 10;
				this.nextS.style.zIndex = 5;
				_.setAlpha(this.nextS,100);
				this.curS.e = -step;
				How.move([this.curS]);
				//How.fadeOut([this.curS]);
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
						if(yes) {
							if(t < ing && Math.floor(curS.e-parseInt(curS.style[direct],10))){
								curS.style[direct] = Math.floor(tween(t++,0,c,ing)) +'px';
								nextS.style[direct] = Math.floor(tween(t++,0,-c,ing))+'px';
								root._timer = setTimeout(runing,speed);
								
							} else {
								yes = 0;
								t = 0;
								curS.style.zIndex = 5;
								nextS.style.zIndex = 10;
								root._timer = setTimeout(runing,speed);
							}
						} else {
							if(t < ing && Math.floor(0-parseInt(nextS.style[direct],10))){
								curS.style[direct] = Math.floor(tween(t++,curS.e,-c,ing)) +'px';
								nextS.style[direct] = Math.floor(tween(t++,nextS.e,c,ing))+'px';
								root._timer = setTimeout(runing,speed);
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
	How:function (t){
		var root = this,
			speed = this.speed,
			direct = this.direct,
			how = this.how;
		//console.log(t);
		function move(elms){
			this.moving = 1;
			var t=0;
			for(var i=0,l= elms.length;i<l;i++) {
				elms[i].b = parseInt(elms[i].style[direct],10);
				elms[i].c = elms[i].e - parseInt(elms[i].style[direct],10);
			}
			~function moving(){
				if(Math.floor(elms[0].e-parseInt(elms[0].style[direct],10)) && t++ < root.ing) {
					for(var i=0,l=elms.length;i<l;i++) {
						//var b=elm[].b, c=elm.e - elm.b;
						elms[i].style[direct] = Math.floor(root.tween(t,elms[i].b,elms[i].c,root.ing)) +'px';
					}
					root._timer = setTimeout(moving,speed);
				}else {
					for(var i=0,l=elms.length;i<l;i++) {
						//var b=elm[].b, c=elm.e - elm.b;
						elms[i].style[direct] = elms[i].e +'px';
					}
					//console.log('move' + elm.fading);
					root.moving = 0;
					if(!root.fading) root.after();
					return;
				}
			}();
		}
		function fading (elm,s,e,step,callback) {

			clearTimeout(elm._timer);
			var op0= 0,step = step || 5;
			// var op0 = 0 ;
			~function todo () {
				if((op0+=5) < 100 ) {
						_.setAlpha(elm,(s+=step));
						elm._timer = setTimeout(todo,speed);
						console.log(elm._timer);
				} else {
					_.setAlpha(elm,e);
					op0 = 0;
					//console.log('fadeIn' + elm.moving);
					if(typeof callback === 'function') {
						callback();
					}
					elm.fading = 0;
					// root.fading = 0;
					
				}
			}()
			// _.set
		}
		function fadeIn(elms){
			root.fading = 1;
			for(var i=0,l=elms.length;i<l;i++) {
				fading(elms[i],0,100,5);
			}
		}
		function fadeOut(elms){
			root.fading = 1;
			for(var i=0,l=elms.length;i<l;i++) {
				fading(elms[i],100,0,-5,function(){
					if(root.curS.fading == 0 && root.nextS.fading == 0) {
						root.fading = 0;
						if(!root.moving) root.after();
					}
				});
			}
		}
		return {
			fadeIn:fadeIn,
			fadeOut:fadeOut,
			move:move
		}
	},
	after:function(){
		//console.log(this.curS.moving +'-'+ this.nextS.moving+'&&'+this.curS.fading+'-'+this.nextS.fading)
		if(this.moving == this.fading) {
			//console.log('end')
			_.setCss(this.curS,{display:'none',zIndex:5});
			this.nextS.style[this.direct] = 0;
			_.setAlpha(this.nextS,100);
			_.setAlpha(this.curS,100);
			//this.curS.moving =this.nextS.moving = 0;
			this.auto && (this.timer = setTimeout(_.Bind(this,this.Next),this.delay));
		}
		
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
	Cont:function(){
		this.Pause();
		this.auto = true;
		var root = this;
		this.timer = setTimeout(_.Bind(this,this.Next),this.delay);
		//console.log(this.timer);
	},
	Pager:function(){
		this.pages = _.id(this.pager).children;
		var evt = this.event,
			pl = this.pages.length,
			root = this,
			to;
		for(var i = 0; i< pl; i++){
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
						//root.Cont();
					},
					root.pages[i]);	
			})(i);
		}
	}
}

XScroll.main.prototype = XScroll.prototype;

function QuadOut(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
}

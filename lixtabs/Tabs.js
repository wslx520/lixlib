/* 
类:Lix Tabs
版本:0.4
作者:十年灯 http://www.jo2.org/
说明:欢迎使用,欢迎转载,但请勿据为已有

*/	
var $id=function(id){
	return (typeof id == "object") ? id : document.getElementById(id);
},
$$=function(tag,elm){
	return elm.getElementsByTagName(tag);
},
$C=function(cn,tag,elm){
	if(!tag) tag='*';
	var ts = $$(tag,elm);
	var classArr = [];
	var filter = new RegExp("(^|\\s)"+cn+"(\\s|$)");
	for(var i=0,l=ts.length;i<l;i++){
		if(filter.test(ts[i].className)){
			classArr.push(ts[i]);
		}
	}
	return classArr;
},
cutover=function(arr,cur,cls){
	for(var l=arr.length,c,reg = eval('/\\b'+cls+'\\b/');l--;){
		if(reg.test((c=arr[l].className))) {
			l!==cur && (arr[l].className = c.replace(reg,''));
		} else {
			l===cur && (arr[l].className =  c.replace(/\s$/g,'')+' '+cls);
		}	
	}
},
Bind = function(o, fn) {
	return function() {
		return fn.apply(o);
	}
},
on = (function(){
		return ('addEventListener' in window) ? function(obj,type,fn) {
			obj.addEventListener(type,fn,false);
		} : function(obj,type,fn) {
			obj.attachEvent("on"+type,fn);
		};
	})(),
Tabs = function (elm,args){
	if(elm == null){return false;}
	return new Tabs.prototype.ini(elm,args);
}
Tabs.prototype = {
	ini:function(elm,args){
		var t=this;
		
		var a=args || {};
		
		/*开始缓存传入参数*/
		this.hdtag =a.hdtag || 'DIV';
		this.hdcn =a.hdcn || 'tabhd';
		this.hdtagcur =a.hdtagcur || 'cur';
		this.bdtag =a.bdtag || 'DIV';
		this.bdcn =a.bdcn || 'tabbd';
		this.bdtagcur =a.bdtagcur || 'cur';
		this.event = a.event || 'mouseover';
		this.auto = a.auto || 0;
		this.delay = a.delay || 0;
		/*缓存参数完成*/
		
		this.tabhd = $C(this.hdcn,this.hdtag,elm)[0];
		this.tabtag = this.tabhd.children;
		this.tabbd = $C(this.bdcn,this.bdtag,elm)[0];
		this.tabcon = this.tabbd.children;
		
		this.now = 0;
		this.yes = true;
		this.sum = this.tabtag.length;
		if(this.sum != this.tabcon.length) {
			alert(elm+':Tab标签个数与内容个数不匹配');
			return ;
		}
		/**/
		for(var i=0;i<t.sum;i++){			
			(function(i){
				on(t.tabtag[i],'mouseover',function(){
					t.yes = false;
				});
				on(t.tabtag[i],t.event,function(){
					t.now = i;
					t.run = setTimeout(Bind(t,t.change),t.delay);
				})
				on(t.tabtag[i],'mouseout',function(){
					t.yes = true;
					clearTimeout(t.run);
				});
			})(i);
		}
		if(this.auto){
			on(elm,'mouseover',function(){t.stop()});
			on(elm,'mouseout',function(){t.go()});
		}
		this.change();
	},
	change:function(){
		cutover(this.tabtag,this.now,this.hdtagcur);
		cutover(this.tabcon,this.now,this.bdtagcur);
		if(this.auto && this.yes){
			this.now = (this.now == this.sum-1) ? 0 : this.now+1;
			this.go();
		}
	},
	go:function(){
		this.stop();
		this._timer = setTimeout(Bind(this,this.change),this.auto)
	},
	stop:function(){
		clearTimeout(this._timer);
	}
};
Tabs.prototype.ini.prototype = Tabs.prototype;




















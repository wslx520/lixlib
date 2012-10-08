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
	for(var i=0,l=arr.length;i<l;i++){
		if(i==cur){
			var t=arr[i].className.indexOf(cls);
			if (t==-1) {
				arr[i].className += ' '+cls;
			}
			else return true;
		}else{
			arr[i].className = arr[i].className.replace(cls,'');
		}
		
	}
},
Bind = function(object, fun) {
	return function() {
		return fun.apply(object);
	}
},
addEvent = function(eType,eFunc,eObj){
	eObj = eObj || document;
	if(window.addEventListener) eObj.addEventListener(eType,eFunc,false);
	else eObj.attachEvent("on"+eType,eFunc);
},
Tabs = function (elm,items){
	if(elm == null){return false;}
	return new Tabs.prototype.ini(elm,items);
}
Tabs.prototype = {
	ini:function(elm,items){
		var t=this;
		
		var a=items || {};
		
		/*开始缓存传入参数*/
		this.hdtag =a.hdtag || 'DIV';
		this.hdcn =a.hdcn || 'tabhd';
		this.hdtagcur =a.hdtagcur || 'cur';
		this.bdtag =a.bdtag || 'DIV';
		this.bdcn =a.bdcn || 'tabbd';
		this.bdtagcur =a.bdtagcur || 'cur';
		this.event = a.event || 'mouseover';
		this.delay = a.delay || 0;
		/*缓存参数完成*/
		
		this.tabhd = $C(this.hdcn,this.hdtag,elm)[0];
		this.tabtag = this.tabhd.children;
		this.tabbd = $C(this.bdcn,this.bdtag,elm)[0];
		this.tabcon = this.tabbd.children;
		
		this.now = 0;
		this.yes = true;
		this.time =a.auto;
		this.sum = this.tabtag.length;
		if(this.sum != this.tabcon.length) {
			alert('Tab标签个数与内容个数不匹配');
			return true;
		}
		//alert(t.time);
		/**/
		for(var i=0;i<t.sum;i++){
			
			(function(i){
				addEvent('mouseover',function(){
					t.yes = false;
				},t.tabtag[i]);
				addEvent(t.event,function(){
					t.now = i;
					//alert(i);
					t.run = setTimeout(Bind(t,t.change),t.delay);
				},t.tabtag[i])
				addEvent('mouseout',function(){
					t.yes = true;
					clearTimeout(t.run);
				},t.tabtag[i]);
			})(i);
		}
		this.change();
		if(this.time){
			elm.onmouseover = function(){
				t.stop()
			}
			elm.onmouseout = function(){
				t.go()
			}
		}
	},
	change:function(){
		cutover(this.tabtag,this.now,this.hdtagcur);
		cutover(this.tabcon,this.now,this.bdtagcur);
		if(this.time && this.yes){
			this.now = (this.now == this.sum-1) ? 0 : this.now+1;
			this.go();
		}
	},
	go:function(){
		this.stop();
		this.auto = setTimeout(Bind(this,this.change),this.time)
	},
	stop:function(){
		clearTimeout(this.auto);
	}
};
Tabs.prototype.ini.prototype = Tabs.prototype;




















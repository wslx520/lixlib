/* 
	javascript类:LixTabs
	版本:0.5
	作用:制作简单的多个的tabs选项卡切换效果
	作者:十年灯 http://www.jo2.org/
	说明:欢迎使用,欢迎转载,但请勿据为已有
	
*/
var $id = function(id){
	return (typeof id == "object") ? id : document.getElementById(id);
},
$$ = function(tag,elm){
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
	if(window.attachEvent) eObj.attachEvent("on"+eType,eFunc);
	if(window.addEventListener) eObj.addEventListener(eType,eFunc,false);
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
		t.hdtag =a.hdtag || 'DIV';
		t.hdcn =a.hdcn || 'tabhd';
		t.hdtagcur =a.hdtagcur || 'cur';
		t.bdtag =a.bdtag || 'DIV';
		t.bdcn =a.bdcn || 'tabbd';
		t.bdtagcur =a.bdtagcur || 'cur';
		t.event = a.event || 'mouseover';
		t.delay = a.delay || 0;
		/*缓存参数完成*/
		
		t.tabhd = $C(t.hdcn,t.hdtag,elm)[0];
		t.tabtag = t.tabhd.children;
		t.tabbd = $C(t.bdcn,t.bdtag,elm)[0];
		t.tabcon = t.tabbd.children;
		
		t.now = 0;
		t.yes = 1;
		t.time =a.auto;
		t.sum = t.tabtag.length;
		if(t.sum != t.tabcon.length) {
			alert('Tab标签个数与内容个数不匹配');
			return true;
		}
		//alert(t.time);
		/**/
		var sum = t.sum;
		for(var i=0;i<sum;i++){
			(function(i){
				addEvent('mouseover',function(){
					t.yes = 0;
				},t.tabtag[i]);
				addEvent(t.event,function(){
					t.now = i;
					//alert(i);
					t.run = setTimeout(Bind(t,change),t.delay);
				},t.tabtag[i])
				addEvent('mouseout',function(){
					t.yes = 1;
					clearTimeout(t.run);
				},t.tabtag[i]);
			})(i);
		}
		function B(fn,t) {
			fn.call(t);
		}
		function change(){
			cutover(t.tabtag,t.now,t.hdtagcur);
			cutover(t.tabcon,t.now,t.bdtagcur);
			if(t.time && t.yes){
				t.now = (t.now == t.sum-1) ? 0 : t.now+1;
				B(go,t);
			}
		}
		function go(){
			B(stop,t);
			t.auto = setTimeout(Bind(t,change),t.time)
		}
		function stop(){
			clearTimeout(t.auto);
		}
		if(t.time){
			elm.onmouseover = function(){
				B(stop,t);
			}
			elm.onmouseout = function(){
				B(go,t);
			}
		}
		
		B(change,t);
	}
};
Tabs.prototype.ini.prototype = Tabs.prototype;
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
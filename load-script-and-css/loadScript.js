/** loadScript.js 用于动态载入JS文件
* @param urls 要载入的JS文件地址。可以是数组表示多个
* @param callback 载入完成后执行的函数
*/
var loadScript = function  () {
	var pool = {},
		scriptids = 0,
		head = document.getElementsByTagName('head')[0],
		loadFns = {},
		callList = {};
	function getScript(url) {
	    var s = document.createElement('script'),
	    	id = scriptids,
	    	onload = function() {
		    	delete loadFns[id][url];
		    	loadDone(id);
		    	s.onload = s.onreadystatechange = s.onerror = null;
		    };
	    s.type = "text/javascript";
	    s['data-script-id'] = url;
	    s.onload = onload;
	    s.onerror = function() {
	      	loadFns[id][url] = -1;
	      	loadDone(id);
	    }
	    s.onreadystatechange = function() {
	      if (s.readyState === 'loaded' || s.readyState === 'complete') {
	        onload();
	      }
	    }
	    s.removeAttribute('defer');
	    s.src = url;
	    head.appendChild(s)
	}
	// 队列全部载入完成后执行
	function loadDone (id) {
		var fns = loadFns[id];
		for(var o in fns) {
			if(fns[o] == 0) return; 
		}
		delete loadFns[id];
		if(callList[id]) {
			callList[id]();
			delete callList[id];	
		}
		
	}
	return function  (urls,callback) {
		urls = 'string' === typeof urls ? [urls] : urls;
		scriptids++;
		if('function' === typeof callback) {
			callList[scriptids] = callback;
		}
		for(var u=0,ul = urls.length;u<ul;u++) {
			var uu = urls[u];
			if(!pool[uu]) {
				pool[uu] = 1;
				if(!loadFns[scriptids]) {loadFns[scriptids] = {};}
				loadFns[scriptids][uu] = 0;
				getScript(uu);	
			}
			
		}
	}
}();

//常用函数集
var __ = function () {
	var 
	dom = document,
	body = dom.body,
	isIE = !-[1,],
	AP = Array.prototype,
	slice = AP.slice,
	toString = Object.prototype.toString,
	/*主函数*/
	main = function  (q) {
		return dom.querySelectorAll(q);
	},
	getBrowser = function  () {
		var tester = [/(MSIE) (\d)\.(\d)/,
			/(Firefox)\/(\d{1,2})(\.*\d+)+/,
			/(Chrome)\/(\d{1,2})(\.*\d+)+/
			],
		cache = null; //用来把浏览器信息缓存起来，避免每次都去跑
		function test () {
			var len = tester.length,t,res;
			while(len--) {
				t = tester[len];
				if(res = t.exec(navigator.userAgent)) {
					// console.log(res)
					return cache = {
						name:res[1],version:res[2]
					}
				}
			}
		}
		return function  () {
			return cache || test();
		}
	}(),
	/*克隆数组或对象*/
	clone = function  (obj,deep) {
		var isarr = isArray(obj) ,res;
		if(!deep) {
			if(isarr) return slice.call(obj);
			return extend({},obj);
		}
		if(isarr) {
			res = [];
			for(var i=0,l = obj.length;i<l;i++) {
				var ai = obj[i];
				res.push('object' === typeof ai ? clone(ai,true) : ai);
			}
			return res;		
		} else {
			res = {};
			for(var i in obj) {
				var oo = obj[i];
				res[i] = 'object' === typeof oo ? clone(oo,true) : oo; 
			}
			return res;
			
		}
	},
	/* DOM */
	contains = body.contains ? function (par,chi) {
		return par.contains(chi);
	} : function (par,chi) {
		return !!(par.compareDocumentPosition(chi) & 16);
	},
	closest = function  (elm,fn) {
		while(elm) {
			if(fn(elm)) {
				// par = elm;
				// break;
				return elm;
			}
			elm = elm.parentNode;
		}
	},
	hasClass = function (elm,cls) {
		cls = cls.split(/\s+/);
		for(var c=cls.length,ecls = ' '+elm.className+' ';c--;) {
			if(ecls.indexOf(' '+cls[c]+' ') == -1) {
				return false;
			}
		}
		return true;		
	},
	addClass = function (elm,cls) {
		// if(!hasClass(elm,cls)) {
			elm.className = __.trim(elm.className)+' '+cls;
		// }		
	},
	removeClass = function (elm,cls) {
		cls = cls.split(/\s+/);
		cls.forEach(function  (cc,i) {
			elm.className = elm.className.replace(RegExp('\\b'+cc+'\\b',"g"),'');
		})				
	},
	addEvent = window.addEventListener? function (elm,act,fn,t) {
		elm.addEventListener(act,fn,t || false);
	} : function  (elm,act,fn) {
		elm.attachEvent('on'+act,fn);
	},
	removeEvent = window.addEventListener ? function (elm,act,fn,t) {
		elm.removeEventListener(act,fn,t || false);
	} : function  (elm,act,fn) {
		elm.detachEvent('on'+act,fn);
	},
	wrap = function  (nodes,par) {
		par = par.cloneNode(true);
		// nodes = [].slice.call(nodes);
		if(!nodes.length) nodes=[nodes];
		var pnode = nodes[0].parentNode;
		var idx = index(nodes[0]);
		for(var n =0,l=nodes.length;n<l;n++) {
			par.appendChild(nodes[n]);
		}	
		pnode.insertBefore(par,pnode.children[idx]);
	},
	remove = function  (elem) {
		elem.parentNode.removeChild(elem);
	},
	index = function(node,list) {
		list = list || node.parentNode.children;
		var index = -1;
		for(var l = list.length;l--;) {
			if(list[l] === node) {
				// index = l;
				return l;
				// break;
			}
		}
		return index;
	},
	getStyle = body.currentStyle ? function  (elm,style) {
		return style ? elm.currentStyle[style] : elm.currentStyle;
	} : function  (elm,style) {
		var styles = elm.ownerDocument.defaultView.getComputedStyle(elm, null);
		return style ? styles[style] : styles;
	},
	
	/*判断*/
	isFunction = function( f ) {
	    // return toString.call(f) === "[object Function]";
	    return 'function' === typeof f;
	},
	isObject = function  (v) {
		return toString.apply(v) === '[object Object]';
	},
	isArray = function(v){ 
		return toString.apply(v) === '[object Array]'; 
	},
	isNumber = function  (n) {
		return typeof n === 'number' ? true : toString.call(obj) == '[object Number]';
	},
	isString = function  (s) {
		return typeof s === 'string' ? true : toString.call(obj) == '[object String]';
	},
	isDate = function  (d) {
		return d instanceof Date;
	},
	isRegexp = function  (d) {
		return d instanceof RegExp;
	},
	isNull = function  (s) {
		return s == null;
	},
	isElement = function  (elm) {
		return obj.nodeType==1 && obj.tagName;
	},
	typeOf = function  (obj) {
		var t = typeof obj;
		if(t === 'object') {
			return (obj === null) ? 'null' :
				isObject(obj) ? 'object' :
				isArray(obj) ? 'array' :
				isElement(obj) ? 'element' :
				isRegexp(obj) ? 'regexp' :
				isDate(obj) ? 'date' : 
				isNumber(obj) ? 'number' : 
				isString(obj) ? 'string' : '' ;
		} 
		return t;
	},
	/*数组*/
	each_A = function  (arr,fn,through) {
		for(var i=0,l=arr.length;i<l;i++) {
			if(false === fn(arr[i],i,arr) && !through) break;
		}
	},
	include_A = function  (arr,item) {
		var f = !1;
		each_A(arr,function  (a,i) {
			if(a === item) {
				f = true;
				return false;
			}
		})
		return f;
	},
	/*对象*/
	each_O = function  (obj,fn,through) {
		for(var i in obj) {
			if(false === fn(obj[i],i,obj) && !through) break;
		}
	},
	// 用新对象的属性替换老对象(会直接改变老对象)
	extend = function  (old,newone) {
		each_O(newone,function  (one,o) {
			old[o] = one;
		})
		return old;
	},
	// 合并两个对象(返回一个新对象,不改变原来的两个对象)
	merge = function  (old,newone) {
		var r = {};
		each_O(old,function  (one,o) {
			r[o] = one;
		})
		each_O(newone,function  (one,o) {
			r[o] = one;
		})
		return r;
	},
	/*类*/
	Select = function  (sel,fn,through) {
		this.select = sel;
		var options = this.options = sel.options,
			isFn = isFunction(fn),
			isArr = isArray(fn),
			aObj,
			one = !isFn && !isArr;
			if(isArr) {
				one = fn.length === 1;
				each_A(fn,function  (item,i) {
					aObj[item] = 1;
				})
			}

			each_A(options,function  (option,o) {
				if(isFn) {
					if(fn(option,o,options) === true) {
						option.selected = true;
						if(!through) return false;
					}
				} else {
					var t = option.selected = isArr ? aObj[option.value] ==1 : fn=== option.value;
					
					if(t && one) {
						return false;
					}
					
				}
			})
			this.add =  function  (text,value) {
				this.options.add(new Option(text,value));
			};
			// index可以是数字或函数
			this.remove = function  (index,through) {
				if(isNumber(index)) {
					this.options.remove(i);
				} else {
					var options = this.options,
						isStr = isString(index);
					each_A(options,function  (option,o) {
						if(isStr ? option.value == index : index(option)===true) {
							this.options.remove(o);
							if(!through) return false;
						}
					})
				}
				
			} 
	}
	;
	extend(main,{
		domReady: (function () {
	        var hasReady = false,
	            list = [],
	            check;

	        function ready() {
	            if (!hasReady) {
	                hasReady = true;
	                list.forEach(function (item) {
	                    item();
	                });
	            }
	        }

	        if (document.addEventListener) {
	            document.addEventListener('DOMContentLoaded', ready, false);
	        } else if (window === top) {
	            check = function () {
	                try {
	                    document.documentElement.doScroll('left');
	                    ready();
	                } catch (e) {
	                    setTimeout(check, 0);
	                }
	            };
	            check();
	        }

	        addEvent(window, 'load', ready);

	        return function (func) {
	            if (hasReady) {
	                func();
	            } else {
	                list.push(func);
	            }
	        };
	    }()),
	    clone:clone,
		hasClass: hasClass,
		removeClass: removeClass,
		addClass: addClass,
		toggleClass: function (elm,cls) {
			if(hasClass(elm,cls)) {
				removeClass(elm,cls);
			} else {
				addClass(elm,cls);
			}
		},
		getStyle:getStyle,
		getAttr : function (elem,attr) {
			return elem.getAttribute(attr);
		},
		setAttr : function  (elem,attr,v) {
			return elem.setAttribute(attr,v);
		},
		removeAttr : function  (elem,attr) {
			return elem.removeAttribute(attr);
		},
		contains: contains,
		addEvent:addEvent,
		removeEvent:removeEvent,
		index:index,
		wrap:wrap,	
		closest:closest,
		// 方便操作select元素
		select: function  (sel,fn,through) {
			return new Select(sel,fn,through);
		},	
		each: function  (arrOrObj,fn,through) {
			if(isObject(arrOrObj)) {
				each_O(arrOrObj,fn,through);
			} else {
				each_A(arrOrObj,fn,through);
			}
		},

		/*字符串实用函数 start*/
		trim:function (str) {
			return str.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		toCamel: function  (str) {
			return str.replace(/\-(\w)/g,function  (m,$1) {
				return $1.toUpperCase();
			});
		},
		// 直接切掉指定长度的字符，返回切除后剩下的字符串
		cut: function  (str,len) {
			return len > 0 ? str.slice(len) : str.slice(0,len);
		},
		// 包含子串
		include : function  (str,substr) {
			return isString(str) ? str.indexOf(substr) !== -1 : include_A(str,substr);
		},
		// 以指定子串开始
		startWith : function  (str,substr,fromIndex) {
			return str.indexOf(substr,fromIndex) === 0;
		},
		// 以指定子串结尾
		endWith : function  (str,substr,fromIndex) {
			return substr === str.slice(-substr.length);
		},
		/* 转换函数start */
		toArray : function  (o) {
			return Array.prototype.slice.call(o);
		},
		toInt : function  (num) {
			return parseInt(num,10);
		},
		
		/*将一个函数绑定到另一个作用域，且可指定参数*/
		bind : function(fun,thisobj) {
			var args = slice.call(arguments).slice(2);
			return function() {
				return fun.apply(thisobj, args.concat(slice.call(arguments)));
			}
		},
		/*timer 支持传参*/
		timer : function  (fn,time) {
			var args = slice.call(arguments,2);
			if(args.length) {
				return setTimeout(function  () {
					fn.apply(fn,args);
				},time)
			} else {
				return setTimeout(fn,time);
			}	
		},
		extend:extend,
		merge:merge,
		isObject:isObject,
		isString:isString,
		isNumber:isNumber,
		isNull:isNull,
		isDate:isDate,
		isRegexp:isRegexp,
		isArray:isArray,
		isFunction:isFunction,
		typeOf:typeOf,
		getBrowser:getBrowser,
		fixEvent : function  (evt) {
			evt = evt || window.event;
			var ie = getBrowser().name = 'MSIE',iev = getBrowser().version;
			if(ie && iev <9) {
				evt.target = evt.srcElement;
				// IE8及以下，evt.button在按下鼠标中键时是4，(evt.button|1)则得到5，所幸的是很少用到按下鼠标中键的事件
				evt.which = evt.keyCode || (evt.button|1);
			  	evt.stopPropagation = function  () {
			   		evt.cancelBubble = true;
			 	}
			  	evt.preventDefault = function  () {
			   		evt.returnValue = false;
			  	}
			  	evt.pageX = evt.clientX + document.documentElement.scrollLeft;
			  	evt.pageY = evt.clientY + document.documentElement.scrollTop;
			}
			 // 自定义方法，会阻止默认行为，阻止冒泡，
			if(!evt.stop) {
			  	evt.stop = function  () {
			   		evt.preventDefault();
			   		evt.stopPropagation();
			  	}
			}
			return evt;
		}
	});

	return main;
}();



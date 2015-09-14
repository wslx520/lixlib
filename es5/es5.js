/*
* 使老浏览器能使用Ecma Script 5的新原生方法
* 使用方法：在文档head中写入：
<!--[if lte IE 8]>
<script src="es5.js" type="text/javascript"></script>
<![endif]-->
*/
!function  (undefined) {
	
	/*对象新方法polyfill*/
	if(!Object.keys) {
		Object.keys = function  (obj) {
			var r=[];
			for(var o in obj) {
				r.push(o);
			}
			return r;
		}
	}
	if(!Object.values) {
		Object.values = function  (obj) {
			var r=[];
			for(var o in obj) {
				r.push(obj[o]);
			}
			return r;
		}
	}
	if (typeof Object.create != 'function') {
	  Object.create = (function() {
	    var Temp = function() {};
	    return function (prototype) {
	      if (typeof prototype != 'object') {
	        throw TypeError('Argument must be an object');
	      }
	      Temp.prototype = prototype;
	      var result = new Temp();
	      Temp.prototype = null;
	      return result;
	    };
	  })();
	}
	/*数组新方法polyfill*/
	var ArrayPolyfill = {
		indexOf : function(obj, idx) {
	        var i = idx == undefined ? 0 : (idx < 0 ? Math.max(0, arr.length + idx) : idx),l = this.length;
	        for(; i < l; i++) {
	            if(this[i] === obj) {
	                return i;
	            }
	        }
	        return -1;
	    },
	    lastIndexOf : function(obj, idx) {
	        var len = this.length, i;
	        if(idx == undefined) {i=len}
	        else{ 
	          if(idx+1>len) {i = Math.min(len,idx+1)}
	          if(idx<0){ i = Math.max(0, len + idx+1) }
	        }
	        for(; i--;) {
	            if (this[i] === obj) {
	                return i;
	            }
	        }
	        return -1;
	    },
	    every : function(fn, thisObj) {
	        for(var i = this.length; i--; ) {
	            if(false === fn.call(thisObj, this[i], i, this)) {
	                return false;
	            }
	        }
	        return true;
	    },
	    some : function(fn, thisObj) {
	        for(var i = this.length; i--;) {
	            if(true === fn.call(thisObj, this[i], i, this)) {
	                return true;
	            }
	        }
	        return false;
	    },
	    filter : function(fn, thisObj) {
	        for(var i = -1,l = this.length,res = []; i++<l; ) {
                var val = this[i];
                if(true === fn.call(thisObj, val, i, this)) {
                    res.push(val);
                }
	        }
	        return res;
	    },
	    map : function(fn, thisObj) {
	        var l = this.length, res = [];
	        for(var i = 0,l = this.length; i<l; i++){
	            res[i] = fn.call(thisObj, this[i], i, this);
	        }
	        return res;
	    },
	    forEach : function(fn, thisObj) {
	        for(var i = 0,l = this.length; i<l; i++) {
	            fn.call(thisObj, this[i], i, this);
	        }
	    },
	    reduce : function (callback, initialValue ) {
		    var noinitialValue = initialValue === undefined, 
		    	previous = noinitialValue ? this[0] : initialValue, 
		    	k = noinitialValue ? 1 : 0, 
		    	length = this.length;
		    if (typeof callback === "function") {
		      	for (k; k < length; k++) {
		         	this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
		      	}
		    }
		    return previous;
		},
		reduceRight : function (callback, initialValue ) {
		    var noinitialValue = initialValue === undefined, length = this.length,
		    	previous = noinitialValue ? this[length-1] : initialValue, 
		    	k = noinitialValue ? length-2 : length-1;
		    var length = this.length, k = length - 1, previous = initialValue;
		    if (typeof callback === "function") {
		        for (k; k > -1; k-=1) {          
		          	this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
		        }
		    }
		    return previous;
		}
	}
	for(var A in ArrayPolyfill) {
		if(!Array.prototype[A]) {
			Array.prototype[A] = ArrayPolyfill[A];
		}
	}
	// JSON
    this.JSON = {
        parse: function (data) {
            return (new Function('return (' + data + ')'))();
        },

        stringify: (function () {
            function encodeString(source) {
                return '"' + source.replace(
                    /["\\\x00-\x1f]/g,
                    function (match) {
                        return {
                            '\b': '\\b',
                            '\t': '\\t',
                            '\n': '\\n',
                            '\f': '\\f',
                            '\r': '\\r',
                            '"' : '\\"',
                            '\\': '\\\\'
                        }[match] || ('\\u00' + Math.floor(match.charCodeAt() / 16).toString(16) + (match.charCodeAt() % 16).toString(16));
                    }
                ) + '"';
            }

            function encodeArray(source) {
                for (var i = 0, result = [], len = source.length; i < len; i++) {
                    result.push(JSON.stringify(source[i]));
                }
                return '[' + result.join(',') + ']';
            }

            return function (value) {
                var type = typeof value,
                    result = [];

                if (value === null || value === undefined || type === 'function') {
                    return 'null';
                }

                if (type === 'number') {
                    return isFinite(value) ? String(value) : 'null';
                }

                if (type === 'boolean') {
                    return String(value);
                }

                if (type === 'string') {
                    return encodeString(value);
                }

                if (value instanceof Array) {
                    return encodeArray(value);
                }

                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        result.push(encodeString(key) + ':' + JSON.stringify(value[key]));
                    }
                }
                return '{' + result.join(',') + '}';
            };
        }())
    };
	/* Date.now */
	Date.now = Date.now || function  () {
		return new Date().getTime();
	}

}();

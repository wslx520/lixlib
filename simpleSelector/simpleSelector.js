var ss,
simpleSelector = ss = function  () {
	var 
	dom = document,
    html = dom.documentElement,
	body = dom.body,
	undif,
	nativeQuery = dom.querySelectorAll,
	justOne = /[^\s\,]/g,
	blank = /\s+/g,
	letterStr = '[A-Za-z]',
	routineStr = '[\\w-_]+',
	attrStr = '\\[([\\w-_]+)([\\!\\*\\^\\$\\~|]?\\=)?(\\w+)?\\]',
	characters = '',
    validNodeIndex = [],
	regexp = function  (str,gi) {
		return new RegExp(str,gi||'');
	},
	// 只有一个选择器，如#id,.classes,div,div.classes
	simpleReg = /^([\w-_]+)?(#|\.)?([\w-_]+)$/,
	selectorReg = {
		id:regexp('^#'+letterStr+'[\\w-_\\:\\.]*'),
		classes:regexp('^\\.'+letterStr+'[\\w-_\\:\\.]*'),
		tag:regexp('^'+letterStr+'\+[1-6]?'),
		// attr:/^\[([\w-_]+)([\!\*\^\$\~\|]?\=)?(\w+)?\]/,
		attr:regexp('^'+attrStr),
		pseudo:/^\:(\w-)+/
	},
	selectorRegFix = {
		hasClass:/\./,
		hasAttr:/\[.+\]/
	},
	selectorFilter = {
		id: /#([\w-_])+/,
		classes: /\.\w+/g,
		attr:regexp(attrStr,'g')
	},
    nodesToArray = function(nodes) {
        try {
            return Array.prototype.slice.call(nodes);
        } catch (e) {
            var res = [];
            for(var n=0, nl = nodes.length; n< nl; n++) {
                res.push(nodes[n]);
            }
            return res;
        }
    },
	byId= function (id){
		return dom.getElementById(id);
	},
	byName = function  (name) {
		return dom.getElementsByName(name)
	},
	byTag = function  (tag,par) {
		return (par || dom).getElementsByTagName(tag);
	},
	byClass = dom.getElementsByClassName ? function (cls,tag,par,attr) {
			var nodes = (par || dom).getElementsByClassName(trim(cls))
			// console.log(cls,tag,par,nodes)
			if(!tag || tag=='*',tag= tag.toUpperCase()) return nodes;
			var r = [],i=0,l=nodes.length,ifattr = !!attr;
			for(;i<l;i++) {
				if((nodes[i].tagName === tag) && (ifattr ? checkAttr(nodes[i],attr) : true)) r.push(nodes[i]);
			}
			return r;
		}
	: function (cls,tag,par,attr) {
		var list = byTag(tag || '*',par),
			resultArr = [],			
			g,i, item, className,
            ifattr = !!attr;
		cls = trim(cls).split(blank);
		for (i = 0; item = list[i++]; ) {
			if(ifattr && !checkAttr(item,attr)) {
				continue;
			}
			className = ' '+item.className+' ', f = 1;
			for(g=cls.length;g--;) {
				//先判断class字符串是不是空的，以防出现传首尾有空格的参数'a b c   '时判断出错
				if(className.indexOf(' '+cls[g]+' ') == -1) {
					f = 0; break;
				}
			}
			f && resultArr.push(item);
		};
		return resultArr;	
	},

	GET = {
		id:byId,tag:byTag,classes:byClass,name:byName
	},
	trim = function  (str) {
		return str.replace(/^\s+/,'').replace(/\s+$/,'');
	},
	eachArr = function  (arr,fn) {
		for (var l = arr.length,i=0; i<l;i++) {
			fn(arr[i],i,arr);
		};
	},
	eachObj = function  (obj,fn) {
		for(var o in obj) {
			if(fn(obj[o],o,obj)===false) break;
		}
	},
	// 关系符处理函数
	relativeFns = {
		' ': function  () {
			
		},
		'>': function  () {
			
		},
		'~': function  () {
			
		},
		'+': function  () {
			
		}
	},
	filterFns = {
		id: function  (elm,str) {
			return elm.getAttribute('id') === str;
		},
		classes: function  (elm,str) {
			var eClasses = elm.className,
			str = str.split(blank),
            s=str.length;
			for(;s--;) {
				if(eClasses.search(regexp('\\b'+str[s]+'\\b')) === -1) {
					return false;
				}
			}
			return true;
		},
		tag: function  (elm,str) {
			return elm.tagName === str.toUpperCase();
		},
		attr: checkAttr
	},
	// 伪元素选择器:first-child 等
	pseudoSelector = {
		'first-child': function  (elm) {
			return elm === elm.parentNode.children[0];
		},
		'last-child': function  (elm) {
			var children = elm.parentNode.children,l = children.length;
			return elm === children[l-1];
		},
		'nth-child': function  (argument) {
			// body...
		}
	};

	// 获取兄弟节点（可前可后）
	function getNode (elem,dir) {
		dir = dir || 'nextSibling';
		var f,p;
		if(dir==='all') {
			f = elem.parentNode.firstChild;
			dir = 'nextSibling';
			p = elem.parentNode.firstChild;
		} else {
			p = elem[dir];
		}
		while(p) {
			if(isNode(p)) {
				return p;
			}
			p = p[dir];
		}
		return null;
	}

	function isNode (el) {
		return (el.nodeType==1) && el.tagName; 
	}
	// 从属性字符串里分析出属性名，运算符，属性值
	function attrMatcher (str) {
		var m;
		if(m = selectorFilter.attr.exec(str)) {
			return {
				name: m[1],
				operator: m[2],
				value: m[3]
			}
		}
	}
	// 判断字符串匹配什么选择器
	function matcher (str,i,strArr) {
		var prop = {
			string: str
		},res, classes, id;
		for(var i in selectorReg) {
			res = selectorReg[i].exec(str);
			if(res) {
				classes = '';
                id = '';
				prop.type = i;
				prop.id = (i==='id') ? res[0].slice(1) : (id=str.match(selectorFilter.id)) && id[0].slice(1);
				
				prop.tag = i==='tag' && res[0];
				prop.classes = (classes = str.match(selectorFilter.classes)) && (classes+"").replace(',','').replace(/\./g,' ');
				prop.attr = attrMatcher(str);
				if(prop.attr && prop.attr.name=='name' && prop.attr.operator=='=' && prop.attr.value) {
					prop.type='name';
				}
				break;
			}
		}
		return prop;
	}
	// 根据字符串的类型等属性，生成元素验证函数
	function matchFilter (prop) {
		var fns = [];
		for(var p in prop) {
			if(prop[p] && filterFns[p]) {
				filterFns[p].type = p;
				fns.push(filterFns[p]);
			}
		}
		// console.log(fns)
		return function  (elm) {
			for(var f=fns.length;f--;) {
				// console.log(fns[f])
				if(false === fns[f](elm,prop[fns[f].type])) {
					return false;
				}
			}
			return true;
		}
	}
	// 主函数
	function selector (str,par) {
		var 
		selectorArr,
		oneGroup,
		results,
		simple;

		if(typeof str === 'string') {
			// 防止出现首尾空格
			// 防止出现多个连续空格的情况
			//防止出现 div>a 这种关系符前后无空格的情况
			str = trim(str).replace(blank,' ').replace(/([\>\+\~])/g,' $1 ');
		}
		// console.log(str);
		//针对单个选择器做特别优化
		if(simple = simpleReg.exec(str)) {
			// console.log(simple);
			var s2 = simple[2],s3 = simple[3];
			if('#' === s2) {
				return byId(s3);
			} else if(undif=== s2) {
				return byTag(s3);
			} else if('.' === s2) {
				return byClass(s3,simple[1]);
			}
		}
		return simulateQuery(str);
		if(nativeQuery) {
			return dom.querySelectorAll(str);
		} else {
			return simulateQuery(str);
		}		
	}
	//查询函数 
	function simulateQuery (str) {
		var reg = /(\w)/g,res = [];
		selectorArr = str.split(',');
		oneGroup = selectorArr.length==1;
		for(var s=selectorArr.length,ss;s--;) {
			selectorArr[s]=selectorArr[s].split(/\s+/);
			ss = selectorArr[s];
			var 
			last = ss.pop(),
			prop = matcher(last),
			tempPool; //临时元素池
			// console.log(last,prop)
			if(prop.id) {
				tempPool = byId(prop.id);
			} else if(prop.type === 'name') {
				// 针对name做特别处理
				tempPool = byName(prop.attr.value);
			} else if(prop.classes) {
				// 如果有tag，则byClass就会在返回前循环一遍以判断tag符合与否。
				// 如果此时除了tag和class外，还有attribute，就需要进一步过滤
				// 为提高效率，此时可以加入回调函数判断attribute，供循环时调用，进一步剔除不符合的元素
				// 此时不过滤，后面还是要循环过滤，但就多一次循环
				var fn;
				
				tempPool = byClass(prop.classes,prop.tag,doc,prop.attr);
			} else if(prop.tag){
				tempPool = byTag(prop.tag);
			}
			// console.log(prop, tempPool)
			// 对元素集做预先过滤
			tempPool = checkList(tempPool,prop);
			// 再往上级过滤
            // res = ss.length ? filterElements_old(tempPool,ss) : tempPool;
            tempPool.validNodeIndex = {};
			res = ss.length ? filterElements(tempPool,ss) : tempPool;
            // res = ss.length ? filterElements_new(tempPool,ss) : tempPool;
			// console.log(prop,res)
		}
		return res;
	}
	function checkList (list,prop) {
		var 
		type = prop.type,
			// 得到要检查的属性
		will = function  () {
			var r =[], p;
			for(p in prop) {
				if(p!== 'string' && p!== 'type' && p !==prop['type'] && prop[p]) {
					r.push(p);
				}
			}
			return r;
		}();
		// console.log(prop,will)
		// 如果没有要检查的属性，就直接返回原list
		if(will.length<1) return list.splice ? list : nodesToArray(list);
        var i=0,l=list.length,res = [],ll,
            t, w, p, pp;
		for(;i<l;i++) {
			ll = list[i];
			for(t = true, w=will.length;w--;) {
				p = will[w], pp = prop[p];
                // console.log(p,  pp)
				if(pp && filterFns[p](ll,pp) == false) {
					t = !t;
					break;
				}
			}
			t && res.push(ll);
		}
		return res;
	}
	function checkAttr (elm,attr) {
		// attr is an Object, contains [name],[operator],[value]
		 //先取出节点对应的属性值
	    var result = elm.getAttribute(attr.name),
	    	operator = attr.operator,
	    	check = attr.value;
	 
		// console.log(attr,result)
	    //看看属性值有木有！
	    if ( result == null ) {
	      //如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
	      return operator === "!=";
	    }
	    //如果没有操作符，那就直接通过规则了
	    if ( !operator ) {
	      return true;
	    }
	 
	    //转成字符串
	    result += "";
	 
	 	// 以下代码摘自jQuery，解释摘自Aaron
	    
	    //如果是等号，判断目标值跟当前属性值相等是否为真
	    return operator === "=" ? result === check :
	 
	      //如果是不等号，判断目标值跟当前属性值不相等是否为真
	      operator === "!=" ? result !== check :
	 
	      //如果是起始相等，判断目标值是否在当前属性值的头部
	      operator === "^=" ? check && result.indexOf( check ) === 0 :
	 
	      //这样解释： lang*=en 匹配这样 <html lang="xxxxenxxx">的节点
	      operator === "*=" ? check && result.indexOf( check ) > -1 :
	 
	      //如果是末尾相等，判断目标值是否在当前属性值的末尾
	      operator === "$=" ? check && result.slice( -check.length ) === check :
	 
	      //这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
	      operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
	 
	      //这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
	      operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
	      //其他情况的操作符号表示不匹配
	      false;
	 
	}
	function filterElements(list,ss) {
        // console.log(ss)
		// 此时的ss是剩下的选择器字符串
		var str = ss.pop(),
			// 这样写比用正则或indexOf快得多
			operator = (str==='>' || str==='~' || str === '+') && str,
			str = operator ? ss.pop() : str,
            // 是否还需要继续过滤
            notcontinue = ss.length === 0,
			target = 'parentNode',
			justOne, //是否查找到一个元素就停止
			prop = matcher(str),
			fn = matchFilter(prop),
			res = [],
			l=0,ll = list.length,
            elm, par, 
            validNodeIndex, vali,
            // 是否此次过滤全部失败
            allFailed = true;
		;
		// 如果取得的字符段是关系符，则再进一步取下一字符段
		if(operator) {
			if(operator !== '>')  {target = 'previousSibling';}
			justOne = operator !== '~';
		}
        validNodeIndex = list.validNodeIndex;
        // console.log(list);
        for(;l<ll;l++) {
            if(validNodeIndex[l] !== false) {
                elm = list[l];
                par = elm[target];
                vali = false;
                // console.log(target,par,justOne)
                while(par && par.nodeType==1) {
                    if(par === dom.body || par === html) {
                        break;
                    }
                    if(fn(par) === true) {
                        vali = true;
                        if(notcontinue) {
                            res.push(elm);
                        }                            
                        break;  
                    }
                    if(justOne) {
                        break;
                    }
                    par = par[target];
                }    
                validNodeIndex[l] = vali;
                if(vali && allFailed) allFailed = false; 
            }            
        }
        if(allFailed) return null;
        if(notcontinue) {
            // 直接使用 delete IE7报错
            list.validNodeIndex = undif;
            return res.length ? res : null;
        }
        return filterElements(list, ss);
	}
    function filterElements_old(list,ss) {
        // 此时的ss是剩下的选择器字符串
        var str = ss.pop(),
            // 这样写比用正则或indexOf快得多
            operator = (str==='>' || str==='~' || str === '+') && str,
            str = operator ? ss.pop() : str,
            target = 'parentNode',
            justOne, //是否查找到一个元素就停止
            prop = matcher(str),
            fn = matchFilter(prop),
            res = [],
            l=0,ll = list.length,
            elm, par
        ;
        // if(!list.validNodeIndex) {
        //     list.validNodeIndex = [];
        // }
        // 如果取得的字符段是关系符，则再进一步取下一字符段
        if(operator) {
            if(operator !== '>')  {target = 'previousSibling';}
            justOne = operator !== '~';
        } 
        // console.log(list);
        for(;l<ll;l++) {
            elm = list[l],par = elm[target];
            // console.log(target,par,justOne)
            while(par && par !== dom) {
                if(par.nodeType==1) {
                    if(fn(par) === true) {
                        res.push(elm);
                        break;  
                    }
                    if(justOne) {
                        break;
                    }                   
                }
                par = par[target];
            }
        }
        // 根据选择器字符串剩余，选择递归过滤或返回结果
        return ss[0] && res[0] ? filterElements_old(res,ss) : res;
    }
    function filterElements_new(list,ss) {
        // 此时的ss是剩下的选择器字符串
        var str = ss.pop(),
            // 这样写比用正则或indexOf快得多
            operator = (str==='>' || str==='~' || str === '+') && str,
            str = operator ? ss.pop() : str,
            target = 'parentNode',
            justOne, //是否查找到一个元素就停止
            prop = matcher(str),
            fn = matchFilter(prop),
            l=0,ll = list.length,
            elm, par,
            vali
        ;
        // if(!list.validNodeIndex) {
        //     list.validNodeIndex = [];
        // }
        // 如果取得的字符段是关系符，则再进一步取下一字符段
        if(operator) {
            if(operator !== '>')  {target = 'previousSibling';}
            justOne = operator !== '~';
        } 
        // console.log(list);
        for(;l<ll;l++) {
            elm = list[l],par = elm[target];
            vali = false;
            // console.log(target,par,justOne)
            while(par && par !== dom) {
                if(par.nodeType==1) {
                    if(fn(par) === true) {
                        vali = true;
                        break;  
                    }
                    if(justOne) {
                        break;
                    }                   
                }
                par = par[target];
            }
            if(!vali) {
                list.splice(l,1);
                ll--;
            }
        }
        // console.log(ss.length, list.length)
        if(ss.length && list.length) {
            return filterElements_new(list,ss);
        }
        // 根据选择器字符串剩余，选择递归过滤或返回结果
        return list;
    }
	return selector;
}();	


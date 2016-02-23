(function (doc) {
    'use strict';
    var min = Math.min, max = Math.max;
    var dom = {
        addEventListener: doc.addEventListener ? function (elem, type, handler) {
            elem.addEventListener(type, handler, false);
        } : function (elem, type, handler) {
            elem.attachEvent('on' + type, handler);
        },
        removeEventListener: doc.removeEventListener ? function (elem, type, handler) {
            elem.removeEventListener(type, handler);
        } : function (elem, type, handler) {
            elem.detachEvent('on' + type, handler);
        }
    },
    wrapEvent = function  (evt) {
        evt = evt || window.event;
        var ie = /MSIE (\d{1,2})/.test(navigator.userAgent), iev = RegExp.$1;
        // console.log(ie,iev)
        if(ie && iev <10) {
            evt.target = evt.srcElement;
            // IE8及以下，evt.button在按下鼠标中键时是4，(evt.button|1)则得到5，所幸的是很少用到按下鼠标中键的事件
            evt.which = evt.keyCode || (evt.button|1);
            evt.stopPropagation = function  () {
                evt.cancelBubble = true;
            }
            evt.preventDefault = function  () {
                evt.returnValue = false;
            }
            evt.pageX = evt.clientX + doc.documentElement.scrollLeft;
            evt.pageY = evt.clientY + doc.documentElement.scrollTop;
        }
         // 自定义方法，会阻止默认行为，阻止冒泡，
        if(!evt.exit) {
            evt.exit = function  () {
                evt.preventDefault();
                evt.stopPropagation();
            }
        }
        return evt;
    };
    function create(cls, tag) {
        tag = doc.createElement(tag || 'div');
        tag.className = cls;
        return tag;
    }
    function createByHTML(str) {
        var temp = doc.createElement('div');
        temp.innerHTML = str;
        return temp.firstChild;
    }
    function extend (old, newone) {
        for(var n in newone) {
            old[n] = newone[n];
        }
        return old;
    }
    // 获得按下的这个节点的坐标
    // 本来可以直接用getMouse当前按下的点，但这是不精确的
    // （需要根据rect进行修改，不然可能出现几像素的偏移）
    function getStart (rect, direct) {
        switch(direct) {
            case 't':
                return {x:rect.x + rect.w/2,y:rect.y};
            case 'b':
                return {x:rect.x + rect.w/2,y:rect.Y};
            case 'l':
                return {x:rect.x,y:rect.y + rect.h/2};
            case 'r':
                return {x:rect.X,y:rect.y + rect.h/2};
            case 'tl':
                return {x:rect.x,y:rect.y};
            case 'tr':
                return {x:rect.X,y:rect.y};
            case 'bl':
                return {x:rect.x,y:rect.Y};
            case 'br':
                return {x:rect.X,y:rect.Y};
            default:
                return {x:0,y:0}
        }
    }
    function getBound (elem) {
        var style = elem.style,
            bound = {
                x: parseInt(style.left, 10),
                y: parseInt(style.top, 10),
                w: parseInt(style.width, 10),
                h: parseInt(style.height, 10),
                X:0,Y:0
            };
        bound.X = bound.x + bound.w;
        bound.Y = bound.y + bound.h;
        return bound;
    }

    // by hefeng
    function fixVR(vr, dire, rect){
        var cu = rect,
            vw = vr.w - cu.w,
            vh = vr.h - cu.h;
            // console.log(cu.x,vr.x,cu.y,vr.y);
        switch(dire){
            case 'tl':
                vr.x = cu.x - vw;
                vr.y = cu.y - vh;
                break;
            case 'tr':
                vr.x = cu.x;
                vr.y = cu.y - vh;
                break;
            case 'bl':
                vr.x = cu.x - vw;
                vr.y = cu.y;
                break;
            default:
                vr.x = cu.x;
                vr.y = cu.y;
        }
        return vr;
    }
    // set styles
    function setStyles (elem, styles) {
        for(var s in styles) {
            elem.style[s] = styles[s];
        }
    }
    var resizer = (function(min, max) {
        // 采用起止点办法
        // 分为上下左右四个函数(左上则是由上和左拼起来的，依此类推)
        // 变量缩写：m:mouse,r:rect,v:visualRect
        function R(m, r, v) {
            v.x = min(m.x, r.x);
            v.X = max(m.x, r.x);
        }
        function L(m, r, v) {
            v.x = min(m.x, r.X);
            v.X = max(m.x, r.X);
        }
        function T(m, r, v) {
            v.y = min(m.y, r.Y);
            v.Y = max(m.y, r.Y);
        }

        function B(m, r, v) {
            v.y = min(m.y, r.y);
            v.Y = max(m.y, r.y);
        }
        return {
            l:L,t:T,r:R,b:B,
            tl: function (m, r, v) {
                T(m, r, v);
                L(m, r, v);
            },
            tr: function (m, r, v) {
                T(m, r, v);
                R(m, r, v);
            },
            bl: function (m, r, v) {
                B(m, r, v);
                L(m, r, v);
            },
            br: function (m, r, v) {
                B(m, r, v);
                R(m, r, v);
            }
        }
    }(min, max));
    // 默认选项
    var defaults = {
        keepScale: false,
        minSize:0
    };
    /*
    * options选项：
    * * minSize:最小尺寸，默认值无。可以是一个数组，两个值依次表示width,height;也可以是一个数字，则矩形会变成正方形
    * * onmousemove:当按下鼠标并拖动时，要执行的回调，此回调会接收一个Object参数，即rect的范围
    * * onmousemove:当按下鼠标并拖动时，要执行的回调，此回调会接收一个Object参数，即rect的范围
    
    */
    function Cutter(elem, options) {
        var root = this,
            mouse = {
                x: 0,
                y: 0
            },
            // 每次开始draw时的坐标
            start = {
                x: 0,
                y: 0
            },
            // 每次开始draw时切割框的起点
            rectStart = {x:0,y:0},
            rect = {},
            visualRect = {},
            divs, i,
            va, mask,
            getCoords,
            // 由于有最小范围，实现可以更简单
            minSize,
            cutbox, rect, rectBox, boxes = [], copy,
            // 此乃装复制图的容器
            imgbox,
            _width,_height,
            Options;
        root.elem = elem;
        root.options = extend({}, defaults);
        extend(root.options, options);
        Options = root.options;
        minSize = Options.minSize;
        root.start = options.start || [0,0];
        if(typeof minSize === 'number') {
            // root.keepScale = true; //保持缩放比例，正方形也是其中 一种
            Options.minSize = minSize = [minSize, minSize];
        }
        function getMouse(e) {
            mouse.x = e.clientX - cutbox.left;
            mouse.y = e.clientY - cutbox.top;
            // mouse.y = e.clientY - cutbox.top + doc.body.scrollTop + doc.documentElement.scrollTop;
            // mouse.x = min(max(0, mouse.x), cutbox.width);
            // mouse.y = min(max(0, mouse.y), cutbox.height);
            return mouse;
        }
        function fixXY (vr) {  
            vr.x = min(max(vr.x, 0), cutbox.width - vr.w);
            vr.y = min(max(vr.y, 0), cutbox.height - vr.h);
            return vr;
        }
        root.onmousemove = options.onmousemove;    
        root.cutbox = cutbox = create('cut-wrap');
        // cutbox.id = 'cutbox';
        root.imgbox = imgbox = create('imgbox');   
        // root.mask = mask = create('cutbox-mask');
        va = create('va');
        root.rect = rectBox = createByHTML('<div class="cutbox-rect" style=""><div class="cutbox-rect-inner" style=""></div><b class="resizer top-left" data="tl"></b><b class="resizer top-right" data="tr"></b><b class="resizer bottom-left" data="bl"></b><b class="resizer bottom-right" data="br"></b></div>');
        root.copy = copy = elem.cloneNode();
        // 先生成复制图容器
        imgbox.appendChild(va);
        imgbox.appendChild(copy);
        // 再依叠放次序放入cutbox
        // cutbox.appendChild(mask);
        cutbox.appendChild(imgbox);
        cutbox.appendChild(rectBox);
        // 最后时刻装入dom中
        elem.parentNode.appendChild(cutbox);
        root.reset();


        root.getRect = function () {
            return getBound(rectBox);
        }
        // 执行初始函数
        if('function' === typeof Options.oninit) {
            Options.oninit.call(root, Options);
        }
        var dire;
        var oldOnMove = doc.onmousemove;
        function documentOnMouseMove (e) {
            e = wrapEvent(e);
            e.exit();
            mouse = getMouse(e);
            doc.onselectstart = function () {
                return false;
            }
            // 避免不必要的计算
            if(mouse.x < 0 || mouse.y < 0 || mouse.x > cutbox.width || mouse.y > cutbox.height) return;
            // console.log('in')
            if(root.status==='move') {
                visualRect.x += mouse.x - start.x;
                visualRect.y += mouse.y - start.y; 
                // 修正范围
                visualRect = fixXY(visualRect);
                root.move(visualRect.x, visualRect.y); 
                // root.move(min(max(visualRect.x,0), cutbox.width - visualRect.w), min(max(visualRect.y,0), cutbox.height - visualRect.h));  
                // 必须是赋值而不是覆盖
                start.x = mouse.x;
                start.y = mouse.y;
            } else {
                // visualRect = calculate(start, mouse, rect, visualRect);
                getCoords(mouse, rect, visualRect);
                _width = max(visualRect.X - visualRect.x, minSize[0]);
                _height = max(visualRect.Y - visualRect.y, minSize[1]);
                // if(_width <= minSize[0] ||  _height <= minSize[1]) return;
                if(Options.keepScale) {
                    _width = _height = max(_width, _height);                    
                }
                
                visualRect.w = _width;
                visualRect.h = _height;
                visualRect = fixVR(visualRect, dire, rect);
                visualRect.Y = visualRect.y + visualRect.h;
                visualRect.X = visualRect.x + visualRect.w;
                // 避免不必要的绘制
                if(visualRect.X > cutbox.width || visualRect.Y > cutbox.height || visualRect.x <0 || visualRect.y < 0) return;
                root.draw(visualRect);
            }
            if(root.onmousemove && root.status) {
                root.onmousemove(visualRect);
            }
        }
        rectBox.onmousedown = function (e) {
            e = wrapEvent(e);
            e.preventDefault();
            //e.stopPropagation();
            // 进入移动状态
            root.status = 'move';
            mouse = getMouse(e);
            // 必须是赋值而不是覆盖
            start.x = mouse.x;
            start.y = mouse.y;
            // console.log(start);
            visualRect = getBound(rectBox);
            // dom.addEventListener(doc, 'mousemove', documentOnMouseMove);
            doc.onmousemove = documentOnMouseMove;
        };
        cutbox.onmousedown = function (e) {
            e = wrapEvent(e);
            e.exit();

            var target = e.target; 
            if(target.tagName === 'B') {
                // 进入draw状态
                root.status = 'draw';
                dire = target.getAttribute('data');
                rect = getBound(rectBox);
                getCoords = resizer[dire];
                // dom.addEventListener(doc, 'mousemove', documentOnMouseMove);
                doc.onmousemove = documentOnMouseMove;
            }
            
        };
        dom.addEventListener(doc, 'mouseup', function(e) {
            // console.log(doc.onmousemove);
            // dom.removeEventListener(doc, 'mousemove', documentOnMouseMove);
            doc.onmousemove = oldOnMove;
            doc.onselectstart = null;
        });
    }
    Cutter.prototype = {
        draw: function (rect) {
            // console.log(rect);
            // rect.w = rect.X - rect.x;
            // rect.h = rect.Y - rect.y;
            this.rect.style.cssText = 'left:'+rect.x+'px;top:'+rect.y+'px;width:'+rect.w+'px;height:'+rect.h+'px';
        },
        move: function (x,y) {
            this.rect.style.left = x + 'px';
            this.rect.style.top = y + 'px';
        },
        reset: function () {
            var root = this, 
                rectBox = this.rect,
                cutbox = this.cutbox,
                copy = root.copy,
                minSize = this.options.minSize,
                // 由于图片是绝对居中的，所以bottom=top,right=left
                imgBound = {left:0,top:0};
            if(root.copy.src !== root.elem.src) {
                root.copy.src = root.elem.src;
            }
            imgBound.left = copy.offsetLeft;
            imgBound.top = copy.offsetTop;
            // 由于被切的图始终要水平、垂直都居中，当图片无法填满框时，要获取他的偏移量
            root.departure = [imgBound.left, imgBound.top];
            setStyles(cutbox, {
                left: imgBound.left + 'px',
                right: imgBound.left + 'px',
                top: imgBound.top + 'px',
                bottom:imgBound.top + 'px'
            })
            cutbox.left = cutbox.getBoundingClientRect().left;
            cutbox.top = cutbox.getBoundingClientRect().top;
            cutbox.height = cutbox.offsetHeight;
            cutbox.width = cutbox.offsetWidth;
            // 确定了cutbox的范围，再设置rectbox的位置
            rectBox.style.cssText = 'width:'+minSize[0]+'px;height:'+minSize[1]+'px;';
            rectBox.style.left = (cutbox.offsetWidth - minSize[0])/2 + 'px';
            rectBox.style.top = (cutbox.offsetHeight - minSize[1])/2 + 'px';
        }
    }
    window.Cutter = Cutter;
}(document))

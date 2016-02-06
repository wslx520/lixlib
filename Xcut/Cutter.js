(function (dom) {
    'use strict';
    var min = Math.min, max = Math.max;
    function create(cls, tag) {
        tag = dom.createElement(tag || 'div');
        tag.className = cls;
        return tag;
    }
    function createByHTML(str) {
        var temp = dom.createElement('div');
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
    var resizer = (function(min, max) {
        // 采用起止点办法
        // 分为上下左右四个函数(左上则是由上和左拼起来的，依此类推)
        // 变量缩写：m:mouse,r:rect,v:visualRect
        var v = {x:0,y:0,X:0,Y:0};
        function R(m, r) {
            v.x = min(m.x, r.x);
            v.X = max(m.x, r.x);
            return v;
        }
        function L(m, r) {
            v.x = min(m.x, r.X);
            v.X = max(m.x, r.X);
            return v;
        }
        function T(m, r) {
            v.y = min(m.y, r.Y);
            v.Y = max(m.y, r.Y);
            return v;
        }

        function B(m, r) {
            v.y = min(m.y, r.y);
            v.Y = max(m.y, r.y);
            return v;
        }
        return {
            l:L,t:T,r:R,b:B,
            tl: function (m, r) {
                T(m, r);
                L(m, r);
                return v;
            },
            tr: function (m, r) {
                T(m, r);
                R(m, r);
                return v;
            },
            bl: function (m, r) {
                B(m, r);
                L(m, r);
                return v;
            },
            br: function (m, r) {
                B(m, r);
                R(m, r);
                return v;
            }
        }
    }(min, max));
    /*
    * options选项：
    * * size:最小尺寸，默认值无。可以是一个数组，两个值依次表示width,height;也可以是一个数字，则矩形会变成正方形
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
            size = this.size = options.size || 0,
            cutbox, rect, rectBox, boxes = [], copy,
            _w,_h;

        if(this.size) {
            if(typeof this.size === 'number') {
                this.square = true; //强制正方形
                this._w = this._h = this.size;
            } else {
                this._w = this.size[0];
                this._h = this.size[1];
            }

        }
        function getMouse(e) {
            mouse.x = e.clientX - cutbox.L;
            mouse.y = e.clientY - cutbox.T + dom.body.scrollTop + dom.documentElement.scrollTop;
            mouse.x = min(max(0, mouse.x), cutbox.width);
            mouse.y = min(max(0, mouse.y), cutbox.height);
            return mouse;
        }
        function checkRect () {
            return rect.w > root._w && rect.h > root._h;
        }
        function resetRect () {
            rect.w = root._w;
            rect.h = root._h;
            rect.X = rect.x+rect.w;
            rect.Y = rect.x+rect.w;
        }
        this.onmousemove = options.onmousemove;    
        this.cutbox = cutbox = create('cutbox-wrap');    
        this.mask = mask = create('cutbox-mask');
        va = create('va');
        this.rect = rectBox = createByHTML('<div class="cutbox-rect" style=""><b class="resizer tl" data="tl"></b><b class="resizer tr" data="tr"></b><b class="resizer bl" data="bl"></b><b class="resizer br" data="br"></b></div>');
        this.copy = copy = elem.cloneNode();
        // copy.style.left = 
        this.status = 'draw';
        cutbox.appendChild(mask);
        cutbox.appendChild(va);
        cutbox.appendChild(copy);
        cutbox.appendChild(rectBox);
        elem.parentNode.appendChild(cutbox);
        rectBox.style.cssText = 'width:'+root._w+'px;height:'+root._h+'px;';
        rectBox.style.left = (cutbox.offsetWidth - size)/2 + 'px';
        rectBox.style.top = (cutbox.offsetHeight - size)/2 + 'px';

        cutbox.L = cutbox.getBoundingClientRect().left;
        cutbox.T = cutbox.getBoundingClientRect().top;
        cutbox.height = cutbox.offsetHeight;
        cutbox.width = cutbox.offsetWidth;
        function documentOnMouseMove (e) {
            e = e || window.event;
            e.preventDefault();
            mouse = getMouse(e);
            if(!checkRect()) {
                resetRect();
            }
            if(root.status==='move') {
                visualRect.x += mouse.x - start.x;
                visualRect.y += mouse.y - start.y; 
                // 修正范围
                root.move(min(max(visualRect.x,0), cutbox.width - visualRect.w), min(max(visualRect.y,0), cutbox.height - visualRect.h));   
                // 必须是赋值而不是覆盖
                start.x = mouse.x;
                start.y = mouse.y;
            } else {
                if(visualRect.X - mouse.x < root._w || visualRect.Y - mouse.y < root._h) {
                    // return;
                }
                // visualRect = calculate(start, mouse, rect, visualRect);
                var coords = getCoords(mouse, rect, visualRect);
                _w = max(coords.X - coords.x, root._w);
                _h = max(coords.Y - coords.y, root._h);
                if(_w <= root._w ||  _h <= root._h) return;
                if(root.square) {
                    var t = min(_w, _h);
                    console.log(coords, visualRect);
                    if(coords.x !== visualRect.x) {
                        visualRect.x = coords.x + t - _w;
                    }
                    if(coords.X !== visualRect.X) {
                        visualRect.X = coords.X + t - _w;
                    }
                    if(coords.y !== visualRect.y) {
                        visualRect.y = coords.y + t - _w;
                    }
                    if(coords.Y !== visualRect.Y) {
                        visualRect.Y = coords.Y + t - _w;
                    }
                    
                    // visualRect.Y += t - _h;
                }
                // visualRect.w = _w;
                // visualRect.h = _h;
                root.draw(visualRect);
            }
            if(root.onmousemove && root.status) {
                root.onmousemove(visualRect);
            }
            
        }
        rectBox.onmousedown = function (e) {
            e = e || window.event;
            e.preventDefault();
            // e.stopPropagation();
            // 进入移动状态
            root.status = 'move';
            mouse = getMouse(e);
            // 必须是赋值而不是覆盖
            start.x = mouse.x;
            start.y = mouse.y;
            // console.log(start);
            visualRect = getBound(rectBox);
            dom.addEventListener('mousemove', documentOnMouseMove);
        };
        cutbox.onmousedown = function (e) {
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();

            var target = e.target; 
            if(target.tagName === 'B') {
                // 进入draw状态
                root.status = 'draw';
                var dire = target.getAttribute('data');
                rect = getBound(rectBox);
                getCoords = resizer[dire];
                // mouse = getMouse(e);
                // start.x = mouse.x;
                // start.y = mouse.y;
                // console.log(getStart(rect, dire), mouse)
                dom.addEventListener('mousemove', documentOnMouseMove);
            }
            
        };
        dom.addEventListener('mouseup', function(e) {
            // console.log(d.onmousemove);
            dom.removeEventListener('mousemove', documentOnMouseMove);
        });
    }
    Cutter.prototype = {
        draw: function (rect) {
            rect.w = rect.X - rect.x;
            rect.h = rect.Y - rect.y;
            this.rect.style.cssText = 'left:'+rect.x+'px;top:'+rect.y+'px;width:'+rect.w+'px;height:'+rect.h+'px';
        },
        move: function (x,y) {
            this.rect.style.left = x + 'px';
            this.rect.style.top = y + 'px';
        }
    }
    window.Cutter = Cutter;
}(document))

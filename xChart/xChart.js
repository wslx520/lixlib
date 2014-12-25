/*
Name: xChart.js
Version: 0.1
Author: Jo2.org
Description:Canvas+Javascript 图表工具库
Remark: 初级版,基本可用
*/
var xChart = (function () {

    var 
    AP = Array.prototype,
    maxInArray = function  (arr) {
        Math.max.apply(arr);
    },
    XtendCanvas = function () {
        var pro = 'save,restore,scale,rotate,translate,transform,createLinearGradient,createRadialGradient,getLineDash,clearRect,fillRect,beginPath,closePath,moveTo,lineTo,quadraticCurveTo,bezierCurveTo,arcTo,rect,arc,fill,stroke,clip,clearShadow,fillText,strokeText,strokeRect,drawImage,drawImageFromRect,putImageData,createPattern,createImageData,textBaseLine,strokeStyle,lineWidth,globalAlpha,fillStyle,font,shadowOffsetX,shadowOffsetY,shadowBlur,shadowgroupor,lineCap,lineJoin,miterLimit,getImageData,isPointInPath,textAlign,textBaseline,setTransform,measureText'.split(','),
            old = document.createElement('CANVAS').getContext('2d');
        function f(canvas) {
            this.c = canvas.getContext('2d');
        }
        for (var i = 1,p=pro[0];p;p=pro[i++]) {
            // console.log(i +' >> '+ p + ' >> ' + typeof CanvasRenderingContext2D.prototype[p]);
            f.prototype[p] = function  (p) { 
                return (typeof old[p] === 'function') ? function  () {
                        var r = this.c[p].apply(this.c,arguments);
                        return r === undefined ? this : r;
                    } : function  () {
                        this.c[p] = Array.prototype.join.call(arguments);
                        return this;
                    };
            }(p);
        }  
        return function(canvas) {
            return new f(canvas);
        };    
    }()
    function applyIf(o, c) {
        if(o && c) {
            for(var p in c) {
                if(o[p]===undefined) {
                    o[p] = c[p];
                }
            }
        }
        return o;
    }       
    function extend (o,c) {
        var b = {};        
        for(var i in o) { b[i] = o[i] }
        for(var i in c) { b[i] = c[i] }
        return b;
    }
    // 外部函数
    function totalValue(o) {
        for(var j = o.length,a = 0;j--;a+=o[j].data);
        return a;
    }
    function drawPoint (s,sz,c) {
        if(s==='circle') {
            return function (x,y) {
                c.moveTo(x+sz/2,y).arc(x,y,sz/2,0,Math.PI*2);
            }
        } else if(s === 'square') {
            return function  (x,y) {
                c.rect(x-sz/2,y-sz/2,sz,sz);
            }
        }
    }
    function drawGrids (args,config,canvas,extra) {
        var 
        labels = args.labels,
        llen = labels.length,
        scaleLength =config.scaleEnd - config.scaleStart,
        scaleNum = 20,
        scaleStep = scaleLength/scaleNum,
        start = config.scaleStart,
        labelStart = 0,
        DL,DR,DT,DB;
        //计算各个边距
            

        // console.log(height);
        canvas.fillStyle(config.labelColor);

        canvas.font(config.scaleFont);
        DL = canvas.measureText(config.scaleEnd).width*1.5;
        canvas.font(config.labelFont);
        DR = canvas.measureText(labels[llen-1]).width/2;
        DT = (/(\d+)\w{2}/g.exec(config.scaleFont))[1];
        DB = Number(DT)+10;
        // console.log(DB);
        height = canvas.height-DB-DT, 
        width = canvas.width-DL-DR,
        group = width/(extra ? llen : llen-1),
        row = height/scaleNum;

        if(extra) labelStart = group/2;
        canvas.translate(DL,canvas.height-DB); //translate至原点位置
        // console.log(DL)
        canvas.font(config.labelFont).textAlign("center").textBaseline('hanging');
        canvas.beginPath();
        // var n = extra ? llen -1 : llen;
        for(var n = llen;n--;) {
            var x = n*group+0.5;
            canvas.moveTo(x,0).lineTo(x,-height);
            canvas.fillText(labels[n],x+labelStart,DT*0.5);
        }
        if(extra) {canvas.moveTo(llen*group,0).lineTo(llen*group,-height)};

        canvas.lineWidth(config.labelLineWidth).strokeStyle(config.labelLineColor).stroke();
        canvas.font(config.scaleFont).textAlign('end').textBaseline('middle').beginPath();
        for(var i = scaleNum+1;i--;) {
            // console.log(i)
            canvas.moveTo(-3,-i*row).lineTo(width,-i*row);
            // extra && continue;
            if(i!== 0 && i%2 === 0) {

                canvas.fillText(i*scaleStep+start,-5,-i*row)
            }
        }        
        canvas.lineWidth(config.scaleLineWidth).strokeStyle(config.scaleLineColor).stroke();
        canvas.restore();

        return {group:group,unit:height/scaleLength}
    }
    function Bars(datas,cfg,canvas) {
        
    }
    // 外部函数结束

    var 
    simpleset = {
        lineWidth:2,
        stroke:'#fff'
    },
    gridSet = {
        point:false,
        pointSize:5,
        pointStyle:'circle',
        labelFont:'12px Arial',
        labelColor:'#666',
        labelLineColor:'#ECF0F1',
        labelLineWidth:1,
        labelShow:true,
        scaleFont:'12px Arial',
        scaleColor:'#666',
        scaleLineColor:'#ECF0F1',
        scaleLineWidth:1,
        lineWidth:2,
        scaleShow:true,
        scaleStart:0,
        scaleEnd:100
    };
    Chart.defaults = {
        Ring:simpleset,
        Cake:simpleset,
        Polar:{
            lineWidth:2,
            labelColor:'#666',
            scaleLineWidth:1,
            scaleLineColor:'#ECF0F1',
            scaleFont:'12px Arial',
            scaleShow:true,
            scaleStart:0,
            scaleEnd:100,
            stroke:'#FFF'
        },
        Bars:extend(gridSet,{ 
            barGap:5, // 柱形图之间的缝隙
            barMargin:10 //柱形图与每一列边界的距离
        }),
        Line: gridSet,
        Curve:gridSet,
        Radar:{
            lineWidth:2,
            labelFont:'12px Arial',
            labelColor:'#666',
            scaleShow:true,
            scaleStart:0,
            scaleEnd:100
        }
    }
    function Chart (canvas) {
        this.canvas = XtendCanvas(canvas);
        this.ocanvas = canvas;
        this.context = canvas.getContext('2d');
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.margin = 30;
    }
    applyIf(Chart.prototype,{
        // 环形图
        Ring: function  (args,cfg) {
            var 
            canvas = this.canvas,
            radius = Math.min(canvas.width,canvas.height)/2-10,
            config = extend(Chart.defaults.Cake,cfg);

            canvas.translate(canvas.width/2,canvas.height/2);
            canvas.save().lineWidth(config.lineWidth);
            var values = totalValue(args);
            var per = Math.PI*2/values;
            for(var i = args.length;i--;) {
                var ai = args[i], ra = ai.data*per;
                // console.log(i)
                canvas.beginPath().arc(0,0,radius,0,ra);
                canvas.rotate(ra);
                canvas.lineTo(radius/2,0).arc(0,0,radius/2,0,-ra,true).closePath();
                canvas.fillStyle(ai.fill).fill();
                if(config.stroke) canvas.strokeStyle(config.stroke).stroke();
                // canvas.rotate(ra)
            }
            canvas.restore()
        },
        // 分饼图
        Cake: function  (args,cfg) {
            var 
            canvas = this.canvas,
            radius = Math.min(canvas.width,canvas.height)/2-10,
            config = extend(Chart.defaults.Cake,cfg);

            canvas.save().translate(canvas.width/2,canvas.height/2).lineWidth(config.lineWidth);

            var values = totalValue(args);
            var per = Math.PI*2/values;
            for(var i = args.length;i--;) {
                var ai = args[i],ra = ai.data*per;
                // console.log(ai)
                canvas.beginPath().arc(0,0,radius,0,ra).lineTo(0,0).closePath();
                canvas.fillStyle(ai.fill).fill();
                config.stroke && canvas.strokeStyle(config.stroke).stroke();
                canvas.rotate(ra);
            }
            canvas.restore();
        },
        Polar: function (args,cfg) {
            var 
            canvas = this.canvas,
            config = extend(Chart.defaults.Polar,cfg),
            scaleEnd = config.scaleEnd,
            scale = config.scaleEnd - config.scaleStart,
            perRing = scale/5,
            group = scale/10,
            unit = (Math.min(canvas.width,canvas.height)/2-30)/scale,
            llen = args.length,
            yuan = Math.PI*2,
            angle = yuan/llen;

            canvas.translate(canvas.width/2,canvas.height/2).beginPath();
            for(var i = 0;(i+=group)<=scale;) {
                // console.log(i)
                canvas.moveTo(i*unit,0).arc(0,0,i*unit,0,yuan);                               
            }
            canvas.closePath().lineWidth(config.scaleLineWidth).strokeStyle(config.scaleLineColor).stroke();
            canvas.lineWidth(config.lineWidth);
            for(var i = args.length;i--;) {
                var ai = args[i],radius = ai.data*unit;
                // console.log(ai.data+'>>>'+radius)
                canvas.beginPath().arc(0,0,radius,0,angle).lineTo(0,0).closePath();
                canvas.fillStyle(ai.fill).fill();
                if(config.stroke) canvas.strokeStyle(config.stroke).stroke();
                canvas.rotate(angle)
            }
            canvas.font(config.scaleFont).textAlign('center').textBaseline('middle');
            for(var i = 0;(i+=group)<=scale;) {
                // console.log(i)
                if(i%20 === 0) {
                    canvas.fillStyle('rgba(255,255,255,0.9)').fillRect(-10,-i*unit-8,20,16);
                    canvas.fillStyle(config.labelColor).fillText(i,0,-i*unit);     
                }                               
            }
        },
        // 雷达图
        Radar: function (args,cfg) {            
            var datas = args.datas,
                dlen = datas.length,
                labels = args.labels,
                llen = labels.length,
                config = extend(Chart.defaults.Radar,cfg),
                maxValue = config.scaleEnd-config.scaleStart,
                group = maxValue/10,
                unit =1;
            var canvas = this.canvas,
                boxW = this.width-30*2,
                boxH = this.height-30*2;
            var angle = 360/llen,deg=Math.PI/180;
            canvas.save();
            canvas.translate(canvas.width/2,canvas.height/2).beginPath();

            for(var i = 0;(i+=group)<=maxValue;) {
                for(var l = llen;l--;) {
                    canvas.moveTo(i*unit,0).rotate(deg*angle).lineTo(i*unit,0);
                }
            }
            canvas.moveTo(0,0).lineTo(maxValue,0);
            canvas.font(config.labelFont).textAlign('center').textBaseline('middle');
            for(var l = llen;l--;) {
                // canvas.moveTo(maxValue,0);
                canvas.save();
                canvas.rotate(deg*angle*l);
                // canvas.lineTo(maxValue,0);
                canvas.moveTo(0,0).lineTo(maxValue*unit,0);
                canvas.translate(maxValue*unit+12,0).rotate(-deg*angle*l).fillText(labels[l],0,0);
                canvas.restore();

            }
            // canvas.restore();
            canvas.strokeStyle('#ECF0F1').stroke();
            var dp = config.point && drawPoint(config.pointStyle,config.pointSize,canvas);
            for(var d = dlen;d--;) {
                var dd = datas[d],
                    data = dd.data,
                    dlenth = data.length,
                    point = dd.point,
                    size = point.size;
                canvas.lineWidth(2);
                canvas.save();
                canvas.beginPath();
                for(var i = data.length;i--;) {
                    if(i === data.length-1) {
                        // console.log(i);
                        canvas.moveTo(data[i],0);
                        // canvas.fillText(i,data[i],0);
                        continue;
                    }
                    canvas.rotate(deg*angle).lineTo(data[i],0);
                }
                canvas.restore();
                canvas.closePath().fillStyle(dd.fill).fill().strokeStyle(dd.stroke).stroke();
                if(point && dp) {
                    // canvas.save();
                    canvas.fillStyle(point.fill).strokeStyle(point.stroke).beginPath();
                    var size = point.size,i = dlenth;
                    for(;i--;) {
                        // canvas.rect(i*group-size,-data[i]*unit-size,size*2,size*2);
                        // canvas.moveTo(data[i]+size,0).arc(data[i],0,size,0,Math.PI*2)
                        dp(data[i],0);
                        canvas.rotate(deg*angle);
                    }
                    canvas.closePath().fill().stroke();
                    // canvas.restore();
                }
            }

        },

        // 直线图
        Line: function (args,cfg) {
            var datas = args.datas,
                dlen = datas.length,
                labels = args.labels,
                llen = labels.length,
                canvas = this.canvas;
            // console.log(boxH)
            var config = extend(Chart.defaults.Bars,cfg);
            
            var result =  drawGrids(args,config,canvas),
                unit = result.unit,
                group = result.group,
                boxW = group*(llen-1),
                start = config.scaleStart;  
            var dp = config.point && drawPoint(config.pointStyle,config.pointSize,canvas);
            canvas.lineJoin('round');
            canvas.beginPath().moveTo(0,datas[0].data[0]);
            for(var d =0;d<dlen;d++) {
                var dd = datas[d],
                    data = dd.data,
                    dlenth = data.length,
                    point = dd.point;
                canvas.beginPath().moveTo((dlenth-1)*group,-data[dlenth-1]*unit);
                for(var i = dlenth-1;i--;) {
                    canvas.lineTo(i*group,(-data[i]+start)*unit);
                }
                canvas.lineWidth(config.lineWidth).strokeStyle(dd.stroke).stroke();
                if(dd.fill) canvas.lineTo(0,0).lineTo(boxW,0).fillStyle(dd.fill).fill()
                if(point && dp) {
                    canvas.fillStyle(point.fill).strokeStyle(point.stroke).beginPath();
                    for(var i = dlenth;i--;) {
                        dp(i*group,(-data[i]+start)*unit);
                    }
                    canvas.closePath().fill().stroke();
                }
            }
        },
        // 曲线图
        Curve: function (args,cfg) {            
            var 
            datas = args.datas,
            dlen = datas.length,
            labels = args.labels,
            llen = labels.length,
            canvas = this.canvas,
            width = this.width,
            height = this.height;
            // console.log(boxH)
            var config = extend(Chart.defaults.Bars,cfg);
            var result =  drawGrids(args,config,canvas),
                unit = result.unit,
                group = result.group,
                start = config.scaleStart;
                // console.log(unit)
            var dp = config.point && drawPoint(config.pointStyle,config.pointSize,canvas);
            canvas.beginPath().moveTo(0,-datas[0].data[0]+start);
            for(var d =0;d<dlen;d++) {
                var dd = datas[d],data = dd.data,dlenth = data.length, point = dd.point;
                canvas.beginPath().moveTo(0,(-data[0]+start)*unit);
                for(var i = 0;i<dlenth;i++) {
                    canvas.bezierCurveTo((i+1)*group- group/2 ,(-data[i]+start)*unit,i*group+group/2,(-data[i+1]+start)*unit,(i+1)*group,(-data[i+1]+start)*unit);
                }
                // console.log((i)*group+'>>>'+boxW)
                canvas.lineWidth(2)
                canvas.strokeStyle(dd.stroke).stroke();
                canvas.lineTo((dlenth-1)*group,0).lineTo(0,0).fillStyle(dd.fill).fill();
                if(dp && point) {
                    canvas.fillStyle(point.fill).strokeStyle(point.stroke).beginPath();
                    var size = config.pointSize;
                    for(var i = dlenth;i--;) {
                        dp(i*group,(-data[i]+start)*unit);
                    }
                    canvas.closePath().fill().stroke();
                }
            }
            

        },
        // 柱形图
        Bars: function (args,cfg) {
            var 
            datas = args.datas,
            dlen = datas.length,
            labels = args.labels,
            llen = labels.length,
            canvas = this.canvas,
            config = extend(Chart.defaults.Bars,cfg),
            start = config.scaleStart; 
            
            // 画出背景格子并接受返回值
            var result = drawGrids(args,config,canvas,true);

            var gap = config.barGap,
                mg = config.barMargin,
                group = result.group,
                unit = result.unit,
                barW = (group- (dlen-1)*gap - mg*2)/dlen;
            // var row = height/100
            for (var d = datas.length;d--;) {
                var dd = datas[d],data = dd.data;
                canvas.beginPath();
                for(var a=0; a<data.length;a++) {
                    var x = d*(barW+gap)+a*group+mg;
                    canvas.rect(x,0,barW,(-data[a]+start)*unit);
                }
                canvas.fillStyle(dd.fill).fill().strokeStyle(dd.stroke).stroke()
            }
            // var _value = datas.values;
            // for(var i =0;i<_value.length;i++) {}
        }
    })
    return Chart;
})()



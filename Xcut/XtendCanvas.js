var XtendCanvas = function () {
    var pro = ['save','restore', 'scale', 'rotate', 'translate', 'transform',  'createLinearGradient', 'createRadialGradient', 'getLineDash', 'clearRect', 'fillRect', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arcTo', 'rect', 'arc', 'fill', 'stroke', 'clip', 'isPointInPath', 'measureText', 'clearShadow', 'fillText', 'strokeText',   'strokeRect', 'drawImage', 'drawImageFromRect',  'putImageData', 'createPattern', 'createImageData', 'getImageData','strokeStyle','lineWidth','globalAlpha','fillStyle','font','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','lineCap','lineJoin','miterLimit'];
    function fn (canvas) {
        this.context = canvas.getContext('2d');
    }
    var old = document.createElement('CANVAS').getContext('2d');
    for(var i = 1,p=pro[0];p;p=pro[i++]) {
        // console.log(i +' >> '+ p + ' >> ' + typeof CanvasRenderingContext2D.prototype[p]);
        fn.prototype[p] = function  (p) { 
            return (typeof old[p] === 'function') ? function  () {
                    this.context[p].apply(this.context,arguments);
                    return this;
                } : function  () {
                    this.context[p] = Array.prototype.join.call(arguments);
                    return this;
                };
        }(p);
    }  
    old = null;
    return function  (canvas) {
        return new fn(canvas);
    };
    
}()
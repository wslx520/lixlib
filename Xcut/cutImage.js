var d = document,
	$ = function(id) {
		return d.getElementById(id);
	}
var frompic = $('frompic'),
	img = $('img'),
	cut = $('cut'),
	ok = $('ok'),
	infos = $('info').children,
	ctx = XtendCanvas(cut),
	okx = ok.getContext('2d');
// ctx;

var frag = d.createDocumentFragment(),
	divs = (function() {
		var a = [];
		for (var i = 0; i < 8; i++) {
			var div = d.createElement('DIV');
			div.className = 'd';
			div.id = 'd' + (i + 1);
			div.w = 12; //div宽高变量
			a.push(frag.appendChild(div));
		}
		return a;
	})();

function getPath(file) {
	if (file.files && file.files[0]) {
		var reader = new FileReader();
		reader.readAsDataURL(file.files[0]);
		reader.onload = function(e) {
			img.src = e.target.result;
			img.onload = function() {
				console.log(this.width);
				cut.width = this.width;
				cut.height = this.height;
			}
		}
	}
}

var mouse = {
		x: 0,
		y: 0
	},
	start = {
		x: 0,
		y: 0
	},
	rect = {};
cut.L = cut.getBoundingClientRect().left;
cut.T = cut.getBoundingClientRect().top;
cut.onmousedown = function(e) {
	console.log('d.body.scrollTop + d.documentElement.scrollTop');
	// start = getMouse(e);
	start.x = e.clientX - cut.L, start.y = e.clientY - cut.T + d.body.scrollTop + d.documentElement.scrollTop;

	if (rect.x != undefined && rect.w != undefined) {
		ctx.beginPath().rect(rect.x, rect.y, rect.w, rect.h);
		console.log(ctx.context.isPointInPath(start.x, start.y));
		if (ctx.context.isPointInPath(start.x, start.y)) {
			cut.pathIn = true;
			cut.style.cursor = 'move';
		}
	}
	d.onmousemove = toDraw;

}
// alert(frag);

function getMouse(e) {
	mouse = {
		x: e.clientX - cut.L,
		y: e.clientY - cut.T + d.body.scrollTop + d.documentElement.scrollTop
	};
	mouse.x = Math.min(Math.max(0,mouse.x), cut.width);
	mouse.y = Math.min(Math.max(0,mouse.y), cut.height);
	return mouse;
}


function toDraw(e) {
	// 
	getMouse(e);
	if (cut.pathIn) {
		// console.log('pathIn');
		rect.x = (mouse.x - (start.x - start.ox));
		rect.y = (mouse.y - (start.y - start.oy));
		fixRect(rect);
	} else {
		rect.x = Math.min(mouse.x, start.x), rect.y = Math.min(mouse.y, start.y);
		rect.w = Math.abs(mouse.x - start.x), rect.h = Math.abs(mouse.y - start.y);
	}
	drawCut(rect)
}
d.onmouseup = function(e) {
	// console.log(d.onmousemove);
	d.onmousemove = null;
	cut.pathIn = false;
	start.ox = rect.x;
	start.oy = rect.y;
	start.ow = rect.w;
	start.oh = rect.h;
	cut.style.cursor = 'default';
}
function fixRect (rect) {
	rect.x < 0 && (rect.x = 0);
	rect.y < 0 && (rect.y = 0);
	rect.x + rect.w > cut.width && (rect.x = cut.width - rect.w);
	rect.y + rect.h > cut.height && (rect.y = cut.height - rect.h);
}
function pointXY (x,y,w,h) {
	return [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2] ]; 
}
function drawCut(rect,fns) {
	if(fns) {for (var i = 0, l = fns.length; i < l; fns[i++]());}
	if (ctrl) { rect.w = rect.h = Math.min(rect.w, rect.h);	}
	var x = rect.x,y=rect.y, w=rect.w, h=rect.h;
	ctx.save().clearRect(0, 0, cut.width, cut.height)
		.beginPath()
		.fillStyle('rgba(0,0,0,0.2)').fillRect(0, 0, cut.width, cut.height)
		.clearRect(x, y, w, h)
		.strokeStyle('rgba(255,0,0,0.8)').strokeRect(x, y, w, h).restore();
	var points = pointXY(x,y,w,h);
	for (var i = 0, l = points.length; i < l; i++) {
		var x = points[i][0],
			y = points[i][1],
			d = divs[i];
		// ctx.moveTo(x,y).arc(x,y,3,0,Math.PI*2);
		d.x = x, d.y = y;
		d.style.left = x - d.w / 2 + 'px';
		d.style.top = y - d.w / 2 + 'px';
	}

	docut();
	showInfo(w, h);
};

~function resize() {
	function vc () {
		rect.x = Math.min(mouse.x,start.ox);
		rect.w = Math.abs(mouse.x-start.ox);
	}
	function vt() {
		rect.y = Math.min(mouse.y, start.oy+start.oh);
		rect.h = Math.abs(start.oh - mouse.y + start.oy);
	}

	function vb() {
		rect.y = Math.min(mouse.y, start.oy);
		rect.h = Math.abs(mouse.y - start.oy);
	}
	for (var i = 0; i < 8; i++) {
		divs[i].addEventListener('mousedown', function() {
			// console.log('dddddddddddddddd');
			var fns = [];			
			switch (this.x) {
				case start.ox + start.ow:
					fns.push(vc);
					if (this.y == start.oy + start.oh) {
						fns.push(vb)
					} else if (this.y == start.oy) {
						fns.push(vt)
					}
					break;
				case start.ox + start.ow / 2:
					if (this.y == start.oy) {
						fns.push(vt)
					} else {
						fns.push(vb)
					};
					break;
				default:
					fns.push(function() {
						rect.x = Math.min(mouse.x,start.ox+start.ow);
						rect.w = Math.abs(start.ow - mouse.x + start.ox);
					})
					if (this.y == start.oy + start.oh) {
						fns.push(vb)
					} else if (this.y == start.oy) {
						fns.push(vt)
					}

			}
			// console.log(argus);
			d.onmousemove = function(e) {
				getMouse(e);
				drawCut(rect,fns);
			}
		}, false)
	}
}();
function showInfo(w, h) {
	infos[0].innerHTML = w;
	infos[1].innerHTML = h;
}
$('container').appendChild(frag);

function docut() {
	if (rect.x != undefined && rect.y != undefined && rect.w != undefined) {
		ok.width = rect.w;
		ok.height = rect.h;
		// console.log(cut.oldx+'>'+cut.oldy);
		okx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
		return;
	}
	return false;
}
//需要运行在服务器环境

function todo() {
	var i = new Image();
	try {
		var data = ok.toDataURL();
		i.src = data;
		d.body.appendChild(i);
	} catch (e) {
		alert(e);
	}
	
	
}
var ctrl, shift;
document.addEventListener('keydown', function(e) {
	console.log(e.ctrlKey);
	if (e.ctrlKey) {
		console.log('ctrl has pressd');
		ctrl = true;
		if(rect.w && rect.h) {
			rect.w = rect.h = Math.min(rect.w, rect.h);
			drawCut(rect);
		}
		
		// console.log(rect.w+'www'+rect.h);
	}
	if (e.shiftKey) {
		console.log('shift has pressd');
		shift = true;
	}
})
d.addEventListener('keyup', function(e) {
	// console.log(e.keyCode)
	ctrl = false;
	shift = false;
	if (e.ctrlKey) {
		// console.log('ctrl has up')
	}
})
//缓动公式类
//参数说明:t初始时间,b起始位置,c移动的距离,d缓动执行多长时间
var Tween = {
	  Linear: function(t,b,c,d){ return c*t/d + b; },
	  QuadIn: function(t,b,c,d){
		return c*(t/=d)*t + b;
	  },
	  QuadOut: function(t,b,c,d){
		return -c *(t/=d)*(t-2) + b;
	  },
	  QuadInOut: function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	  },
	  CubicIn: function(t,b,c,d){
		return c*(t/=d)*t*t + b;
	  },
	  CubicOut: function(t,b,c,d){
		return c*((t=t/d-1)*t*t + 1) + b;
	  },
	  CubicInOut: function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	  },
	  QuartIn: function(t,b,c,d){
		return c*(t/=d)*t*t*t + b;
	  },
	  QuartOut: function(t,b,c,d){
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	  },
	  QuartInOut: function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	  },
	  QuintIn: function(t,b,c,d){
		return c*(t/=d)*t*t*t*t + b;
	  },
	  QuintOut: function(t,b,c,d){
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	  },
	  QuintInOut: function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	  },
	  SineIn: function(t,b,c,d){
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	  },
	  SineOut: function(t,b,c,d){
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	  },
	  SineInOut: function(t,b,c,d){
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	  },
	  ExpoIn: function(t,b,c,d){
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	  },
	  ExpoOut: function(t,b,c,d){
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	  },
	  ExpoInOut: function(t,b,c,d){
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	  },
	  CircIn: function(t,b,c,d){
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	  },
	  CircOut: function(t,b,c,d){
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	  },
	  CircInOut: function(t,b,c,d){
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	  },
	  FromTo: function(t,b,c,d) {
		//if ((t/d/=0.5) < 1) return 0.5*Math.pow(t/d,4)*c+b;
		//return -0.5 * (((t/d)-=2)*Math.pow(t/d,3) - 2)*c+b;
	},
	From: function(t,b,c,d) {
		return Math.pow(t/d,4)*c+b;
	},
	To: function(t,b,c,d) {
		return Math.pow(t/d,0.25)*c+b;
	},
	//过边界并来回弹动(相当于摇动的钟摆)
	  ElasticIn: function(t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	  },
	  ElasticOut: function(t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	  },
	  ElasticInOut: function(t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	  },
	//过边界并回滚
	  BackIn: function(t,b,c,d,s){
		s = 1.70158 || s;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	  },
	  BackOut: function(t,b,c,d,s){
		s = 1.70158 || s;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	  },
	  BackInOut: function(t,b,c,d,s){
		s = 1.70158 || s;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	  },
	//碰边界后弹跳(相当于球掉在地上并跳动)
	  BounceIn: function(t,b,c,d){
		return c - Ease.BounceOut(d-t, 0, c, d) + b;
	  },
	  BounceOut: function(t,b,c,d){
		if ((t/=d) < (1/2.75)) {
		  return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
		  return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
		  return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
		  return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	  },
	  BounceInOut: function(t,b,c,d){
		if (t < d/2) return Ease.BounceIn(t*2, 0, c, d) * .5 + b;
		else return Ease.BounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
	  }
}
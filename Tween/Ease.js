//一个缓动公式类
var Ease = (function () {
	var r = Math,
		pi = r.PI,
		k = r.pow,
		g = r.sin,
		c = r.cos,
		l = 1.70158;
	return {
		QuadIn: function(p){
			return p*p;
		},
		QuadOut: function(p){
			return -(k((p-1), 2) -1);
		},
		QuadInOut: function(p){
			if ((p/=0.5) < 1) return 0.5*k(p,2);
			return -0.5 * ((p-=2)*p - 2);
		},
		CubicIn: function(p){
			return k(p, 3);
		},
		CubicOut: function(p){
			return (k((p-1), 3) +1);
		},
		CubicInOut: function(p){
			if ((p/=0.5) < 1) return 0.5*k(p,3);
			return 0.5 * (k((p-2),3) + 2);
		},
		QuartIn: function(p){
			return k(p, 4);
		},
		QuartOut: function(p){
			return -(k((p-1), 4) -1)
		},
		QuartInOut: function(p){
			if ((p/=0.5) < 1) return 0.5*k(p,4);
			return -0.5 * ((p-=2)*k(p,3) - 2);
		},
		QuintIn: function(p){
			return k(p, 5);
		},
		QuintOut: function(p){
			return (k((p-1), 5) +1);
		},
		QuintInOut: function(p){
			if ((p/=0.5) < 1) return 0.5*k(p,5);
			return 0.5 * (k((p-2),5) + 2);
		},
		SineIn: function(p){
			return -c(p * (pi/2)) + 1;
		},
		SineOut: function(p){
			return g(p * (pi/2));
		},
		SineInOut: function(p){
			return (-.5 * (c(pi*p) -1));
		},

		ExpoIn: function(p){
			return (p==0) ? 0 : k(2, 10 * (p - 1));
		},
		ExpoOut: function(p){
			return (p==1) ? 1 : -k(2, -10 * p) + 1;
		},
		ExpoInOut: function(p){
			if(p==0) return 0;
			if(p==1) return 1;
			if((p/=0.5) < 1) return 0.5 * k(2,10 * (p-1));
			return 0.5 * (-k(2, -10 * --p) + 2);
		},
		CircIn: function(p){
			return -(Math.sqrt(1 - (p*p)) - 1);
		},
		CircOut: function(p){
			return Math.sqrt(1 - k((p-1), 2))
		},
		CircInOut: function(p){
			if((p/=0.5) < 1) return -0.5 * (Math.sqrt(1 - p*p) - 1);
			return 0.5 * (Math.sqrt(1 - (p-=2)*p) + 1);
		},
		BackIn: function(p) {
			var s = 1.70158;
			return p*p*((s+1)*p - s);
		},
		BackOut: function(p) {
			var s = 1.70158;
			return (p-=1)*p*((s+1)*p + s) + 1;
		},
		BackInOut: function(p) {
			var s = 1.70158;
			return ((p/=0.5) < 1) ? 0.5*(p*p*(((s*=(1.525))+1)*p - s)) : 0.5*((p-=2)*p*(((s*=(1.525))+1)*p + s) + 2);
		},	
		BounceOut: function(p){
			if ((p) < (1/2.75)) {
				return (7.5625*p*p);
			} else if (p < (2/2.75)) {
				return (7.5625*(p-=(1.5/2.75))*p + .75);
			} else if (p < (2.5/2.75)) {
				return (7.5625*(p-=(2.25/2.75))*p + .9375);
			} else {
				return (7.5625*(p-=(2.625/2.75))*p + .984375);
			}
		},
		BouncePast: function(p) {
			if (p < (1/2.75)) {
				return (7.5625*p*p);
			} else if (p < (2/2.75)) {
				return 2 - (7.5625*(p-=(1.5/2.75))*p + .75);
			} else if (p < (2.5/2.75)) {
				return 2 - (7.5625*(p-=(2.25/2.75))*p + .9375);
			} else {
				return 2 - (7.5625*(p-=(2.625/2.75))*p + .984375);
			}
		},
		FromTo: function(p) {
			if ((p/=0.5) < 1) return 0.5*k(p,4);
			return -0.5 * ((p-=2)*k(p,3) - 2);
		},
		From: function(p) {
			return k(p,4);
		},
		To: function(p) {
			return k(p,0.25);
		},
		Linear:  function(p) {
			return p
		},
		Sinusoidal: function(p) {
			return (-c(p*pi)/2) + 0.5;
		},
		Reverse: function(p) {
			return 1 - p;
		},
		Mirror: function(p, ts) {
			ts = ts || Ease.Sinusoidal;
			if(p<0.5)
				return ts(p*2);
			else
				return ts(1-(p-0.5)*2);
		},
		Flicker: function(p) {
			var p = p + (Math.random()-0.5)/5;
			return Ease.Sinusoidal(p < 0 ? 0 : p > 1 ? 1 : p);
		},
		Wobble: function(p) {
			return (-c(p*pi*(9*p))/2) + 0.5;
		},
		Pulse: function(p, pulses) {
			return (-c((p*((pulses||5)-.5)*2)*pi)/2) + .5;
		},
		Blink: function(p, blinks) {
			return Math.round(p*(blinks||5)) % 2;
		},
		Spring: function(p) {
			return 1 - (c(p * 4.5 * pi) * Math.exp(-p * 6));
		},
		Elastic: function(p) {
			return -1 * k(4,-8*p) * g((p*6-1)*(2*pi)/2) + 1;
		},	
		None: function(p){
			return 0
		},
		Full: function(p){
			return 1
		}
	}
})();



	
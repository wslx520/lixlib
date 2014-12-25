//取自淘宝kissy.js
var kissy = function (){
	var r = Math,
	s = r.PI,
	k = r.pow,
	g = r.sin,
	l = 1.70158;
	return {
		easeNone : function (p) {
			return p
		},
		easeIn : function (p) {
			return p * p
		},
		easeOut : function (p) {
			return (2 - p) * p
		},
		easeBoth : function (p) {
			return (p *= 2) < 1 ? 0.5 * p * p : 0.5 * (1 - --p * (p - 2))
		},
		easeInStrong : function (p) {
			return p * p * p * p
		},
		easeOutStrong : function (p) {
			return 1 - --p * p * p * p
		},
		easeBothStrong : function (p) {
			return (p *= 2) < 1 ? 0.5 * p * p * p * p : 0.5 * (2 - (p -= 2) * p * p * p)
		},
		elasticIn : function (p) {
			if (p === 0 || p === 1)
				return p;
			return  - (k(2, 10 * (p -= 1)) * g((p - 0.075) * 2 * s / 0.3))
		},
		elasticOut : function (p) {
			if (p === 0 || p === 1)
				return p;
			return k(2, -10 * p) * g((p - 0.075) * 2 * s / 0.3) + 1
		},
		elasticBoth : function (p) {
			if (p === 0 || (p *= 2) === 2)
				return p;
			if (p < 1)
				return -0.5 * k(2, 10 * (p -= 1)) * g((p - 0.1125) * 2 * s / 0.45);
			return k(2, -10 * (p -= 1)) * g((p - 0.1125) * 2 * s / 0.45) * 0.5 + 1
		},
		backIn : function (p) {
			if (p === 1)
				p -= 0.0010;
			return p * p * ((l + 1) * p - l)
		},
		backOut : function (p) {
			return (p -= 1) * p * ((l + 1) * p + l) + 1
		},
		backBoth : function (p) {
			if ((p *= 2) < 1)
				return 0.5 * p * p * (((l *= 1.525) + 1) * p - l);
			return 0.5 * ((p -= 2) * p * (((l *= 1.525) + 1) * p + l) + 2)
		},
		bounceIn : function (p) {
			return 1 -
			h.bounceOut(1 - p)
		},
		bounceOut : function (p) {
			return p < 1 / 2.75 ? 7.5625 * p * p : p < 2 / 2.75 ? 7.5625 * (p -= 1.5 / 2.75) * p + 0.75 : p < 2.5 / 2.75 ? 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375 : 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375
		},
		bounceBoth : function (p) {
			if (p < 0.5)
				return h.bounceIn(p * 2) * 0.5;
			return h.bounceOut(p * 2 - 1) * 0.5 + 0.5
		}
	}
}();

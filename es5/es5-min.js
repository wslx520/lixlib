!function(c){if(!Object.keys){Object.keys=function(e){var d=[];for(var f in e){d.push(f)}return d}}if(!Object.values){Object.values=function(e){var d=[];for(var f in e){d.push(e[f])}return d}}if(typeof Object.create!="function"){Object.create=(function(){var d=function(){};return function(f){if(typeof f!="object"){throw TypeError("Argument must be an object")}d.prototype=f;var e=new d();d.prototype=null;return e}})()}var b={indexOf:function(g,d){var f=d==c?0:(d<0?Math.max(0,arr.length+d):d),e=this.length;for(;f<e;f++){if(this[f]===g){return f}}return -1},lastIndexOf:function(g,e){var d=this.length,f;if(e==c){f=d}else{if(e+1>d){f=Math.min(d,e+1)}if(e<0){f=Math.max(0,d+e+1)}}for(;f--;){if(this[f]===g){return f}}return -1},every:function(e,f){for(var d=this.length;d--;){if(false===e.call(f,this[d],d,this)){return false}}return true},some:function(e,f){for(var d=this.length;d--;){if(true===e.call(f,this[d],d,this)){return true}}return false},filter:function(g,j){for(var f=-1,d=this.length,e=[];f++<d;){var h=this[f];if(true===g.call(j,h,f,this)){e.push(h)}}return e},map:function(g,h){var d=this.length,f=[];for(var e=0,d=this.length;e<d;e++){f[e]=g.call(h,this[e],e,this)}return f},forEach:function(f,g){for(var e=0,d=this.length;e<d;e++){f.call(g,this[e],e,this)}},reduce:function(i,d){var f=d===c,h=f?this[0]:d,e=f?1:0,g=this.length;if(typeof i==="function"){for(e;e<g;e++){this.hasOwnProperty(e)&&(h=i(h,this[e],e,this))}}return h},reduceRight:function(i,d){var f=d===c,h=this.length,g=f?this[h-1]:d,e=f?h-2:h-1;var h=this.length,e=h-1,g=d;if(typeof i==="function"){for(e;e>-1;e-=1){this.hasOwnProperty(e)&&(g=i(g,this[e],e,this))}}return g}};for(var a in b){if(!Array.prototype[a]){Array.prototype[a]=b[a]}}this.JSON={parse:function(d){return(new Function("return ("+d+")"))()},stringify:(function(){function d(f){return'"'+f.replace(/["\\\x00-\x1f]/g,function(g){return{"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"}[g]||("\\u00"+Math.floor(g.charCodeAt()/16).toString(16)+(g.charCodeAt()%16).toString(16))})+'"'}function e(j){for(var h=0,g=[],f=j.length;h<f;h++){g.push(JSON.stringify(j[h]))}return"["+g.join(",")+"]"}return function(i){var h=typeof i,f=[];if(i===null||i===c||h==="function"){return"null"}if(h==="number"){return isFinite(i)?String(i):"null"}if(h==="boolean"){return String(i)}if(h==="string"){return d(i)}if(i instanceof Array){return e(i)}for(var g in i){if(i.hasOwnProperty(g)){f.push(d(g)+":"+JSON.stringify(i[g]))}}return"{"+f.join(",")+"}"}}())};Date.now=Date.now||function(){return new Date().getTime()}}();

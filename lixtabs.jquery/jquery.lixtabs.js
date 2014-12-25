/* 
	我写的第一个jQuery插件
	jQuery插件:jQuery.lixtabs.js
	版本:0.5
	作用:制作简单的多个的tabs选项卡切换效果
	作者:十年灯 http://www.jo2.org/ 
	说明:欢迎使用,欢迎转载,但请勿据为已有
	jQuery的链式调用真妙
 */	
(function($){
$.fn.Xtabs = function(options){
	var defaults ={
		hdcn:'hdcn',
		hdtagcur:'cur',
		bdcn:'bdcn',
		bdtagcur:'cur',
		event:'mouseover',
		how:'fadeIn',
		auto:null,
		delay:300
	}
	
	var Bind = function(object, fun) {
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function() {
			return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		}
	}
	return this.each(function(){
		var opts = $.extend(defaults,options),
			root = $(this);
		//console.log(root);	
		root.hdcn = root.find('.'+opts.hdcn);
		root.bdcn = root.find('.'+opts.bdcn);
		var tabtag = root.hdcn.children(),
			bdtag = root.bdcn.children();
		root.auto = opts.auto;
		root.length = tabtag.length;
		//console.log(bdtag[0]);
		root.numb = 0;
		
		root.Go = function(n){
			clearTimeout(root.timer);
			var n = (n != undefined) ? n : (root.numb+1);
			//console.log(n);
			if(n >= root.length) {
				n=0;
			}else if(n<0){
				n = root.length-1;
			}
			tabtag.removeClass(opts.hdtagcur).eq(n).addClass(opts.hdtagcur);
			bdtag.hide().eq(n).addClass(opts.bdtagcur)[opts.how]();
			root.auto && (root.timer = setTimeout(Bind(this,root.Go,++n),root.auto));
			root.numb = n;
		}
		root.run = null;
		tabtag.each(function(){
			$(this).bind(
				opts.event,
				function(){
					clearTimeout(root.timer);
					root.auto = 0;
					var i = tabtag.index($(this));
					root.run = setTimeout(Bind(root,root.Go,i),opts.delay);
				}
			);
			$(this).bind(
				'mouseout',
				function(){
					clearTimeout(root.run);
					root.auto = opts.auto;
					var i = tabtag.index($(this));
					root.auto && (root.timer = setTimeout(Bind(root,root.Go,++i),root.auto));
				}
			)
		});
		$(this).bind(
			'mouseover',
			function(){
				root.auto = 0;
				clearTimeout(root.timer);
			}
		);
		$(this).bind('mouseout',function(){
			root.auto = opts.auto;
			root.auto && root.Go(root.numb);
		});
		root.auto && (root.timer = setTimeout(Bind(this,root.Go,1),root.auto));
	});
	
}

})(jQuery);	
	
	
	
	
	
FormSet lixlib
===
方便的操作表单元素

使用方法:

	var fs = new FormSet(form);

然后就可以:

	fs.set('a','aaa');

这样就会把表单中name或id等于a的元素(无论是什么元素)的值设为aaa,如果对应的元素是select,则会选中value=aaa的那一项

如果要让名叫a的select选中多个项,则fs.set('a',['aaa','bbb']);

如果有4个多选框,需要选中其中value=1或2的项,则:

	fs.set('a',[1,2]);


批量设置:

	fs.set({
		a:[2,3], //复选框值必须用数组，哪怕只有一个
		radio:2,
		text_j:'你变了',
		text1:'this is text1',
		r:{value:'rr',disabled:true}, //设置值同时禁用掉元素
		text:'textttttt',
		textarea:'skldjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj',
		select:2,
		select1:[22,44],
		hidden:'You can\'t see me!'
	})


得到某组元素的值(这个值是指:text的值,或select选中项,或checkbox选中项)

	fs.get('a');

批量取值:

	fs.get(['radio','select1','r','text1'])

取出全部值:

	fs.get();

序列化表单值:

	fs.serialise()

对表单内所有字段做操作

	fs.each(function(elem,elem.name,elem.tagName,elem.type){
		...
	})


更新记录
2015/7/25:
加入新功能:
传入的元素可以不是个form,可以是DIV或其他.适合于有很多表单元素却没有表单的情况.
如果不是form,效率会变低,更甚的是,IE8下是用纯循环得到表单元素集,效率会进一步降低,
修复bug:
ie8下会把null值赋给input框,已修复

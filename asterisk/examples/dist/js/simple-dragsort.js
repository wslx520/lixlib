/**
    简单的拖动排序
**/
$.fn.dragsort = function(options) {
    var container = this;

    $(container).children().off("mousedown").mousedown(function(e) {

        if (e.which != 1 || $(e.target).is("input, textarea") || $(e.target).closest(".remove").length // 排除 删除按钮
            || window.kp_only) return; // 排除非左击和表单元素
        e.preventDefault(); // 阻止选中文本

        var x = e.pageX;
        var y = e.pageY;
        var _this = $(this); // 点击选中块
        var w = _this.width();
        var h = _this.height();
        var half_w = w / 2;
        var half_h = h / 2;
        // var p = _this.offset();
        var left = this.offsetLeft;
        var top = this.offsetTop;
        // 是否开始移动
        var moving = false;
        window.kp_only = true;
        // 添加虚线框
        _this.before('<div id="dragsort-holder" class="dragsort-holder"></div>');
        var wid = $("#dragsort-holder");
        // wid.css({ "height": h });

        // 保持原来的宽高
        _this.addClass('dragging').css({ "left": left, "top": top });
        // var ind = 0, run = 0;
        var currentTime = new Date().getTime();
        // 绑定mousemove事件
        $(document).mousemove(function(e) {
            // console.log(ind+=1);
            e.preventDefault();
            var now = new Date().getTime();
            // 简单的节流
            if (now - currentTime < 20) return;
            currentTime = now;
            // console.log(run+=1);
            // 如果移动开始了，且元素含A标签，则先阻止A标签的默认行为
            if (!moving && _this.find('a').length) {
                _this.find('a').on('click', function(e) {
                    e.preventDefault();
                });
            }
            moving = true;

            // console.log('m');
            // 移动选中块
            var l = left + e.pageX - x;
            var t = top + e.pageY - y;
            _this.css({ "left": l, "top": t });

            // 选中块的中心坐标
            var ml = l + half_w;
            var mt = t + half_h;

            // 遍历所有块的坐标
            var children = $(container).children().not(_this).not(wid);
            for (var c = 0, cl = children.length; c < cl; c++) {
                var child = children[c];
                var obj = $(child);
                var p = { left: child.offsetLeft, top: child.offsetTop };
                // jquery 的 offset 与原生的 offsetTop, offsetLeft 不是一回事
                // var p = obj.offset();
                var a1 = p.left;
                var a2 = p.left + obj.width();
                var a3 = p.top;
                var a4 = p.top + obj.height();

                // 移动虚线框
                if (a1 < ml && ml < a2 && a3 < mt && mt < a4) {
                    // console.log(c, 'move it', child);
                    if (!obj.next("#dragsort-holder").length) {
                        wid.insertAfter(child);
                    } else {
                        wid.insertBefore(child);
                    }
                    // break , 节省计算
                    break;
                }
            }

        });

        // 绑定mouseup事件
        $(document).mouseup(function() {
            $(document).off('mouseup').off('mousemove');

            // 检查容器为空的情况
            $(container).each(function() {
                var obj = $(this).children();
                var len = obj.length;
                if (len == 1 && obj.is(_this)) {
                    $("<div></div>").appendTo(this).attr("class", "kp_widget_block").css({ "height": 100 });
                } else if (len == 2 && obj.is(".kp_widget_block")) {
                    $(this).children(".kp_widget_block").remove();
                }
            });

            // 拖拽回位，并删除虚线框
            var p = wid.offset();
            // _this.animate({"left":p.left, "top":p.top}, 100, function() {
            _this.animate({ "left": wid[0].offsetLeft, "top": wid[0].offsetTop }, 100, function() {
                _this.removeAttr("style").removeClass('dragging');
                wid.replaceWith(_this);
                window.kp_only = null;
            });
            // 如果有移动过，则移除对A标签默认行为的阻止(延迟移除)
            if (moving) {
                setTimeout(function() {
                    if (_this.find('a').length) {
                        _this.find('a').off('click');
                    }
                }, 100);
            }

        });
    });
};

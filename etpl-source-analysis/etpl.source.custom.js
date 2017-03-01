/**
 * ETPL (Enterprise Template)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 模板引擎
 * @author errorrik(errorrik@gmail.com)
 *         otakustay(otakustay@gmail.com)
 */


// HACK: 可见的重复代码未抽取成function和var是为了gzip size，吐槽的一边去
/* eslint-env node */

(function (root) {
    /**
     * 对象属性拷贝
     *
     * @inner
     * @param {Object} target 目标对象
     * @param {Object} source 源对象
     * @return {Object} 返回目标对象
     */
    function extend(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

    /**
     * 随手写了个栈
     *
     * @inner
     * @constructor
     */
    function Stack() {
        this.raw = [];
        this.length = 0;
    }

    Stack.prototype = {
        /**
         * 添加元素进栈
         *
         * @param {*} elem 添加项
         */
        push: function (elem) {
            this.raw[this.length++] = elem;
        },

        /**
         * 弹出顶部元素
         *
         * @return {*} 顶部元素
         */
        pop: function () {
            if (this.length > 0) {
                var elem = this.raw[--this.length];
                this.raw.length = this.length;
                return elem;
            }
        },

        /**
         * 获取顶部元素
         *
         * @return {*} 顶部元素
         */
        top: function () {
            return this.raw[this.length - 1];
        },

        /**
         * 获取底部元素
         *
         * @return {*} 底部元素
         */
        bottom: function () {
            return this.raw[0];
        },

        /**
         * 根据查询条件获取元素
         *
         * @param {Function} condition 查询函数
         * @return {*} 符合条件的元素
         */
        find: function (condition) {
            var index = this.length;
            while (index--) {
                var item = this.raw[index];
                if (condition(item)) {
                    return item;
                }
            }
        }
    };

    /**
     * 唯一id的起始值
     *
     * @inner
     * @type {number}
     */
    var guidIndex = 0x2B845;

    /**
     * 获取唯一id，用于匿名target或编译代码的变量名生成
     *
     * @inner
     * @return {string} 唯一id
     */
    function generateGUID() {
        return '___' + (guidIndex++);
    }

    /**
     * 构建类之间的继承关系
     *
     * @inner
     * @param {Function} subClass 子类函数
     * @param {Function} superClass 父类函数
     */
    function inherits(subClass, superClass) {
        /* jshint -W054 */
        var F = new Function();
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        /* jshint +W054 */
        // 由于引擎内部的使用场景都是inherits后，逐个编写子类的prototype方法
        // 所以，不考虑将原有子类prototype缓存再逐个拷贝回去
    }

    /**
     * HTML Filter替换的字符实体表
     *
     * @const
     * @inner
     * @type {Object}
     */
    var HTML_ENTITY = {
        /* jshint ignore:start */
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        /* eslint-disable quotes */
        "'": '&#39;'
        /* eslint-enable quotes */
        /* jshint ignore:end */
    };

    /**
     * HTML Filter的替换函数
     *
     * @inner
     * @param {string} c 替换字符
     * @return {string} 替换后的HTML字符实体
     */
    function htmlFilterReplacer(c) {
        return HTML_ENTITY[c];
    }

    /**
     * 默认filter
     *
     * @inner
     * @const
     * @type {Object}
     */
    var DEFAULT_FILTERS = {
        /**
         * HTML转义filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        html: function (source) {
            return source.replace(/[&<>"']/g, htmlFilterReplacer);
        },

        /**
         * URL编码filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        url: encodeURIComponent,

        /**
         * 源串filter，用于在默认开启HTML转义时获取源串，不进行转义
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        raw: function (source) {
            return source;
        }
    };

    /**
     * 字符串字面化
     *
     * @inner
     * @param {string} source 需要字面化的字符串
     * @return {string} 字符串字面化结果
     */
    function stringLiteralize(source) {
        return '"'
            + source
                .replace(/\x5C/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\x0A/g, '\\n')
                .replace(/\x09/g, '\\t')
                .replace(/\x0D/g, '\\r')
                // .replace( /\x08/g, '\\b' )
                // .replace( /\x0C/g, '\\f' )
            + '"';
    }

    /**
     * 对字符串进行可用于new RegExp的字面化
     *
     * @inner
     * @param {string} source 需要字面化的字符串
     * @return {string} 字符串字面化结果
     */
    function regexpLiteral(source) {
        return source.replace(/[\^\[\]\$\(\)\{\}\?\*\.\+]/g, function (c) {
            return '\\' + c;
        });
    }

    /**
     * 字符串格式化
     *
     * @inner
     * @param {string} source 目标模版字符串
     * @param {...string} replacements 字符串替换项集合
     * @return {string} 格式化结果
     */
    function stringFormat(source) {
        var args = arguments;
        return source.replace(
            /\{([0-9]+)\}/g,
            function (match, index) {
                return args[index - 0 + 1];
            });
    }

    /**
     * 用于render的字符串变量声明语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_DECLATION = 'var r="";';

    /**
     * 用于render的字符串内容添加语句（起始）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_START = 'r+=';

    /**
     * 用于render的字符串内容添加语句（结束）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_END = ';';

    /**
     * 用于render的字符串内容返回语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_RETURN = 'return r;';

    // HACK: IE8-时，编译后的renderer使用join Array的策略进行字符串拼接
    var ieVersionMatch = typeof navigator !== 'undefined' 
        && navigator.userAgent.match(/msie\s*([0-9]+)/i);

    if (ieVersionMatch && ieVersionMatch[1] - 0 < 8) {
        RENDER_STRING_DECLATION = 'var r=[],ri=0;';
        RENDER_STRING_ADD_START = 'r[ri++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }

    /**
     * 将访问变量名称转换成getVariable调用的编译语句
     * 用于if、var等命令生成编译代码
     *
     * @inner
     * @param {string} name 访问变量名
     * @return {string} getVariable调用的编译语句
     */
    function toGetVariableLiteral(name) {
        name = name.replace(/^\s*\*/, '');
        return stringFormat(
            'gv({0},["{1}"])',
            stringLiteralize(name),
            name.replace(
                    /\[['"]?([^'"]+)['"]?\]/g,
                    function (match, name) {
                        return '.' + name;
                    }
                )
                .split('.')
                .join('","')
        );
    }

    /**
     * 解析文本片段中以固定字符串开头和结尾的包含块
     * 用于 命令串：<!-- ... --> 和 变量替换串：${...} 的解析
     *
     * @inner
     * @param {string} source 要解析的文本
     * @param {string} open 包含块开头
     * @param {string} close 包含块结束
     * @param {boolean} greedy 是否贪婪匹配
     * @param {function({string})} onInBlock 包含块内文本的处理函数
     * @param {function({string})} onOutBlock 非包含块内文本的处理函数
     */
    function parseTextBlock(source, open, close, greedy, onInBlock, onOutBlock) {
        // 获得结尾块的 length
        var closeLen = close.length;
        // 将源字符串以 open 字符串拆分
        var texts = source.split(open);
        // 定义一个变量，保留循环过程中的信息
        var level = 0;
        // 存放最终结果的数组
        var buf = [];
        // texts 是按 open 拆分，所以 texts[0] 绝对
        for (var i = 0, len = texts.length; i < len; i++) {
            var text = texts[i];
            // i = 0 时，不会进入本段，本段代码起码会在 i = 1 才执行
            if (i) {
                var openBegin = 1;
                // 将 level + 1
                level++;
                /* eslint-disable no-constant-condition */
                // 一个不主动 break 就会死循环的 while
                while (1) {
                    // 在本文本段中，查找 close 字符串
                    var closeIndex = text.indexOf(close);
                    // 如果没有找到
                    if (closeIndex < 0) {
                        // 判断 level 与 openBegin
                        // 如果 text 中本就没有 close，则在第一次循环中就会 break
                        // 此时level > 1且 openBegin 为真
                        // 就会将 open 和 本 text 添加到结果数组中
                        // 顺便一提，push 方法支持同时 push 几个元素的
                        // 注：这里可能会 push 一个空串，整个模板编译下来，肯定会产生很多空串
                        // 这里为了省代码才写成这样的。但为了节省push不必要的空串，应该这样写
                        // ===> if (level > 1 && openBegin) buf.push(open);
                        // ===> buf.push(text);
                        buf.push(level > 1 && openBegin ? open : '', text);
                        // 跳出 while
                        break;
                    }
                    // 以下代码只会在 text 中查找到了 close 时执行
                    // 如果是 贪婪模式，则将 level - 1；否则，level就被置 0
                    level = greedy ? level - 1 : 0;
                    // 往结果数组中 push 字符串
                    // 以下 push 也可以拆成 3 个
                    buf.push(
                        // 需要 level 不是0，且有 openBegin，就 push open串，否则 push 空串
                        level > 0 && openBegin ? open : '',
                        // 将 text 在 closeIndex 前的半段 push 到结果集
                        text.slice(0, closeIndex),
                        // 如果有 level，则 push close 段
                        level > 0 ? close : ''
                    );
                    // 将 text 切割掉，供 下个迭代(或 for 的下一次迭代)使用
                    // 切割后的 text，就只有原 text 刨除 close之前的串剩下的一部分了
                    // 如：/for --></ul>，close === --> ，则切割后 text = </ul>
                    // 这剩下的一段，会交给 onOutBlock 执行
                    text = text.slice(closeIndex + closeLen);
                    // 只要 while 执行过一次，则 openBegin就会变成 0，将会参与前面的判断
                    openBegin = 0;
                    // 如果 level = 0，则跳出 while
                    // 也就是说，如果 text 中有close段，且不是 贪婪模式，则 while 只会执行一个迭代
                    if (level === 0) {
                        break;
                    }
                }
                /* eslint-enable no-constant-condition */
                // 如果是 非贪婪模式，则 执行 onInBlock ，onOutBlock，并清空 buf
                if (level === 0) {
                    onInBlock(buf.join(''));
                    onOutBlock(text);
                    buf = [];
                }
            }
            // i = 0 时，执行（即 for 循环的第一次迭代，永远只会执行这里）
            else {
                // 对源码拆分后的的第一段，执行 onOutBlock
                text && onOutBlock(text);
            }
        }
        // 如果 经过前面的 for 循环处理后， level > 0且 buf 还没被清空
        if (level > 0 && buf.length > 0) {
            onOutBlock(open);
            onOutBlock(buf.join(''));
        }
    }

    /**
     * 编译变量访问和变量替换的代码
     * 用于普通文本或if、var、filter等命令生成编译代码
     *
     * @inner
     * @param {string} source 源代码
     * @param {Engine} engine 引擎实例
     * @param {boolean} forText 是否为输出文本的变量替换
     * @return {string} 编译代码
     */
    function compileVariable(source, engine, forText) {
        var code = [];
        var options = engine.options;

        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';

        // 默认的filter，当forText模式时有效
        var defaultFilter;

        if (forText) {
            // ts = toString
            toStringHead = 'ts(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = options.defaultFilter;
        }

        parseTextBlock(
            source, options.variableOpen, options.variableClose, 1,
            // 此函数 即 onInBlock ，其参数 text 即 for 循环中的 buf
            function (text) {

                // 加入默认filter
                // 只有当处理forText时，需要加入默认filter
                // 处理if/var/use等command时，不需要加入默认filter
                if (forText && text.indexOf('|') < 0 && defaultFilter) {
                    text += '|' + defaultFilter;
                }

                // variableCode是一个gv调用，然后通过循环，在外面包filter的调用
                // 形成filter["b"](filter["a"](gv(...)))
                //
                // 当forText模式，处理的是文本中的变量替换时
                // 传递给filter的需要是字符串形式，所以gv外需要包一层ts调用
                // 形成filter["b"](filter["a"](ts(gv(...))))
                //
                // 当variableName以*起始时，忽略ts调用，直接传递原值给filter
                var filterCharIndex = text.indexOf('|');
                var variableName = (
                    // 如果 有 filter 符号（|）
                        filterCharIndex > 0
                    // 则取 | 之前的 串
                        ? text.slice(0, filterCharIndex)
                        : text
                    ).replace(/^\s+/, '').replace(/\s+$/, '');
                // 如果 有 |，取出 | 后的串
                var filterSource = filterCharIndex > 0
                    ? text.slice(filterCharIndex + 1)
                    : '';
                // 如果 变量的第一个字符是 *
                var variableRawValue = variableName.indexOf('*') === 0;
                var variableCode = [
                // 如果没有 *，则需要在变量头尾 包裹 toString（即 ts()）
                    variableRawValue ? '' : toStringHead,
                    toGetVariableLiteral(variableName),
                    variableRawValue ? '' : toStringFoot
                ];
                // 如果有 filter 串
                if (filterSource) {
                    filterSource = compileVariable(filterSource, engine);
                    var filterSegs = filterSource.split('|');
                    for (var i = 0, len = filterSegs.length; i < len; i++) {
                        var seg = filterSegs[i];
                        var segMatch = seg.match(/^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i);
                        if (segMatch) {
                            // 往 数组 最前面加入 fs
                            variableCode.unshift('fs["' + segMatch[1] + '"](');

                            if (segMatch[3]) {
                                variableCode.push(',', segMatch[3]);
                            }

                            variableCode.push(')');
                        }
                    }
                }

                code.push(
                    wrapHead,
                    variableCode.join(''),
                    wrapFoot
                );
            },
            // onOutBlock
            function (text) {
                code.push(
                    wrapHead,
                    forText ? stringLiteralize(text) : text,
                    wrapFoot
                );
            }
        );

        return code.join('');
    }

    /**
     * 文本节点类
     *
     * @inner
     * @constructor
     * @param {string} value 文本节点的内容文本
     * @param {Engine} engine 引擎实例
     */
    function TextNode(value, engine) {
        this.value = value;
        this.engine = engine;
    }

    TextNode.prototype = {
        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            var value = this.value;
            var options = this.engine.options;

            if (!value
                || (options.strip && /^\s*$/.test(value))
            ) {
                return '';
            }

            return compileVariable(value, this.engine, 1);
        },

        /**
         * 复制节点的方法
         *
         * @return {TextNode} 节点复制对象
         */
        clone: function () {
            return this;
        }
    };

    /**
     * 命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function Command(value, engine) {
        this.value = value;
        this.engine = engine;
        this.children = [];
        this.cloneProps = [];
    }

    Command.prototype = {
        /**
         * 添加子节点
         *
         * @param {TextNode|Command} node 子节点
         */
        addChild: function (node) {
            this.children.push(node);
        },

        /**
         * 节点open，解析开始
         *
         * @param {Object} context 语法分析环境对象
         */
        open: function (context) {
            var parent = context.stack.top();
            parent && parent.addChild(this);
            context.stack.push(this);
        },

        /**
         * 节点闭合，解析结束
         *
         * @param {Object} context 语法分析环境对象
         */
        close: function (context) {
            if (context.stack.top() === this) {
                context.stack.pop();
            }
        },

        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            var buf = [];
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                buf.push(children[i].getRendererBody());
            }

            return buf.join('');
        },

        /**
         * 复制节点的方法
         *
         * @return {Command} 节点复制对象
         */
        clone: function () {
            // 自己的构造函数（其实就是 Command 类）
            var Clazz = this.constructor;
            var node = new Clazz(this.value, this.engine);

            /* eslint-disable no-redeclare */
            for (var i = 0, l = this.children.length; i < l; i++) {
                // 循环复制 子元素，并添加到自己的 child
                node.addChild(this.children[i].clone());
            }

            for (var i = 0, l = this.cloneProps.length; i < l; i++) {
                var prop = this.cloneProps[i];
                node[prop] = this[prop];
            }
            /* eslint-enable no-redeclare */

            return node;
        }
    };

    /**
     * 命令自动闭合
     *
     * @inner
     * @param {Object} context 语法分析环境对象
     * @param {Function=} CommandType 自闭合的节点类型
     * @return {Command} 被闭合的节点
     */
    function autoCloseCommand(context, CommandType) {
        var stack = context.stack;
        var closeEnd = CommandType
            ? stack.find(
                function (item) {
                    return item instanceof CommandType;
                }
            )
            : stack.bottom();

        if (closeEnd) {
            var node;

            while ((node = stack.top()) !== closeEnd) {
                /* jshint ignore:start */
                // 如果节点对象不包含autoClose方法
                // 则认为该节点不支持自动闭合，需要抛出错误
                // for等节点不支持自动闭合
                if (!node.autoClose) {
                    throw new Error(node.type + ' must be closed manually: ' + node.value);
                }
                /* jshint ignore:end */

                node.autoClose(context);
            }

            closeEnd.close(context);
        }

        return closeEnd;
    }

    /**
     * renderer body起始代码段
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDERER_BODY_START = ''
        + 'data=data||{};'
        + 'var v={},fs=engine.filters,hg=typeof data.get=="function",'
        + 'gv=function(n,ps){'
        +     'var p=ps[0],d=v[p];'
        +     'if(d==null){'
        +         'if(hg){return data.get(n);}'
        +         'd=data[p];'
        +     '}'
        +     'for(var i=1,l=ps.length;i<l;i++)if(d!=null)d = d[ps[i]];'
        +     'return d;'
        + '},'
        + 'ts=function(s){'
        +     'if(typeof s==="string"){return s;}'
        +     'if(s==null){s="";}'
        +     'return ""+s;'
        + '};';

    // v: variables
    // fs: filters
    // gv: getVariable
    // ts: toString
    // n: name
    // ps: properties
    // hg: hasGetter

    /**
     * Target命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function TargetCommand(value, engine) {
        /* jshint ignore:start */
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*(\(\s*master\s*=\s*([a-z0-9\/_-]+)\s*\))?\s*/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        /* jshint ignore:end */

        this.master = match[3];
        // 每个 target 都有 name
        this.name = match[1];
        Command.call(this, value, engine);

        this.blocks = {};
    }

    // 创建Target命令节点继承关系
    inherits(TargetCommand, Command);

    /**
     * Block命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function BlockCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = match[1];
        Command.call(this, value, engine);
        this.cloneProps = ['name'];
    }

    // 创建Block命令节点继承关系
    inherits(BlockCommand, Command);

    /**
     * Import命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ImportCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = match[1];
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'state', 'blocks', 'target'];
        this.blocks = {};
    }

    // 创建Import命令节点继承关系
    inherits(ImportCommand, Command);

    /**
     * Var命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function VarCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = match[1];
        this.expr = match[2];
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'expr'];
    }

    // 创建Var命令节点继承关系
    inherits(VarCommand, Command);

    /**
     * filter命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function FilterCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = match[1];
        this.args = match[3];
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建filter命令节点继承关系
    inherits(FilterCommand, Command);

    /**
     * Use命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function UseCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*(\(([\s\S]*)\))?\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = match[1];
        this.args = match[3];
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建Use命令节点继承关系
    inherits(UseCommand, Command);

    /**
     * for命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ForCommand(value, engine) {
        var rule = new RegExp(
            stringFormat(
                /* jshint ignore:start */
                '^\\s*({0}[\\s\\S]+{1})\\s+as\\s+{0}([0-9a-z_]+){1}\\s*(,\\s*{0}([0-9a-z_]+){1})?\\s*$',
                /* jshint ignore:end */
                regexpLiteral(engine.options.variableOpen),
                regexpLiteral(engine.options.variableClose)
            ),
            'i'
        );


        var match = value.match(rule);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.list = match[1];
        this.item = match[2];
        this.index = match[4];
        Command.call(this, value, engine);
        this.cloneProps = ['list', 'item', 'index'];
    }

    // 创建for命令节点继承关系
    inherits(ForCommand, Command);

    /**
     * if命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function IfCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建if命令节点继承关系
    inherits(IfCommand, Command);

    /**
     * elif命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElifCommand(value, engine) {
        IfCommand.call(this, value, engine);
    }

    // 创建elif命令节点继承关系
    inherits(ElifCommand, IfCommand);

    /**
     * else命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElseCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建else命令节点继承关系
    inherits(ElseCommand, IfCommand);

    /**
     * Target的节点状态
     *
     * @inner
     */
    var TargetState = {
        READING: 1,
        READED: 2,
        APPLIED: 3,
        READY: 4
    };

    /**
     * 应用其继承的母版，返回是否成功应用母版
     *
     * @return {boolean} 是否成功应用母版
     */
    ImportCommand.prototype.applyMaster =

    /**
     * 应用其继承的母版，返回是否成功应用母版
     *
     * @param {string} masterName 模板名称
     * @return {boolean} 是否成功应用母版
     */
    TargetCommand.prototype.applyMaster = function (masterName) {
        if (this.state >= TargetState.APPLIED) {
            return 1;
        }

        var blocks = this.blocks;

        function replaceBlock(node) {
            var children = node.children;

            if (children instanceof Array) {
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (child instanceof BlockCommand && blocks[child.name]) {
                        child = children[i] = blocks[child.name];
                    }

                    replaceBlock(child);
                }
            }
        }

        var master = this.engine.targets[masterName];
        if (master) {
            if (master.applyMaster(master.master)) {
                this.children = master.clone().children;
                replaceBlock(this);
                this.state = TargetState.APPLIED;
                return 1;
            }
        }
        else if (this.engine.options.missTarget === 'error') {
            throw new Error('[ETPL_MISS_TARGET]' + masterName 
                + ', when extended by ' 
                + (this.target ? this.target.name : this.name)
            );
        }
    };

    /**
     * 判断target是否ready
     * 包括是否成功应用母版，以及import语句依赖的target是否ready
     *
     * @return {boolean} target是否ready
     */
    TargetCommand.prototype.isReady = function () {
        if (this.state >= TargetState.READY) {
            return 1;
        }

        var engine = this.engine;
        var targetName = this.name;
        var readyState = 1;

        /**
         * 递归检查节点的ready状态
         *
         * @inner
         * @param {Command|TextNode} node 目标节点
         */
        function checkReadyState(node) {
            for (var i = 0, len = node.children.length; i < len; i++) {
                var child = node.children[i];

                if (child instanceof ImportCommand) {
                    var target = engine.targets[child.name];
                    if (!target && engine.options.missTarget === 'error') {
                        throw new Error('[ETPL_MISS_TARGET]' + child.name 
                            + ', when imported by ' + targetName);
                    }

                    readyState = readyState && target && target.isReady(engine);
                }
                else if (child instanceof Command) {
                    checkReadyState(child);
                }
            }
        }

        if (this.applyMaster(this.master)) {
            checkReadyState(this);
            readyState && (this.state = TargetState.READY);
            return readyState;
        }
    };

    /**
     * 获取target的renderer函数
     *
     * @return {function(Object):string} renderer函数
     */
    TargetCommand.prototype.getRenderer = function () {
        if (this.renderer) {
            return this.renderer;
        }

        if (this.isReady()) {
            // console.log(this.name + ' ------------------');
            console.log(RENDERER_BODY_START + RENDER_STRING_DECLATION
                + this.getRendererBody()
                + RENDER_STRING_RETURN);

            /* jshint -W054 */
            var realRenderer = new Function(
                'data', 'engine',
                [
                    RENDERER_BODY_START,
                    RENDER_STRING_DECLATION,
                    this.getRendererBody(),
                    RENDER_STRING_RETURN
                ].join('\n')
            );
            /* jshint +W054 */

            var engine = this.engine;
            this.renderer = function (data) {
                return realRenderer(data, engine);
            };

            return this.renderer;
        }

        return null;
    };

    /**
     * 将target节点对象添加到语法分析环境中
     *
     * @inner
     * @param {TargetCommand} target target节点对象
     * @param {Object} context 语法分析环境对象
     */
    function addTargetToContext(target, context) {
        context.target = target;

        var engine = context.engine;
        var name = target.name;

        if (engine.targets[name]) {
            switch (engine.options.namingConflict) {
                /* jshint ignore:start */
                case 'override':
                    engine.targets[name] = target;
                    context.targets.push(name);
                case 'ignore':
                    break;
                /* jshint ignore:end */
                default:
                    throw new Error('[ETPL_TARGET_EXISTS]' + name);
            }
        }
        else {
            // 将 target 添加到 engine 的 targets 列表中
            engine.targets[name] = target;
            // 将 target 的 name 添加到 context.targets 列表中
            context.targets.push(name);
        }
    }

    /**
     * target节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.open = function (context) {
        autoCloseCommand(context);
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        addTargetToContext(this, context);
    };

    /**
     * Var节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.open =

    /**
     * Use节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.open = function (context) {
        context.stack.top().addChild(this);
    };

    /**
     * Block节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    BlockCommand.prototype.open = function (context) {
        Command.prototype.open.call(this, context);
        context.stack
            .find(function (node) {
                return node.blocks;
            })
            .blocks[this.name] = this;
    };

    /**
     * elif节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ElifCommand.prototype.open = function (context) {
        var elseCommand = new ElseCommand();
        elseCommand.open(context);

        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * else节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ElseCommand.prototype.open = function (context) {
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * import节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.open = function (context) {
        this.parent = context.stack.top();
        this.target = context.target;
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
    };

    /**
     * 节点解析结束
     * 由于use节点无需闭合，处理时不会入栈，所以将close置为空函数
     *
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.close =

    /**
     * 节点解析结束
     * 由于var节点无需闭合，处理时不会入栈，所以将close置为空函数
     *
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.close = function () {};

    /**
     * 节点解析结束
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = TargetState.READED;
    };

    /**
     * 节点闭合，解析结束
     *
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = this.master ? TargetState.READED : TargetState.APPLIED;
        context.target = null;
    };

    /**
     * 节点自动闭合，解析结束
     * ImportCommand的自动结束逻辑为，在其开始位置后马上结束
     * 所以，其自动结束时children应赋予其所属的parent
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.autoClose = function (context) {
        // move children to parent
        var parentChildren = this.parent.children;
        parentChildren.push.apply(parentChildren, this.children);
        this.children.length = 0;

        // move blocks to target
        /* eslint-disable guard-for-in */
        for (var key in this.blocks) {
            this.target.blocks[key] = this.blocks[key];
        }
        /* eslint-enable guard-for-in */
        this.blocks = {};

        // do close
        this.close(context);
    };

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    ForCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    FilterCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    BlockCommand.prototype.beforeOpen =

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    IfCommand.prototype.beforeOpen =

    /**
     * 文本节点被添加到分析环境前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    TextNode.prototype.beforeAdd = function (context) {
        // 这个取出来，要么为空，要么是一个 target 命令; 如果已有，则直接返回
        if (context.stack.bottom()) {
            return;
        }
        // 如果为空，则会新增一个 target 并设为 开启状态

        var target = new TargetCommand(generateGUID(), context.engine);
        target.open(context);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ImportCommand.prototype.getRendererBody = function () {
        this.applyMaster(this.name);
        return Command.prototype.getRendererBody.call(this);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    UseCommand.prototype.getRendererBody = function () {
        return stringFormat(
            '{0}engine.render({2},{{3}}){1}',
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            stringLiteralize(this.name),
            compileVariable(this.args, this.engine).replace(
                /(^|,)\s*([a-z0-9_]+)\s*=/ig,
                function (match, start, argName) {
                    return (start || '') + stringLiteralize(argName) + ':';
                }
            )
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    VarCommand.prototype.getRendererBody = function () {
        if (this.expr) {
            return stringFormat(
                'v[{0}]={1};',
                stringLiteralize(this.name),
                compileVariable(this.expr, this.engine)
            );
        }

        return '';
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    IfCommand.prototype.getRendererBody = function () {
        return stringFormat(
            'if({0}){{1}}',
            compileVariable(this.value, this.engine),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ElseCommand.prototype.getRendererBody = function () {
        return stringFormat(
            '}else{{0}',
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ForCommand.prototype.getRendererBody = function () {
        return stringFormat(
            /* jshint ignore:start */
            ''
            + 'var {0}={1};'
            + 'if({0} instanceof Array)'
            +     'for (var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}'
            + 'else if(typeof {0}==="object")'
            +     'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}',
            /* jshint ignore:end */
            generateGUID(),
            compileVariable(this.list, this.engine),
            stringLiteralize(this.index || generateGUID()),
            stringLiteralize(this.item),
            generateGUID(),
            generateGUID(),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return stringFormat(
            '{2}fs[{5}]((function(){{0}{4}{1}})(){6}){3}',
            RENDER_STRING_DECLATION,
            RENDER_STRING_RETURN,
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            Command.prototype.getRendererBody.call(this),
            stringLiteralize(this.name),
            args ? ',' + compileVariable(args, this.engine) : ''
        );
    };

    /**
     * 命令类型集合
     *
     * @type {Object}
     */
    var commandTypes = {};

    /**
     * 添加命令类型
     *
     * @inner
     * @param {string} name 命令名称
     * @param {Function} Type 处理命令用到的类
     */
    function addCommandType(name, Type) {
        commandTypes[name] = Type;
        Type.prototype.type = name;
    }

    addCommandType('target', TargetCommand);
    addCommandType('block', BlockCommand);
    addCommandType('import', ImportCommand);
    addCommandType('use', UseCommand);
    addCommandType('var', VarCommand);
    addCommandType('for', ForCommand);
    addCommandType('if', IfCommand);
    addCommandType('elif', ElifCommand);
    addCommandType('else', ElseCommand);
    addCommandType('filter', FilterCommand);


    /**
     * etpl引擎类
     *
     * @constructor
     * @param {Object=} options 引擎参数
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     * @param {string=} options.missTarget target不存在时的处理策略
     */
    function Engine(options) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            commandSyntax: /^\s*(\/)?([a-z]*)\s*(?::([\s\S]*))?$/,
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };

        this.config(options);
        // 盛放 targets 们
        this.targets = {};
        this.filters = extend({}, DEFAULT_FILTERS);
    }

    /**
     * 配置引擎参数，设置的参数将被合并到现有参数中
     *
     * @param {Object} options 参数对象
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     * @param {string=} options.missTarget target不存在时的处理策略
     */
    Engine.prototype.config = function (options) {
        extend(this.options, options);
    };

    /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     *
     * @param {string} source 模板源代码
     * @return {function(Object):string} renderer函数
     */
    Engine.prototype.compile =

    /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     * 该方法的存在为了兼容老模板引擎
     *
     * @param {string} source 模板源代码
     * @return {function(Object):string} renderer函数
     */
    Engine.prototype.parse = function (source) {
        if (source) {
            var targetNames = parseSource(source, this);
            if (targetNames.length) {
                return this.targets[targetNames[0]].getRenderer();
            }
        }

        /* jshint -W054 */
        return new Function('return ""');
        /* jshint +W054 */
    };

    /**
     * 根据target名称获取编译后的renderer函数
     *
     * @param {string} name target名称
     * @return {function(Object):string} renderer函数
     */
    Engine.prototype.getRenderer = function (name) {
        var target = this.targets[name];
        if (target) {
            return target.getRenderer();
        }
    };

    /**
     * 执行模板渲染，返回渲染后的字符串。
     *
     * @param {string} name target名称
     * @param {Object=} data 模板数据。
     *      可以是plain object，
     *      也可以是带有 {string}get({string}name) 方法的对象
     * @return {string} 渲染结果
     */
    Engine.prototype.render = function (name, data) {
        var renderer = this.getRenderer(name);
        if (renderer) {
            return renderer(data);
        }

        return '';
    };

    /**
     * 增加过滤器
     *
     * @param {string} name 过滤器名称
     * @param {Function} filter 过滤函数
     */
    Engine.prototype.addFilter = function (name, filter) {
        if (typeof filter === 'function') {
            this.filters[name] = filter;
        }
    };

    /**
     * 解析源代码
     *
     * @inner
     * @param {string} source 模板源代码
     * @param {Engine} engine 引擎实例
     * @return {Array} target名称列表
     */
    function parseSource(source, engine) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;
        var commandSyntax = engine.options.commandSyntax;

        var stack = new Stack();
        // 这个即贯穿所有命令所需的参数：context
        var analyseContext = {
            // context 中包含 engine, 一个 stack
            engine: engine,
            // 此数组用于保存所有的 target names
            targets: [],
            stack: stack,
            // 此 target 会引用当前编译到的 target（即会不停变化）
            target: null
        };

        // text节点内容缓冲区，用于合并多text
        var textBuf = [];

        /**
         * 将缓冲区中的text节点内容写入
         *
         * @inner
         */
        function flushTextBuf() {
            var text;
            // 先判断缓冲区是否有值
            if (textBuf.length > 0 && (text = textBuf.join(''))) {
                var textNode = new TextNode(text, engine);
                textNode.beforeAdd(analyseContext);

                stack.top().addChild(textNode);
                // 清空缓冲区
                textBuf = [];

                if (engine.options.strip
                    && analyseContext.current instanceof Command
                ) {
                    textNode.value = text.replace(/^[\x20\t\r]*\n/, '');
                }
                analyseContext.current = textNode;
            }
        }

        var NodeType;

        parseTextBlock(
            source, commandOpen, commandClose, 0,

            function (text) { // <!--...-->内文本的处理函数
                var match = commandSyntax.exec(text);
                var nodeName;

                // 符合command规则，并且存在相应的Command类，说明是合法有含义的Command
                // 否则，为不具有command含义的普通文本
                if (match
                    && (nodeName = match[2] || 'target')
                    && (NodeType = commandTypes[nodeName.toLowerCase()])
                    && typeof NodeType === 'function'
                ) {
                    // 先将缓冲区中的text节点内容写入
                    flushTextBuf();

                    var currentNode = analyseContext.current;
                    if (engine.options.strip && currentNode instanceof TextNode) {
                        currentNode.value = currentNode.value
                            .replace(/\r?\n[\x20\t]*$/, '\n');
                    }

                    if (match[1]) {
                        currentNode = autoCloseCommand(analyseContext, NodeType);
                    }
                    else {
                        currentNode = new NodeType(match[3], engine);
                        if (typeof currentNode.beforeOpen === 'function') {
                            currentNode.beforeOpen(analyseContext);
                        }
                        currentNode.open(analyseContext);
                    }

                    analyseContext.current = currentNode;
                }
                else if (!/^\s*\/\//.test(text)) {
                    // 如果不是模板注释，则作为普通文本，写入缓冲区
                    textBuf.push(commandOpen, text, commandClose);
                }

                NodeType = null;
            },

            function (text) { // <!--...-->外，普通文本的处理函数
                // 普通文本直接写入缓冲区
                textBuf.push(text);
            }
        );


        flushTextBuf(); // 将缓冲区中的text节点内容写入
        autoCloseCommand(analyseContext);

        return analyseContext.targets;
    }

    var etpl = new Engine();
    etpl.Engine = Engine;
    etpl.version = '3.1.1';

    if (typeof exports === 'object' && typeof module === 'object') {
        // For CommonJS
        exports = module.exports = etpl;
    }
    else if (typeof define === 'function' && define.amd) {
        // For AMD
        define(etpl);
    }
    else {
        // For <script src="..."
        root.etpl = etpl;
    }
})(this);

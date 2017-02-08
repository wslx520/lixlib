// 精力有限，能力也有限，并不想此包变成另外一个 glob
// 打算做成一个无依赖，只匹配 **、* 筛选条件的文件查找器
// 对我来说够用了

const path = require('path');
const fs = require('fs'), {readdir} = fs;

var Deferred = function () {
    var root = this;
    this.promise = new Promise(function (resolve, reject) {
        root._resolve = resolve;
        root._reject = reject;
    });
}
Deferred.prototype.resolve = function (newValue) {
    this._resolve.call(this.promise, newValue);
}
Deferred.prototype.reject = function (err) {
    this._reject.call(this.promise, err);
}
function strToObj(str) {
    let obj = {};
    for (let s = 0; s < str.length; s++) {
        obj[str[s]] = true;
    }
    return obj;
}
// 文件名不能包含的字符
var canNotInFileName = strToObj('|\\/*:?<>"');
// console.log(canNotInFileName);
// 以及有特殊意义的表达式字符（不能当成普通字符对待）
// 如果出现，且前置字符不是转义符，就会被当成表达式的一部分
// 如果要查找包含这些字符的文件名，前面必须加转义符，如 \\{
var mustBeEscape = strToObj('!@*?+([{}])');
var mustBeforeParentheses = strToObj('!@?+*')
// 修饰符（会出现在 ( 之前）。如果 是 ! ，但后续字符不是 (，则直接报错
// 其中 * ，可以脱离 ( 表示独立意义
'!+*@';
// 分隔符。只会出现在 () 中
'|';
let somePaths = [
    'src/**/*.js',
    '/src/js/*.js',
    'examples/dist/**/n*.css'
];
function loopTest(reg, ...strs) {
    console.log('[RegExp]', reg);
    strs.forEach(function (str) {
        console.log(str, reg.test(str));
    });
}
let s = '*.js';
let m = /[^\\]\*/g.test(s);
// console.log(path.normalize('dist/a(!(b|c)/!(@(c|d|e)).js'));
// console.log(path.parse('aaa/b**/*(a|a1|b).js'));
// console.log(path.parse('aaa/b!(b|c*)\\**/**.*js'));
// console.log(path.parse('**.*js'));
// console.log(globParse('dist/a(!(b|c)/gg)!(@(c|d|e)).js'));
let notInPath = '[^\\/]+';
function pathToRegstr(str) {
    return str.replace(/(\*+)/g, function function_name(m, $1, $2) {
        // console.log(m);
        if (m.length > 1) {
            return '.*';
        }
        return notInPath;
    }).replace(/\?+/g, function (m) {
        return m.length === 1 ? notInPath : notInPath + '{1,' + m.length + '}';
    })
}
// console.log(replaceAsterisk('dist/*.js'));

// console.log(transform('dist/*(a|b\\/)*.js'));
var am = (function () {
    function getBase(str) {
        return str.substring(0, str.lastIndexOf('/', str.indexOf('*')));
    }
    function readdirWalk (dir, callback) {
        readdir(dir, function (err, files) {
            if (err) {
                throw (err);
            }
            // console.log(files);
            var curPath = dir;
            files.forEach(function (file, i) {
                file = curPath + '/' + file;
                fs.stat(file, function (err, stat) {
                    if (err) {
                        console.log(err);
                    }
                    let isFolder = stat.isDirectory();
                    if (isFolder) {
                        console.log(file, 'isFolder');
                        readdirWalk(file, callback);
                    }
                    else {
                        callback(file);
                    }
                })
            });
        });
    }
    // justFile 强制对结果进行 stat 判断，只留下类型为 file 的路径
    const main = (pathString, justFile) => {
        pathString = path.normalize(pathString);
        // 将 windows 的分隔符 换成正常的
        pathString = pathString.replace(/\\/g,'/');
        let paths, baseDir, base;
        let pathObj = path.parse(pathString);
        baseDir = pathObj.root + getBase(pathObj.dir);
        console.log(pathObj, baseDir, pathObj.base);
        // 直接按 / 拆分字符串，简单粗暴
        // 因为，任何系统中，/ 都不会是文件名或目录名的一部分
        paths = pathObj.dir.split('/');
        // 取最后一项，作为匹配最终文件的表达式
        let fileExpression = new RegExp('^' + pathToRegstr(pathObj.base) + '$');
        let files = [];
        readdirWalk(baseDir, file => {
            console.log(file);
            let basename = path.basename(file);
            let ext = path.extname(file);
            let nameWithoutExt = basename.slice(0, -ext.length);
            console.log(file, fileExpression, fileExpression.test(file));
            
        });
        return new Promise(function(resolve, reject) {

        });
    }
    return main;
})();

somePaths.forEach(function (p) {
    // console.log(pathToRegstr(p));
});

am(somePaths[2]);
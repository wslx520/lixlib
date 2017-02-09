// 'use strict';
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
    'examples/dist/**/n*.css',
    'examples/dist/c*/n*.css',
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
    function readdirWalk (dir, check) {
        var result = [];
        var defer = new Deferred();
        readdir(dir, function (err, files) {
            if (err) {
                throw (err);
            }
            // console.log(files);
            var curPath = dir;
            var len = files.length;
            files.forEach(function (file, i) {
                // file = curPath + '/' + file;
                file = path.resolve(curPath, file);
                fs.stat(file, function (err, stat) {
                    len--;
                    if (err) {
                        console.log(err);
                    }
                    let isFolder = stat.isDirectory();
                    if (isFolder) {
                        // console.log(file, 'isFolder');
                        result = result.concat(readdirWalk(file, check));
                    }
                    else {
                        if (check(file)) result.push(file);
                    }
                    
                    if (!len) {
                        defer.resolve(result);
                    }
                });
            });
        });
        // return result;
        return defer.promise;
    }
    var promisify = function (fn) {
        return function (...args) {
            return new Promise(function (resolve, reject) {
                fn(...args, function (err, res) {
                    if (err) return reject(err);
                    resolve(res);
                });
            })
        }
    }
    var readdirPromisy = promisify(fs.readdir);
    var readdirStep = function *(dir, check) {
        var result = [];
        console.log(dir);

        function* recur() {
            var files = yield readdirPromisy(dir);
            console.log(files);
            for(let file of files) {
                file = path.join(dir, file);
                console.log(file);
                let stat = fs.lstatSync(file);
                console.log(stat);
                let isFolder = stat.isDirectory();
                if (isFolder) {
                    // console.log(file, 'isFolder');
                    let temp = yield readdirPromisy(file);
                    result = result.concat(temp.filter(check));
                }
                else {
                    if (check(file)) result.push(file);
                }
            }    
        }
        
        return result;
    }

    const main = (pathString) => {
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
        let dirExpression = new RegExp('^' + pathToRegstr(pathObj.dir) + '$');
        // readdirWalk(baseDir, file => {
        //     // console.log(file);
        //     let basename = path.basename(file);
        //     let ext = path.extname(file);
        //     let nameWithoutExt = basename.slice(0, -ext.length);
        //     // console.log(file, fileExpression, basename, fileExpression.test(basename));
        //     // console.log(file, dirExpression, file.slice(0, -basename.length), dirExpression.test(file.slice(0, -basename.length - 1)));
        //     return fileExpression.test(basename) && dirExpression.test(file.slice(0, -basename.length - 1));
        // }).then(function (files) {
        //     console.log(171, files);
        // });
        
        // console.log(gen.next());
        // console.log(gen.next());
        // console.log(gen.next());
        run(readdirStep, baseDir, file => {
            // console.log(file);
            let basename = path.basename(file);
            let ext = path.extname(file);
            let nameWithoutExt = basename.slice(0, -ext.length);
            // console.log(file, fileExpression, basename, fileExpression.test(basename));
            // console.log(file, dirExpression, file.slice(0, -basename.length), dirExpression.test(file.slice(0, -basename.length - 1)));
            return fileExpression.test(basename) && dirExpression.test(file.slice(0, -basename.length - 1));
        }).then(files => console.log(files));
        // console.log(files);
        return new Promise(function(resolve, reject) {

        });
    }
    return main;
})();

somePaths.forEach(function (p) {
    // console.log(pathToRegstr(p));
});
am(somePaths[3]);


var readdirPromisy = function (dir) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, files) {
            if (err) return reject(err);
            resolve(files);
        })
    })
};

function* aaa(dir){
    var files = yield readdirPromisy(dir);
    console.log(files);
}


function run(gen, ...arg){
  return new Promise((resolve, reject) => {
    var g = gen(...arg);

    function next(data){
        var result = g.next(data);
        if (result.done) return resolve(result.value);
        result.value.then(function(data){
            next(data);
        });
    }

    next();
  })
}
// console.log(run(aaa, 'examples/dist'));
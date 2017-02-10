// 'use strict';
// 精力有限，能力也有限，并不想此包变成另外一个 glob
// 打算做成一个无依赖，只匹配 **、* 筛选条件的文件查找器
// 对我来说够用了
const path = require('path');
const fs = require('fs'), {readdir} = fs;



let notInPath = '[^\\\\\\/]+';
function pathToRegstr(str) {
    // 先将 windows 目录分隔符 \\ 替换为 \\\\
    return str.replace(/\\/g, '\\\\')
        // 替换 *
        .replace(/\*+/g, function function_name(m) {
            // console.log(m);
            if (m.length > 1) {
                return '.*';
            }
            return notInPath;
        })
        // 替换 ?
        .replace(/\?+/g, function (m) {
            return m.length === 1 ? notInPath : notInPath + '{1,' + m.length + '}';
        })
}
// console.log(replaceAsterisk('dist/*.js'));
// 遍历目录树，并对 file 执行检测，完成后调用 done
var walkCheck = function(dir, check, done) {
    fs.lstat(dir, function (err, dirstat) {
        if (err) return done(err);
        if (!dirstat.isDirectory()) return done(new Error(`Path:<${dir} , is not a directory.`))
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function(file) {
                // 使用 path.resolve 会将 file 变成从根出发的绝对路径，不好
                file = path.join(dir, file);
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        // 递归调用
                        // 但此时传入的函数不再是 done
                        walkCheck(file, check, function(err, res) {
                            // 这个 res ,已经通过 check 检测
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                        });
                    } else {
                        if (check && check(file)) results.push(file);
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    });    
};
// console.log(transform('dist/*(a|b\\/)*.js'));
var asteriskMatch = (function () {
    function getBase(str) {
        let asterIndex = str.indexOf('*');
        return ~asterIndex ? str.substring(0, str.lastIndexOf(path.sep, asterIndex)) : str;
    }
    // 支持 自定义 file 检测函数，如传入，则默认的检测规则会被忽略
    const main = (pathString, customCheck) => {
        console.log(pathString);
        pathString = path.normalize(pathString);
        let pathObj = path.parse(pathString);
        let baseDir = pathObj.root + getBase(pathObj.dir);
        console.log(pathObj, baseDir, pathObj.base);
        // 取 pathObj.base ，作为匹配最终文件的表达式
        let fileExpression = new RegExp('^' + pathToRegstr(pathObj.base) + '$');
        // 为目录最后补上 / 或 \\
        let dirExpression = new RegExp('^' + pathToRegstr(pathObj.dir) + '\\' + path.sep + '?$');
        // console.log(fileExpression, dirExpression);
        let check = typeof customCheck === 'function' ? customCheck : file => {
            let basename = path.basename(file);
            // console.log(file, fileExpression, basename, fileExpression.test(basename));
            // console.log(file, dirExpression, file.slice(0, -basename.length), dirExpression.test(file.slice(0, -basename.length)));
            return fileExpression.test(basename) && dirExpression.test(file.slice(0, -basename.length));
        };
        return new Promise(function(resolve, reject) {
            walkCheck(baseDir, check, function (err, res) {
                if (err) reject(err);
                else resolve(res);
            })
        });
    }
    return main;
})();

let somePaths = [
    'src/**/*.js',
    '/src/js/*.js',
    'examples/dist/**/v*.css',
    './examples/dist/c*/n*.css'
];

console.log(somePaths);
// console.log(somePaths.map(p => asteriskMatch(p)));
// Promise.all(somePaths.map(p => asteriskMatch(p))).then(all => console.log(all), err => console.error(err));

function* aaa(dir){
    var files = yield readdirPromisy(dir);
    console.log(files);
}

asteriskMatch('./examples/dist/**/**').then(function (csses) {
    csses.forEach(function (cs) {
        fs.writeFile(cs, '', function (err) {
            if (err) throw err;
            console.log(cs, 'is empty now');
        })
    })
}, err => console.error(err))

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

module.exports = asteriskMatch;
'use strict';

const path = require('path');
const fs = require('fs'), {readdir} = fs;



let notInPath = '[^\\\\\\/]';
function pathToRegstr(str) {
    // 先将 windows 目录分隔符 \\ 替换为 \\\\
    return str.replace(/\\/g, '\\\\')
        // 替换 *
        .replace(/\*+/g, function function_name(m) {
            // console.log(m);
            if (m.length > 1) {
                return '.+';
            }
            return notInPath + '+';
        })
        // 替换 ?
        .replace(/\?+/g, function (m) {
            return notInPath + (m.length === 1 ? '' : '{' + m.length + '}');
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
var getBase = regString => {
    // regString = path.normalize(regString);
    // console.log(1, regString);
    regString = path.normalize(regString);
    let r = 0, letter;
    let regLetter = /[\.\*\[\?\!\{]/;
    let regLetterIndex = -1;
    while (letter = regString[r++]) {
        // console.log(letter, regLetter.test(letter));
        if (regLetter.test(letter)) {
            regLetterIndex = r;
            break;
        }
    }
    // console.log(regLetterIndex);
    return ~regLetterIndex ? regString.substring(0, regString.lastIndexOf(path.sep, regLetterIndex)) : regString;
    return ~regLetterIndex ? regString.substring(0, regString.lastIndexOf('/', regLetterIndex)) : regString;
};
var asteriskMatch = (function () {
    const main = (pathString, callback) => {
        // console.log(pathString);
        pathString = path.normalize(pathString);
        let pathObj = path.parse(pathString);
        let baseDir = path.resolve(pathObj.root, getBase(pathObj.dir));
        // console.log(pathObj, baseDir, pathObj.base);
        // 取 pathObj.base ，作为匹配最终文件的表达式
        let fileExpression = new RegExp('^' + pathToRegstr(pathObj.base) + '$');
        // 为目录最后补上 / 或 \\
        let dirExpression = new RegExp('^' + pathToRegstr(pathObj.dir) + '\\' + path.sep + '?$');
        // console.log(fileExpression, dirExpression);
        let check = file => {
            let basename = path.basename(file);
            // console.log(file, fileExpression, basename, fileExpression.test(basename));
            // console.log(file, dirExpression, file.slice(0, -basename.length), dirExpression.test(file.slice(0, -basename.length)));
            return fileExpression.test(basename) && dirExpression.test(file.slice(0, -basename.length));
        };
        walkCheck(baseDir, check, callback);
    }
    return main;
})();

// 将 getBase 绑到 asteriskMatch，可供外部调用
asteriskMatch.getBase = getBase;

module.exports = asteriskMatch;
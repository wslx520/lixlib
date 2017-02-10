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
        let baseDir = path.resolve(pathObj.root + getBase(pathObj.dir));
        console.log(pathObj, baseDir, pathObj.base);
        // 取 pathObj.base ，作为匹配最终文件的表达式
        let fileExpression = new RegExp('^' + pathToRegstr(pathObj.base) + '$');
        // 为目录最后补上 / 或 \\
        let dirExpression = new RegExp('^' + pathToRegstr(pathObj.dir) + '\\' + path.sep + '?$');
        console.log(fileExpression, dirExpression);
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
    // 通过正则表达式匹配
    // 不能对 正则表达式 字符串调用 path.normalize
    const byRegexp = (regString, customCheck) => {
        
    }
    return main;
})();

var getBaseInReg = regString => {
    // regString = path.normalize(regString);
    console.log(1, regString);
    let r = 0, letter;
    let regLetter = /[\.\*\[\?\!\{\\]/;
    let regLetterIndex = -1;
    while (letter = regString[r]) {
        // 如果碰到转义符
        if (letter === '\\') {
            // 且其下一个字符是 正则字符
            console.log(regString[r+1], regLetter.test(regString[r+1]))
            if (regLetter.test(regString[r+1])) {
                // 则跳过下一个字符（即，跟在转义符后面的正则字符，将不被作为正则字符解析）
                r+=2;
                continue;
            }
            
        }
        if (regLetter.test(letter)) {
            regLetterIndex = r;
            break;
        }
        r++;
    }
    console.log(regLetterIndex);
    return ~regLetterIndex ? regString.substring(0, regString.lastIndexOf(path.sep, regLetterIndex)) : regString;
    return ~regLetterIndex ? regString.substring(0, regString.lastIndexOf('/', regLetterIndex)) : regString;
}
// console.log(1111, getBaseInReg('a/\\[1-3]b*/**/b\s*.js'));
console.log(22, getBaseInReg('a/\\[1-3]/b*/**/b\s*.js'));
module.exports = asteriskMatch;
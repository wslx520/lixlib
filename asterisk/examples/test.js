const path = require('path');
var am = require('../index');
var getBase = am.getBase;


let somePaths = [
    '**/*.ttf',
    '**/c*/s*.css',
    // 查找下级目录中 名为 logos 的目录下的所有文件
    'dist/**/logos/*',
    'dist/css/**/**',
    // 查找下级目录以 v 开头的 css
    'dist/**/v*.css',
    // 查找以 c 开头的目录下以 n 开头的css
    './dist/c*/n*.css',
    // 查找文件名为3个字符的css
    './dist/**/???.css',
    // 查找纯由字母组成的文件名
    './dist/**/[a-z]{1,}.css',
    // 双 \\ 会与windows path.sep 混淆，造成意料之外的错误
    // './dist/**/*[\\d\\.]*.js', 这个 normalize 之后，会变成 dist\\**\\*[\\d\\.]*.js 导致 \\ 与 path.sep 分不清
    // 查找文件名中有数字的文件
    './dist/**/*[1-9]*.js',
    // 查找下级目录中 以 ar 开头的文件
    'dist/**/ar*.png',
    // 查找不包含 ar 字符的文件
    'dist/**/[^ar]{1,}.png'
];

// console.log(path.parse('a/b*/**/b\\s*.js'))
// console.log(somePaths, __dirname, process.cwd());
// console.log(path.resolve('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));
// console.log(path.join('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));

somePaths.map(function (p) {
    // am(path.resolve(__dirname, p), function (err, res) {
    am(p, function (err, res) {
        
        console.log(p, getBase(p));
        if (err) console.error(err);
        else console.log(res);
    });
})
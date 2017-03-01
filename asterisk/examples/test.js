const path = require('path');
var am = require('../index');
var getBase = am.getBase;


let somePaths = [
    'dist/**/logos/*',
    'dist/css/**/**',
    'dist/**/v*.css',
    './dist/c*/n*.css',
    './dist/**/???.css',
    './dist/**/[a-z]{1,}.css',
    // 双 \\ 会与windows path.sep 混淆，造成意料之外的错误
    // './dist/**/*[\\d\\.]*.js', 这个 normalize 之后，会变成 dist\\**\\*[\\d\\.]*.js 导致 \\ 与 path.sep 分不清
    './dist/**/*[1-9]*.js',
    'dist/**/ar*.png',
    'dist/**/[^ar]{1,}.png'
];

// console.log(path.parse('a/b*/**/b\\s*.js'))
// console.log(somePaths, __dirname, process.cwd());
// console.log(path.resolve('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));
// console.log(path.join('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));

somePaths.map(function (p) {
    am(path.resolve(__dirname, p), function (err, res) {
        
        console.log(p, getBase(p));
        if (err) console.error(err);
        else console.log(res);
    });
})
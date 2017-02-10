const path = require('path');
var am = require('../index');


let somePaths = [
    'dist/**/logos/*',
    'dist/css/**/**',
    'dist/**/v*.css',
    './dist/c*/n*.css',
    './dist/**/???.css'
];

let someRegPaths = [
    'dist/[abc]+/[^\d]+/'
]

console.log(path.parse('a/b*/**/b\\s*.js'))
// console.log(somePaths, __dirname, process.cwd());
// console.log(path.resolve('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));
// console.log(path.join('D:\\', 'D:\\lixlib\\lixlib\\asterisk\\examples\\dist\\c*'));

somePaths.map(function (p) {
    // am(path.join(__dirname, p)).then(files => {
    //     console.log(p);
    //     console.log(files);
    // });
})
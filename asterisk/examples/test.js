var am = require('../index');


let somePaths = [
    'dist/**/logos/*',
    'dist/css/**/**',
    'dist/**/v*.css',
    './dist/c*/n*.css',
    './dist/**/???.css'
];

console.log(somePaths);

somePaths.map(function (p) {
    am(p).then(files => {
        console.log(p);
        console.log(files);
    });
})
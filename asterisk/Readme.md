# asterisk-match

精力有限，能力也有限，并不想此包变成另外一个 glob

打算做成一个无依赖，只匹配 **、* 、? 筛选条件的文件查找器

对我来说够用了

## 调用方式

    var am = require('asterisk-match');
    am('./examples/dist/**/**').then(function (csses) {
        csses.forEach(function (cs) {
            fs.writeFile(cs, '', function (err) {
                if (err) throw err;
                console.log(cs, 'is empty now');
            })
        })
    }, err => console.error(err))


如上，返回的是一个 promise。

常见用法：

    am('src/**/*.js');
    am('src/**/*.css');
    am('src/**/v*.js');
    am('src/**/*-polyfill.js');
    am('src/**/vip-*.js');

可查看 `examples/test.js` 了解常见用法
# asterisk-match

精力有限，能力也有限，并不想此包变成另外一个 glob

打算做成一个无依赖，只匹配 `**`、`*` 、`?` 以及两个正则表达式 `[]`, `{}` 筛选条件的文件查找器

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

### 常见用法：

    am('src/**/*.js', function (err, resultArray) {});
    am('src/**/*.css', callback);
    am('src/**/v*.js', callback);
    am('src/**/*-polyfill.js', callback);
    am('src/**/vip-*.js', callback);    
    am('aa/b[c-g]{1,3}/**/*.js', callback);
    am('aa/b?d/*.css', callback);
    am('b/???/d*.js', callback);

可查看git仓库中 `examples/test.js` 了解常见用法

### 实现思路

非常简单，就是将字符串解析成正则表达式，下面是转换关系：

1. `*` --> `[^\\\/]+`
2. `**` --> `.+`
3. `?` --> `[^\\\/]`。如果有连续的 ? ，比如 3 个，则会转换成 `[^\\\/]{1,3}`
4. `[]`, `{}` --> 不转换，直接传入 new RegExp 生成最终正则
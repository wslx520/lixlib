function ccc(data, engine) {
data = data || {};
var v = {},
    fs = engine.filters,
    hg = typeof data.get == "function",
    gv = function(n, ps) {
        var p = ps[0],
            d = v[p];
        if (d == null) {
            if (hg) {
                return data.get(n); }
            d = data[p]; }
        for (var i = 1, l = ps.length; i < l; i++)
            if (d != null) d = d[ps[i]];
        return d; },
    ts = function(s) {
        if (typeof s === "string") {
            return s; }
        if (s == null) { s = ""; }
        return "" + s; };
var r = "";
r += "\n        <ul>\n";
var ___178246 = gv("persons", ["persons"]);
if (___178246 instanceof Array)
    for (var ___178248 = 0, ___178249 = ___178246.length; ___178248 < ___178249; ___178248++) { v["___178247"] = ___178248;
        v["p"] = ___178246[___178248];
        // start：import item.
        // 实际上是简单的将 target 编译过后的代码插入了这里
        // 优点：效率高；缺点：1. 如果生成本渲染函数时，import 对应的 target 还没编译出来，就会报错；2. 生成的函数体代码会变大
        r += "\n    ";
        r += "<li>";
        r += fs["html"](ts(gv("p.name", ["p", "name"])));
        r += ": ";
        r += fs["html"](ts(gv("p.email", ["p", "email"])));
        r += "</li>\n";
        // end: /import item
        // 期望改成如下模样
        r += engine.targets['item']();
        // 实际上 targets 中名为的item的渲染函数长这样
        // engine.targets['item'] = function () {
        //     var r = '';
        //     r += "\n    ";
        //     r += "<li>";
        //     r += fs["html"](ts(gv("p.name", ["p", "name"])));
        //     r += ": ";
        //     r += fs["html"](ts(gv("p.email", ["p", "email"])));
        //     r += "</li>\n";
        //     return r;
        // }
        // 故意整个 undeclared 的变量
        r += abc;
        r += "\n    ";
        r += engine.render("item", { "main": gv("p.name", ["p", "name"]), "sub": gv("p.email", ["p", "email"]) });
        r += "\n"; } else if (typeof ___178246 === "object")
        for (var ___178248 in ___178246) { v["___178247"] = ___178248;
            v["p"] = ___178246[___178248];
            r += "\n    ";
            r += "<li>";
            r += fs["html"](ts(gv("p.name", ["p", "name"])));
            r += ": ";
            r += fs["html"](ts(gv("p.email", ["p", "email"])));
            r += "</li>\n";
            r += "\n    ";
            r += engine.render("item", { "main": gv("p.name", ["p", "name"]), "sub": gv("p.email", ["p", "email"]) });
            r += "\n"; }
    r += "\n</ul>\n\n";
return r;
}

try {
    console.log(ccc({aa:1,persons:[1,2,3]},{filters:{html:function(){}}}))
    } catch(e) {
    // console.error(e);
}
// Promise构造函数，接收一个参数：resolver
// resolver 是一个函数，其有两个参数：resolve, reject。均是函数
// 如：
// function resolver (resolve, reject) {
//     if(a<3) {
//         resolve(3);
//     } else {
//         reject(1);
//     }
// }
// resolve供resolver成功的时候调用，reject则是resolver解决失败的时候调用
var APromise = (function(window, nul) {
    // 用变量保存nul值，可以在压缩代码时进一步减少字符
    var 
    Deferred, 
    Promise = function () {
        var 
        isFunction = function (fn) {
            return typeof fn === 'function';
        },
        getThen = function (newValue) {
            if (newValue && isFunction(newValue.then)) {
                return newValue.then;
            }
        },
        _Promise = function (resolver) {
            // list: deferred对象集
            var list = [],
                // value：用于传入下次调用的值
                value = nul,
                // state: promise状态
                state = nul,
                self = this,
                l, ll;

            // 处理deferred对象;
            // deferred 对象是一个plain object.他包含4个函数: onFulfilled, onRejected, resolve, reject
            function handle(deferred) {
                // 当状态还是默认状态时，将deferred对象加入队列
                // console.log('handle', state, deferred);
                if (state === nul) {
                    list.push(deferred);
                    return;
                }
                // console.log('handle', state, deferred);
                // 能走到这里，表示state已经改变了
                execute(deferred);
            }
            // 执行
            function execute(deferred) {
                setTimeout(function() {
                    // 根据状态，选择调用成功处理函数还是失败处理函数
                    console.log(deferred);
                    var cb = state ? deferred.onFulfilled : deferred.onRejected;
                    if (cb === nul) {
                        // 如果两个函数都没有，则
                        (state ? deferred.resolve : deferred.reject)(value);
                    } else {
                        try {
                            var ret = cb(value);
                            deferred.resolve(ret);
                        } catch (e) {
                            deferred.reject(e);
                        }
                    }

                }, 1);
            }
            // Promise实例，会拥有一个then方法，then方法可以接收两个参数，依次是成功处理函数onFulfilled，失败处理函数onRejected
            // then方法执行后，实际上又返回（生成）了一个新的Promise实例(也就可以继续 then )
            this.then = function(onFulfilled, onRejected) {
                // 这句话其实可以用new Promise，但self.constructor可以无视Promise的名字改变的情况
                // return new self.constructor(function(resolve, reject) {
                return new Promise(function(resolve, reject) {
                    // 当然，这个函数就是一个 resolver, 他接收的参数还是两个函数
                    // handle 的作用是根据 state 决定是将 deferred 对象加入队列还是调用
                    handle({
                        onFulfilled: isFunction(onFulfilled) ? onFulfilled : nul,
                        onRejected: isFunction(onRejected) ? onRejected : nul,
                        resolve: resolve,
                        reject: reject
                    });
                })
            };
                // onFulfilled与onRejected，都是在构造函数内定义的（即每初始化一个Promise，都会重复定义）
                // onFulfilled与onRejected，都是先改变状态与值，再执行deferred队列 
                // 他们的不同点，在于将状态设为成功还是失败
            function onFulfilled(newValue) {
                try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                    // if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
                    // resolve 会遇到 newValue 就是个promise的情况
                    var then = getThen(newValue);
                    if (then) {
                        // 如果newValue本身就是个promise，则构造一个resolver，传给doResolve调用
                        // 且不会发生改变state
                        // doResolve(then.bind(newValue), onFulfilled, onRejected);
                        doResolve(function(resolve, reject) {
                            // then.apply(newValue, arguments);
                            then(resolve, reject);
                            // 把 onFulfilled 自身也传进去了， resolve 执行后会调用到这个 onFulfilled
                            // 也就是如果 newValue 是个promise，则 onFulfilled 一次后，会再 onFulfilled 一次
                            // 当再次 resolve 的时候, newValue 就不再是个promise了，就会进入到else, 走正常的 resolve流程
                        }, onFulfilled, onRejected);
                    } else {
                        // 真正地解决了
                        trueResolve(newValue)
                    }

                } catch (e) {
                    onRejected(e);
                }
            }
            // 真正的 resolve
            function trueResolve(newValue) {
                // 设置状态为完成
                state = true;
                value = newValue;
                doList();
            }
            function onRejected(error) {
                // 设置状态为失败
                state = false;
                value = error;
                doList();
            }


            function doList() {
                if (list.length) {
                    for (l = 0, ll = list.length; l < ll; l++) {
                        execute(list[l]);
                    }
                    // list = nul;
                }                
            }
            // 当构造new Promise()时，就会立即调用doResolve，并把构造函数内部生成的resolve与reject函数，传入doResolve
            doResolve(resolver, onFulfilled, onRejected);
        };
        _Promise.prototype['catch'] = function(onRejected) {
            // 切记return, 供后续调用
            return this.then(nul, onRejected);
        }
        // Promise.all 接收一个promise数组，数组里的每一项都是一个promise（直接量也可以）
        _Promise.all = function(args) {
            // 通过数组特有的splice判断参数类型
            // 不是数组则抛错，与原生一致
            if (!args || !args.splice) {
                throw new Error('Promise.all needs array as param.')
            }
            // var args = (args && args.splice) ? args : Array.prototype.slice.call(arguments);
            // 依然是返回一个 promise
            return new Promise(function(resolve, reject) {
                if (args.length === 0) return resolve([]);
                var remaining = args.length;

                function res(i, val) {
                    try {
                        var then = getThen(val);
                        if (then) {
                            // 构造了一个resolve传给promise的then
                            // 此函数里又会回调res函数，并依然传入 i, val
                            // 但 val 已经是resolve接收到的值了
                            then(function(value) {
                                res(i, value)
                            }, reject);
                            return;
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        }

        _Promise.race = function(values) {
            return new Promise(function(resolve, reject) {
                // 把resolve, reject直接传给 values里的每一项，这样，当其中有一项执行完成，则 resolve就会马上执行
                for (var i = 0, len = values.length, vv, then; i < len; i++) {
                    vv = values[i];
                    then = getThen(vv);
                    if (then) {
                        then(resolve, reject);
                    } else {
                        try {
                            resolve(vv)
                        } catch (e) {
                            reject(e)
                        };
                    }
                }
            });
        };
        _Promise.resolve = function(value) {
            if (value && typeof value === 'object' && value.constructor === Promise) {
                return value;
            }

            return new Promise(function(resolve) {
                resolve(value);
            });
        };

        _Promise.reject = function(value) {
            return new Promise(function(resolve, reject) {
                reject(value);
            });
        };

        function doResolve(resolver, onFulfilled, onRejected) {
            // done 确保 resolver里的resolve或reject只有一个会执行，且只执行一次
            // 也就是在Promise里，多次 resolve 是不行的
            var done = false;
            try {
                // 前面说了 resolver 接收两个函数做参数，此时就是在执行 resolver，并生成了两个函数传进去执行
                // 传给 resolver 的 resolve, reject 两个函数，就是在这里创建的，只是暂时传进去了，但并不会立即执行
                // 要在 resolver 内部，调用 resolve 或 reject，才会执行(如开头的例子)
                resolver(function(value) {
                    // 第一个函数就是resolve
                    if (!done) {
                        done = true;
                        // 在 resolve 被调用时，执行传入 doResolve 函数的 onFulfilled 方法（即成功的回调）
                        onFulfilled(value);
                    }
                }, function(reason) {
                    // 第二个函数就是reject
                    if (!done) {
                        done = true;
                        // 在 reject 被调用时，执行传入 doResolve 函数的 onRejected 方法（即失败的回调）
                        onRejected(reason);
                    }
                })
            } catch (ex) {
                // 这表示如果resolver函数执行时遇到错误，也调用 onRejected
                if (!done) {
                    done = true;
                    onRejected(ex);
                }
            }
        }
        return _Promise;
    }();
    // catch是关键字，在IE下会报语法错误，所以用fail代替
    Promise.prototype.fail = Promise.prototype['catch'];
    // 此函数的作用就是返回一个对象，对象保存了传入的4个函数。
    // 在本实现中，此函数返回的对象我们称之为一个deferred对象，每个deferred对象就是包含了这4个函数
    // 为了省代码，去掉
    /*function Handler(onFulfilled, onRejected, resolve, reject) {
        return {
            onFulfilled: isFunction(onFulfilled) ? onFulfilled : nul,
            onRejected: isFunction(onRejected) ? onRejected : nul,
            resolve: resolve,
            reject: reject
        }
    }*/
    Promise.deferred = function () {
        var defer = {};
        defer.promise = new Promise((resolve, reject) => {
            defer.resolve = resolve;
            defer.reject = reject;
        });
        return defer;
    };
    return Promise;
}(null));

try {
    module.exports = APromise;
} catch(e) {

}
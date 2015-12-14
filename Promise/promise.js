// Promise构造函数，接收一个参数：resolver
// resolver 是一个函数，其有两个参数：resolve, reject
// 如：
// function resolver (resolve, reject) {
//     if(a<3) {
//         resolve(3);
//     } else {
//         reject(1);
//     }
// }
// resolve供resolver成功的时候调用，reject则是resolver解决失败的时候调用
(function(window, nul) {
    var nativePromise = window.Promise;
    if (nativePromise) {
        // 为原生Promise加上 fail 方法，以实现调用方式的统一
        nativePromise.prototype.fail = nativePromise.prototype['catch'];
        return;
    }

    function isFunction(fn) {
        return typeof fn === 'function';
    }

    function getThen(newValue) {
        if (newValue && isFunction(newValue.then)) {
            return newValue.then;
        }
    }
    var Promise = window.Promise = function(resolver) {
            // list: deferred对象集
            var list = [],
                // 用变量保存nul值，可以在压缩代码时进一步减少字符
                // value：用于传入下次调用的值
                value = nul,
                // state: promise状态
                state = nul,
                self = this,
                l, ll;
            // Promise实例对象，会返回一个then方法，then方法可以接收两个参数，依次是功能处理函数onFulfilled，失败处理函数onRejected
            // then方法执行后，实际上又返回（生成）了一个新的Promise实例
            this.then = function(onFulfilled, onRejected) {
                    // 这句话其实可以用new Promise，但self.constructor可以无视Promise的名字改变的情况
                    // return new self.constructor(function(resolve, reject) {
                    return new Promise(function(resolve, reject) {
                        // 当然，这个函数就是一个 resolver, 他接收的参数还是两个函数
                        // 此时的handle，是构造函数里面的handle
                        // handle(Handler(onFulfilled, onRejected, resolve, reject));
                        handle({
                            onFulfilled: isFunction(onFulfilled) ? onFulfilled : nul,
                            onRejected: isFunction(onRejected) ? onRejected : nul,
                            resolve: resolve,
                            reject: reject
                        });
                        // Handler的作用就很显然了，把then方法 接收到的两个参数，与 resolver 接收到的两个参数， 组合起来，供后续调用
                    })
                }
                // resolve与reject，都是在构造函数内定义的（每次初始化Promise，都会重复定义）
                // resolve与reject，都是先改变状态与值，再执行deferred队列 
                // 他们的不同点，在于将状态设为成功还是失败
                /*function resolve (newValue) {
                    value = newValue;
                    state = true;
                    doList();
                }*/
            function resolve(newValue) {
                try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                    // if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
                    var then = getThen(newValue);
                    if (then) {
                        // doResolve(then.bind(newValue), resolve, reject);
                        doResolve(function(onFulfilled, onRejected) {
                            // then.apply(newValue, arguments);
                            then(onFulfilled, onRejected);
                        }, resolve, reject);
                    } else {
                        state = true;
                        value = newValue;
                        doList();
                    }

                } catch (e) {
                    reject(e);
                }
            }

            function reject(error) {
                state = false;
                value = error;
                doList();
            }

            function handle(deferred) {
                // console.log(deferred)
                // 当状态还是默认状态时，将deferred对象加入队列
                if (state === nul) {
                    list.push(deferred);
                } else {
                    // 能走到这里，表示state已经改变了
                    setTimeout(function() {
                        // 根据状态，选择调用成功处理函数还是失败处理函数
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

                    }, 0);
                }
            }

            function doList() {
                // console.log('do')
                for (l = 0, ll = list.length; l < ll; l++) {
                    handle(list[l]);
                }
                list = nul;
            }
            // 把构造函数内部生成的resolve与reject函数，传入doResolve
            doResolve(resolver, resolve, reject)
        }
        // catch是关键字，在IE下会报语法错误，所以用fail代替
    Promise.prototype['catch'] =
        Promise.prototype.fail = function(onRejected) {
            // 切记return, 供后续调用
            return this.then(nul, onRejected);
        }
        // Promise.all 接收一个promise数组，数组里的每一项都是一个promise（直接量也可以）
    Promise.all = function(list) {
        var args = Array.prototype.slice.call(arguments.length === 1 && arguments[0].splice ? arguments[0] : arguments);
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

    Promise.race = function(values) {
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
    Promise.resolve = function(value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
            return value;
        }

        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    Promise.reject = function(value) {
        return new Promise(function(resolve, reject) {
            reject(value);
        });
    };

    function doResolve(resolver, onFulfilled, onRejected) {
        // done 确保 resolver里的resolve或reject只有一个会执行， 只执行一次
        var done = false;
        try {
            // 前面说了resolver接收两个函数做参数，此时就是在执行 resolver，并生成了两个函数传进去执行
            // 传给 resolver 的 resolve, reject 两个函数，只是暂时传进去了，但并不会立即执行
            // 要在resolver内部，调用 resolve 或 reject，才会执行(如开头的例子)
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
    // 此函数的作用就是返回一个对象，对象保存了传入的4个函数。
    // 在本实现中，此函数返回的对象我们称之为一个deferred对象，每个deferred对象就是包含了这4个函数
    /*function Handler(onFulfilled, onRejected, resolve, reject) {  
        return {
            onFulfilled: isFunction(onFulfilled) ? onFulfilled : nul,
            onRejected: isFunction(onRejected) ? onRejected : nul,
            resolve: resolve,
            reject: reject
        }
    }*/
}(window, null));

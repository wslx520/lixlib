var xPromise = function  () {
	this.then = function (resolve, reject) {
        var defer = new defer();
        return defer.promise;
    }
    var list = [],
        value = null,
        state = null,
        self = this;
    function resolve (newValue) {
        value = newValue;
        state = true;

    }
    function reject (error) {
        state = false;
    }
    this.promise = new promise();
}
function Handler(onFulfilled, onRejected, resolve, reject) {  
    return {
        onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
        onRejected: typeof onRejected === 'function' ? onRejected : null,
        resolve: resolve,
        reject: reject
    }
}
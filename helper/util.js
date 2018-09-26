/* global module */
/**
 * Created with Sublime.
 * To change this template use File | Settings | File Templates.
 * Desc: 该模块包含了一系列的函数，每个函数实现一个特定的工具功能。
 */

'use strict';
var Util = {};

Util.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments, 1),
        toString = Object.prototype.toString;
    if (data.length) {
        data = (data.length == 1 ?
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data);
        return source.replace(/\{(.+?)\}/g, function (match, key) {
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if ('[object Function]' == toString.call(replacer)) {
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

Util.formatDate = function (date, fmt) {
    if (!date) date = new Date();
    fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
    var o = {
        'M+': date.getMonth() + 1, //月份      
        'd+': date.getDate(), //日      
        'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时      
        'H+': date.getHours(), //小时      
        'm+': date.getMinutes(), //分      
        's+': date.getSeconds(), //秒      
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度      
        'S': date.getMilliseconds() //毫秒      
    };
    var week = {
        '0': '/u65e5',
        '1': '/u4e00',
        '2': '/u4e8c',
        '3': '/u4e09',
        '4': '/u56db',
        '5': '/u4e94',
        '6': '/u516d'
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + '']);
    }
    for (var k in o) {
        if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

/**
 * @method Util.Control.parseDate
 * @description 将String类型解析为Date类型.  
 * @param {String} fmt 输入的字符串格式的日期
 * @example
 * parseDate('2006-1-1') return new Date(2006,0,1)  
 * parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
 * parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
 * parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
 * parseDate('不正确的格式') retrun null  
 */
Util.parseDate = function (str) {
    str = String(str).replace(/t/i, ' ');

    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, '');
    var results = null;

    //秒数 #9744242680 
    results = str.match(/^ *(\d{10}) *$/);
    if (results && results.length > 0)
        return new Date(parseInt(str, 10) * 1000);

    //毫秒数 #9744242682765 
    results = str.match(/^ *(\d{13}) *$/);
    if (results && results.length > 0)
        return new Date(parseInt(str, 10));

    //20110608 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);
    if (results && results.length > 3)
        return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10));

    //20110608 1010 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);
    if (results && results.length > 6)
        return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10));

    //2011-06-08 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);
    if (results && results.length > 3)
        return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10));

    //2011-06-08 10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);
    if (results && results.length > 6)
        return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10));

    //2011-06-08 10:10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);
    if (results && results.length > 6)
        return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10), parseInt(results[6], 10));

    return (new Date(str));
};

Util.parseLocator = function (url, args) {
    url = url === null || url === undefined ? '' : String(url);
    var query = {},
        list,
        str;

    if (url.indexOf('?') !== -1) {
        list = url.split('?')[1].split('&');
        for (var i = 0, len = list.length; i < len; i++) {
            str = list[i].split('=');
            str.push('');

            var key = str[0];
            if (args && args.indexOf('lower') > -1) key = String(str[0]).toLowerCase();
            else if (args && args.indexOf('upper') > -1) key = String(str[0]).toUpperCase();

            if (args && args.indexOf('group') > -1) {
                if (query[key]) query[key].push(str[1]);
                else query[key] = [str[1]];
            }
            else query[key] = str[1];
        }

        for (var i in query) {
            if (query[i] && query[i].length === 1) {
                query[i] = query[i][0];
            }
        }

    }

    return query;
};

Util.addParam = function (url, params) {
    var list = Util.extends({}, params);
    for (var i in list) {
        try {
            decodeURIComponent(list[i]);
            list[i] = decodeURIComponent(list[i]);
        }
        catch (e) {}
        list[i] = encodeURIComponent(list[i]);
    }

    var SEARCH_REG = /\?([^#]*)/,
        HASH_REG = /#(.*)/;
    url = url || '';
    var search = {},
        searchMatch = url.match(SEARCH_REG),
        searchAttr = [],
        searchStr = '';

    if (searchMatch) {
        search = Util.parseLocator(searchMatch[0]);
    }
    search = Util.extends(search, list);

    for (var i in search) {
        if (search[i] === undefined)
            search[i] = '';
        searchAttr.push(i + '=' + search[i]);
    }

    if (searchAttr[0]) {
        searchStr = '?' + searchAttr.join('&');
    }

    //是否存在search
    if (SEARCH_REG.test(url)) url = url.replace(SEARCH_REG, searchStr);
    else {
        //是否存在hash
        if (HASH_REG.test(url)) {
            url = url.replace(HASH_REG, searchStr + '#' + url.match(HASH_REG)[1]);
        }
        else {
            url += searchStr;
        }
    }
    return url;
};

Util.delParam = function (url, params) {
    var str = String(url);
    if (params) {
        params = Object.prototype.toString.call(params) == '[object Array]' ? params : [params];
        for (var i = 0, len = params.length; i < len; i++) {
            str = str.replace(new RegExp('&' + params[i] + '=[^&#]*', 'ig'), '');
            str = str.replace(new RegExp('\\\?' + params[i] + '=[^&#]*', 'ig'), '?');
            str = str.replace(/\?$/, '');
        }
    }
    return str;
};


Util.fn = function (func, scope) {
    if (Object.prototype.toString.call(func) === '[object String]') {
        func = scope[func];
    }
    if (Object.prototype.toString.call(func) !== '[object Function]') {
        throw 'Error "Util.fn()": "func" is null';
    }
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function () {
        var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
        return fn.apply(scope || fn, args);
    };
};
/**
 * @method Util.extends
 * @description 对象扩展（伪继承）
 * @public
 * @param {Object} child 子对象
 * @param {Object} parent 父对象
 * @example 
 * var a = {a: 123};
 * var b = {b: 456};
 * var c = Util.extends({}, a, b);
 * console.log(c);
 * >> {a: 123, b: 456}
 * var d = {a: 789};
 * var c = Util.extends({}, a, b, d);
 * console.log(c);
 * >> {a: 789, b: 456}
 */
Util.extends = function (src) {
    var obj, args = arguments;
    for (var i = 1; i < args.length; ++i) {
        if ((obj = args[i])) {
            for (var key in obj) {
                src[key] = obj[key];
            }
        }
    }
    return src;
};

/**
 * 对特殊字符和换行符编码// .replace(/%/ig,"%-")
 */
Util.encode = function (str, decode) {
    str = String(str);
    // encodeURIComponent not encode '
    var fr = '%| |&|;|=|+|<|>|,|"|\'|#|/|\\|\n|\r|\t'.split('|'),
        to = '%25|%20|%26|%3B|%3D|%2B|%3C|%3E|%2C|%22|%27|%23|%2F|%5C|%0A|%0D|%09'.split('|');
    if (decode == 'decode') {
        for (var i = fr.length - 1; i > -1; i--) {
            str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
        }
    }
    else {
        for (var i = 0, l = fr.length; i < l; i++) {
            str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
        }
    }
    return str;
};
Util.decode = function (str) {
    return this.encode(str, 'decode');
};
Util.encodehtml = function (str, decode) {
    str = String(str);
    // encodeURIComponent not encode '
    var fr = '&|<|>| |\'|"|\\'.split('|'),
        to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|');
    if (decode == 'decode') {
        for (var i = fr.length - 1; i > -1; i--) {
            str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
        }
    }
    else {
        for (var i = 0, l = fr.length; i < l; i++) {
            str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
        }
    }
    return str;
};
Util.decodehtml = function (str) {
    return this.encodehtml(str, 'decode');
};

Util.parseJSON = function (str) {
    var data;
    try {
        data = JSON.parse(str);
    }
    catch (e) {
        data = null;
    }
    return data;
};

Util.ajax= function(options){//options =  {url:'',method:'',data:'',callback:'',async:''}
        //默认参数
        options.url = options.url || '',
        options.method = options.method || 'get',
        options.data = options.data || '',
        options.callback = options.callback || '',
        options.async = options.async || true;
        //get请求-拼接url
        if(options.method.toLowerCase() == 'get'){
            if(typeof options.data == 'object'){
                options.data = [];
                for (var k in options.data){
                    options.data.push(k+'='+options.data[k]);
                    options.data.join('&');
                }
            }
            options.url += (options.url.indexOf('?' == -1) ? '?' : '') + options.data;
        }
        //post请求-转换字符串
        if(options.method.toLowerCase() == 'post'){
            if(typeof options.data == 'object'){
                var arrs = [];
                for (var k in options.data){
                    arrs.push(k+'='+options.data[k]);
                }
                options.data = arrs.join('&');
            }
        }
        //创建发送请求
        var xhr = window.XMLHttpRequest ?  new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'); //兼容ie
        xhr.open(options.method,options.url,options.async);
        if(options.method == 'post'){
            xhr.send(options.data);
        }else{
            xhr.send(null);
        }
        //异步请求
        if(options.async == true){
            xhr.onreadystatechange = function(){
              if(xhr.readyState == 4){
                  callcall();
              }
            }
        }
        // xhr.abort(); // 取消异步请求
        //同步请求
        if(options.async == false){
            callcall();
        }
        //返回状态判断
        function callcall(){
            if(xhr.status == 200){
                options.callback(xhr.responseText);
            }else{
                options.callback('error:' + xhr.status + xhr.statusText);
            }
        }

}


module.exports = Util;
/**
 * @namespace hui
 * @description hui是一个简单易用的前端H5框架
 * @public
 * @author haiyang5210
 * @since 2015-06-25 10:48
 */

// 使用window.hui定义可能会导致速度下降约7倍
var hui = (window.hui = window.hui ? window.hui : {});
/**
 * @method hui.loadjs
 * @static
 * @description 动态加载js文件
 * @param {String} url 文件地址
 * @example 
 * hui.loadjs('/st/js/hui.js');
 */
hui.loadjs =
  hui.loadjs ||
  function(url) {
    // 容错处理
    if (!url) return window.console.log("hui.loadjs(url): url is null");
    // 一次加载多个
    if (Object.prototype.toString.call(url) === "[object Array]") {
      for (var i = 0, len = url.length; i < len; i++) hui.loadjs(url[i]);
      return;
    }
    // 开始加载
    hui.loadjs.loaded = hui.loadjs.loaded || {};
    if (hui.loadjs.loaded[url]) return;
    hui.loadjs.loaded[url] = true;

    var env = "";
    var s = document.createElement("script");
    url =
      window.location.href.indexOf("startDebug=true") !== -1 &&
      url.indexOf("/_sourcemap.") === -1
        ? url.replace(/\.[a-z0-9]{10}\.js/, ".js")
        : url;
    s.src =
      url +
      ((env === "dev" && window.location.href.indexOf("stopDev=true") === -1) ||
      window.location.href.indexOf("startDev=true") !== -1
        ? "?" + new Date().getTime()
        : "");
    document.documentElement.appendChild(s);
  };

// 注：资源映射表，从后往前找，新的优先
hui.sourcemap = hui.sourcemap || [];
hui.sourcemapRoute =
  hui.sourcemapRoute ||
  function(opt) {
    if (opt)
      return opt.replaceExist === false
        ? hui.sourcemap.unshift(opt)
        : hui.sourcemap.push(opt);
  };

// 基础模块初始化结束后的回调
hui.loadNextCallback = hui.loadNextCallback || [];
hui.onDefineReady =
  hui.onDefineReady ||
  function(callback) {
    return hui.loadNextLoaded
      ? callback()
      : hui.loadNextCallback.push(callback);
  };
/****************************************
||==========Inner script end============||
/****************************************/
/*
hui.sourcemapRoute({
    domain: 'http://static.bpm.ymatou.com/build/',
    modules: {
        "base64@1.0.0": "base64/1.0.0/base64.js",
        "hui_basemodel@1.0.0": "hui_basemodel/1.0.0/hui_basemodel.js"
    },
    replaceExist: false
});
*/

/**
 * @property {Boolean} hui.startDebug 通过检测地址栏中startDebug=true参数确定是否开启调试模式
 */
hui.startDebug =
  window.location.href.indexOf("startDebug=true") !== -1 ? true : false;
/**
 * @method hui.showLog
 * @static
 * @description 弹出错误提示信息
 * @param {String} msg 错误提示信息
 * @example 
 * hui.showLog("Exception 'open failed: EACCES (Permission denied)'");
 */
hui.showLog =
  hui.showLog ||
  function(msg, opt) {
    hui.importCssString(
      [
        ".outputlog {position: fixed;z-index: 2000;width: 80%;height: 80%;left: 10%;top: 5%;word-break: break-all;}",
        ".outputlog .table {width: 100%;height: 100%;}",
        ".outputlog .td {vertical-align: middle;text-align: center;}",
        ".outputlog .text {font-weight:normal; display: inline-block;background-color: black;color: white;opacity: 0.75;padding: 1.5rem 1rem;border-radius: 10px;font-size: 1.3rem;}"
      ].join("")
    );

    opt = opt || {};
    var outputlog = document.getElementById("outputlog");
    if (!outputlog) {
      var str = '<div id="outputlog" class="outputlog"></div>';
      var node = document.createElement("DIV");
      node.innerHTML = str;
      for (var i = 0, len = node.children.length; i < len; i++) {
        document.documentElement.appendChild(node.children[i]);
      }
      node = undefined;
      outputlog = document.getElementById("outputlog");
    }

    if (outputlog) {
      var outputlog_txt = outputlog.getElementsByTagName("strong")[0];
      if (outputlog_txt) {
        outputlog_txt.innerHTML = msg;
      } else {
        outputlog.innerHTML = [
          '<table class="table"><tbody><tr><td class="td">',
          '<strong class="text">',
          msg,
          "</strong></td></tr></tbody></table></div>"
        ].join("");
      }
      outputlog.style.display = "block";
    }
    if (String(opt.time) !== "-1") {
      if (outputlog.timer) {
        window.clearTimeout(outputlog.timer);
      }
      outputlog.timer = window.setTimeout(function() {
        var a = document.getElementById("outputlog");
        if (a) a.style.display = "none";
        a.timer = null;
        if (opt.onclose) opt.onclose();
      }, opt.time || 3000);
    }
  };
hui.importCssString =
  hui.importCssString ||
  function importCssString(cssText, id) {
    var style = document.createElement("style");
    if (id) style.id = id;

    var head = document.head || document.body || document.documentElement;
    head.insertBefore(style, head.lastChild);
    if (head !== document.documentElement && style.nextSibling) {
      head.insertBefore(style.nextSibling, style);
    }
    style.setAttribute("type", "text/css");
    // all browsers, except IE before version 9
    if (style.styleSheet) style.styleSheet.cssText = cssText;
    else
      // Internet Explorer before version 9
      style.appendChild(document.createTextNode(cssText));

    return style;
  };

// 执行后续加载
if (!hui.loadNextLoaded) {
  hui.loadNextLoaded = true;

  hui.loadNextCallback = hui.loadNextCallback || [];
  for (var i = 0, len = hui.loadNextCallback.length; i < len; i++) {
    if (typeof hui.loadNextCallback[i] === "function")
      hui.loadNextCallback[i]();
  }
}

if (!hui.define) {
  /** 
     * @method hui.require
     * @description 请求需要的模块（和定义匿名模块类似）<br/>
     * Nodejs support 'require' and does not support 'define', browser does not supported both. 
     * @param {Array} n 依赖的模块
     * @param {Function} cb 模块构造器
     * @param {String} [asyc] 'syc': 立即加载依赖, '': 否 (默认)
     * @example 
     * hui.require(['jquery', 'button'], function () {
     *     console.log('This is anonymous module.');
     * });
     */
  // Nodejs support 'require' and does not support 'define', browser does not supported both.
  // hui.require(['jquery', 'button'], function(){})
  hui.require = function(n, cb, asyc) {
    if (!n) return;
    if (Object.prototype.toString.call(n) !== "[object Array]") {
      n = [n];
    }
    hui.define("", n, cb, "force", asyc);
  };
  /** 
     * @method hui.define
     * @description 定义模块，规则同CMD
     * @param {String} name 模块名称
     * @param {Array} deps 依赖的模块
     * @param {Function} fun 模块构造器
     * @param {String} [force] 'force': 强制覆盖, '': 否 (默认)
     * @param {String} [asyc] 'syc': 立即加载依赖, '': 否 (默认)
     * @example 
     * hui.define('hy_mod01', ['ext_md5'], function () {
     *     console.log('This is hy_mod01.');
     * });
     */
  hui.define = function(name, deps, fun, force, asyc) {
    if (force && name) hui.define.removeModule(name);
    if (!name || !hui.define.getModule(name)) {
      //Name missing. Allow for anonymous modules
      name = typeof name !== "string" ? "" : String(name).toLowerCase();
      deps = deps && deps.splice && deps.length ? deps : [];
      var left = [];
      for (var i = 0, len = deps.length; i < len; i++) {
        left.push(String(deps[i]).toLowerCase());
      }

      var conf = {
        name: name,
        depend: deps,
        left: left,
        todo: fun,
        loaded: false,
        exports: {},
        asyc: asyc
      };
      hui.define.modules.push(conf);

      hui.define.checkDepend();

      if (asyc === "syc" || hui.define_autoload !== false) {
        if (conf.left.length) hui.define.loadmod(conf.left);
      }
    }
  };
  // 注：模块源地址
  hui.define.source = "http://bpmjs.org/api/combo??";
  // 注：已通过<script>标签发送请求的模块
  hui.define.loadfile = [];
  // 注：请求成功返回但尚未初始化的模块
  hui.define.modules = [];
  // 注：执行初始化后的模块
  hui.define.parsed = [];
  // 注：是否自动加载依赖模块
  hui.define_autoload = hui.define_autoload === undefined ? false : true;

  // 注：加载模块
  hui.define.loadmod = function(n, conf) {
    var left = [];
    for (var i = 0; i < n.length; i++) {
      if (!hui.define.checkLoaded(n[i], conf)) {
        left.push(n[i]);
      }
    }
    if (!left.length) return;
    for (var i = 0, len = left.length; i < len; i++) {
      var m = left[i].split("@")[0].replace("./", "");
      for (var j = hui.sourcemap.length - 1; j > -1; j--) {
        if (!hui.sourcemap[j] || !hui.sourcemap[j].modules) continue;
        var list = hui.sourcemap[j].modules;
        for (var k in list) {
          if (!k || k.split("@")[0] !== m) continue;

          hui.define.loadfile.push(left[i]);
          var url = list[k];
          if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
            hui.loadjs(url);
          } else {
            hui.loadjs((hui.sourcemap[j].domain || "") + url);
          }
        }
      }
    }
  };
  hui.define.checkLoaded = function(n, conf) {
    var loaded = !!hui.define.getModule(n, conf);
    if (!loaded) {
      for (var i = 0, len = hui.define.loadfile.length; i < len; i++) {
        if (hui.define.loadfile[i].split("@")[0].replace("./", "") === n) {
          loaded = true;
          break;
        }
      }
    }
    return loaded;
  };

  hui.define.checkDepend = function() {
    hui.define.modules = hui.define.modules || [];
    // 注: 只能用倒序, 否则会碰到依赖项未定义的错误
    for (var i = hui.define.modules.length - 1; i > -1; i--) {
      var m = hui.define.modules[i];

      for (var j = 0, len2 = hui.define.parsed.length; j < len2; j++) {
        var n = hui.define.parsed[j];
        for (var k = m.left.length - 1; k > -1; k--) {
          if (m.left[k].replace("./", "").split("@")[0] == n) {
            m.left.splice(k, 1);
          }
        }
      }

      if (!m.loaded && m.left.length < 1) {
        m.loaded = true;
        // 放在前面未执行todo就放到loaded中了，会误触其他函数的todo，只能放在后面
        // [注: push放在这里则后面检测依赖只能用倒序，放在后面不好实现][有误]
        if (m.todo) m.todo(m.exports);
        // 放在todo前面有问题，依赖项刚加载还没来得及执行就触发了其他依赖此项的todo，会报依赖项未定义的错误
        if (m.name) hui.define.parsed.push(m.name);

        i = hui.define.modules.length;
      }
    }
  };

  hui.define.getModule = function(n) {
    n = n.split("@")[0].replace("./", "");
    var module = null;
    if (hui.define.modules) {
      for (var i = 0, len = hui.define.modules.length; i < len; i++) {
        if (hui.define.modules[i] && hui.define.modules[i].name === n) {
          module = hui.define.modules[i];
          break;
        }
      }
    }
    return module;
  };
  hui.define.removeModule = function(n) {
    var result = false;
    if (n) {
      n = n.split("@")[0].replace("./", "");
      if (hui.define.modules) {
        for (var i = 0, len = hui.define.modules.length; i < len; i++) {
          if (hui.define.modules[i] && hui.define.modules[i].name === n) {
            hui.define.modules.splice(i, 1);
            result = true;
            break;
          }
        }
      }
    }
    return result;
  };

  hui.define.checkLeft = function() {
    var left = [];
    var list = hui.define.modules;
    for (var i = 0, len = list.length; i < len; i++) {
      left = left.concat(hui.define.modules[i].left);
    }
    return left;
  };
  hui.define.loadLeft = function() {
    var left = hui.define.checkLeft();
    if (left) hui.define.loadmod(left);
  };
}

hui.define("ymt_core", [], function() {
  // !!! global.hui = ...
  hui.window = window; /*hui.bocument = document;//注：hui.bocument与document不相同!!*/
  hui.window.cc = [];

  /** 
     * @method hui.fn
     * @description 绑定方法执行时的this指向的对象
     * @param {Function|String} func 要绑定的函数，或者一个在作用域下可用的函数名
     * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
     * @param {} args 函数执行时附加到执行时函数前面的参数
     * @returns {Function} 封装后的函数
     * @example 
     * var a = {name:'Tom',age:16,say: function(){console.log('Tom aged ' + this.age)}};
     * a.say()
     * >> Tom aged 16
     * var b = {name:'Nancy',age:40};
     * b.say = a.say
     * b.say()
     * >> Tom aged 40
     * b.say = hui.fn(a.say, a);
     * b.say()
     * >> Tom aged 16
     */
  hui.fn = function(func, scope) {
    if (Object.prototype.toString.call(func) === "[object String]") {
      func = scope[func];
    }
    if (Object.prototype.toString.call(func) !== "[object Function]") {
      throw 'Error "hui.fn()": "func" is null';
    }
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function() {
      var fn =
          "[object String]" == Object.prototype.toString.call(func)
            ? scope[func]
            : func,
        args = xargs ? xargs.concat([].slice.call(arguments, 0)) : arguments;
      return fn.apply(scope || fn, args);
    };
  };

  /**
     * @method hui.inherits
     * @description 原型继承
     * @public
     * @param {Class} child 子类
     * @param {Class} parent 父类
     * @example 
     * hui.Form = function (options, pending) {
     *     //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
     *     hui.Form.superClass.call(this, options, 'pending');
     *     //进入控件处理主流程!
     *     if (pending != 'pending') {
     *         this.enterControl();
     *     }
     * };
     * hui.Form.prototype = {
     *     render: function () {
     *         hui.Form.superClass.prototype.render.call(this);
     *         //Todo...
     *     }
     * };
     * hui.inherits(hui.Form, hui.Control);
     */
  hui.inherits = function(child, parent) {
    var clazz = new Function();
    clazz.prototype = parent.prototype;

    var childProperty = child.prototype;
    child.prototype = new clazz();

    for (var key in childProperty) {
      if (childProperty.hasOwnProperty(key)) {
        child.prototype[key] = childProperty[key];
      }
    }

    child.prototype.constructor = child;

    //child是一个function
    //使用super在IE下会报错!!!
    child.superClass = parent;
  };

  /**
     * @method hui.extend
     * @description 对象扩展（伪继承）
     * @public
     * @param {Object} child 子对象
     * @param {Object} parent 父对象
     * @example 
     * var a = {a: 123};
     * var b = {b: 456};
     * var c = hui.extend({}, a, b);
     * console.log(c);
     * >> {a: 123, b: 456}
     * var d = {a: 789};
     * var c = hui.extend({}, a, b, d);
     * console.log(c);
     * >> {a: 789, b: 456}
     */
  hui.extend = function(src) {
    var obj,
      args = arguments;
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
     * @method hui.createClass
     * @description 创建组件类
     * @public
     * @param {Object} obj 原型对象
     * @example 
     * var Person = hui.createClass({constructor: function () {this.type = 'Person'}});
     * var Chinese = hui.createClass({constructor: function () {this.type = 'Chinese'}});
     * hui.inherits(Chinese, Person);
     * var American = hui.createClass({constructor: function () {this.type = 'American'},superClass: Person});
     * 
     * var aa = new Person();
     * console.log('aa = new Person(); console.log(aa instanceof Person) >> ' + (aa instanceof Person));
     * 
     * var bb = new Chinese();
     * console.log('bb = new Chinese(); console.log(bb instanceof Chinese) >> ' + (bb instanceof Chinese));
     * console.log('console.log(bb instanceof Person) >> ' + (bb instanceof Person));
     * 
     * var cc = new American();
     * console.log('cc = new American(); console.log(cc instanceof American) >> ' + (cc instanceof American));
     * console.log('console.log(cc instanceof Person) >> ' + (cc instanceof Person));
     */
  hui.createClass = function(obj) {
    obj = obj || {};
    var clazz = obj.hasOwnProperty("constructor")
      ? obj.constructor
      : function() {};
    clazz.prototype = obj;
    clazz.prototype.constructor = clazz;
    if (obj.superClass && typeof obj.superClass == "function")
      hui.inherits(clazz, obj.superClass);
    return clazz;
  };
  /**
     * @method hui.xhr
     * @description 发起ajax请求
     * @public
     * @param {Object} obj 请求参数
     * @example 
     * hui.xhr({
     *     url: '...', 
     *     [type: 'GET'], 
     *     [contentType: 'application/json'], 
     *     [responseType: 'json'],
     *     success: function (resDataJSON) {}
     * });
     */
  hui.xhr = function(opt) {
    opt = opt ? opt : {};
    var xhr = new XMLHttpRequest();
    xhr.open(opt.type || "GET", opt.url, true);
    xhr.setRequestHeader("Content-Type", opt.contentType || "application/json");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        if (opt.success && typeof opt.success == "function") {
          opt.success(
            !opt.responseType || opt.responseType == "json"
              ? Function("return " + xhr.responseText)()
              : xhr.responseText
          );
        }
      } else if (xhr.readyState == 4 && xhr.status != 200) {
        if (opt.error) opt.error(xhr.status);
      }
    };
    xhr.send(opt.body || JSON.stringify(opt.data) || "");
    return xhr;
  };
  /**
     * @method hui.jsonp
     * @description 发起jsonp请求
     * @public
     * @param {Object} obj 请求参数
     * @example 
     * hui.xhr({
     *     url: '...', 
     *     callback: 'jsonp1'
     * });
     */
  hui.jsonp = (function(i) {
    return function(opt) {
      var el = document.createElement("script");
      var callback = "";
      if (typeof opt.callback == "string") callback = opt.callback;
      else {
        while (window["jsonp" + ++i]) {}
        callback = "jsonp" + i;

        if (typeof opt.callback == "function") {
          window[callback] = function(res) {
            opt.callback(res);
            if (opt.success) opt.success(res);
          };
        } else {
          window[callback] = function(res) {
            if (opt.success) opt.success(res);
          };
        }
      }
      el.src =
        opt.url +
        (!opt.nocallback &&
          (opt.url.indexOf("?") > -1 ? "&" : "?") + "callback=" + callback);
      document.documentElement.appendChild(el);
    };
  })(0);
  /**
     * @method hui.parseLocator
     * @description 解析url
     * @public
     * @param {String} url URL地址
     * @param {String} args 参数 lower|upper|group
     * @example 
     * hui.parseLocator(window.location.href, 'lower');
     */
  hui.parseLocator = function(url, args) {
    url = url === null || url === undefined ? "" : String(url);
    var query = {},
      list,
      str;

    if (url.indexOf("?") !== -1) {
      list = url.split("?")[1].split("&");
      for (var i = 0, len = list.length; i < len; i++) {
        str = list[i].split("=");
        str.push("");

        var key = str[0];
        if (args && args.indexOf("lower") > -1)
          key = String(str[0]).toLowerCase();
        else if (args && args.indexOf("upper") > -1)
          key = String(str[0]).toUpperCase();

        if (args && args.indexOf("group") > -1) {
          if (query[key]) query[key].push(str[1]);
          else query[key] = [str[1]];
        } else query[key] = str[1];
      }

      for (var i in query) {
        if (query[i] && query[i].length === 1) {
          query[i] = query[i][0];
        }
      }
    }
    return query;
  };
  /**
     * @method hui.addParam
     * @description 拼接url参数
     * @public
     * @param {String} url URL地址
     * @param {Object} params 待拼接参数
     * @example 
     * hui.addParam(window.location.href, {a:123,b:456});
     * hui.addParam({a:123,b:456});
     */
  hui.addParam = function(url, params) {
    var sign = "";
    if (typeof url == "object" && !params) {
      params = url;
      url = "";
      sign = "join";
    }
    var list = hui.extend({}, params);
    for (var i in list) {
      try {
        decodeURIComponent(list[i]);
        list[i] = decodeURIComponent(list[i]);
      } catch (e) {}
      list[i] = encodeURIComponent(list[i]);
    }

    var SEARCH_REG = /\?([^#]*)/,
      HASH_REG = /#(.*)/;
    url = url || "";
    var search = {},
      searchMatch = url.match(SEARCH_REG),
      searchAttr = [],
      searchStr = "";

    if (searchMatch) search = hui.parseLocator(searchMatch[0]);
    search = hui.extend(search, list);

    for (var i in search) {
      if (search[i] === undefined) search[i] = "";
      searchAttr.push(i + "=" + search[i]);
    }

    if (searchAttr[0]) searchStr = "?" + searchAttr.join("&");

    //是否存在search
    if (SEARCH_REG.test(url)) url = url.replace(SEARCH_REG, searchStr);
    else {
      //是否存在hash
      if (HASH_REG.test(url)) {
        url = url.replace(HASH_REG, searchStr + "#" + url.match(HASH_REG)[1]);
      } else {
        url += searchStr;
      }
    }
    if (sign == "join") url = url.split("?")[1];
    return url;
  };

  /**
     * @method hui.delegate
     * @description 事件代理
     * @public
     * @param {String} parentSelector 外层容器
     * @param {String} eventType 事件类型
     * @param {String} selector 目标元素
     * @param {Function} fn 事件处理函数
     * @example 
     * var index = hui.delegate('body', 'click', 'button', function(){alert('click');});
     * hui.undelegate('body', 'click', index);
     */
  hui.delegate = function(parentSelector, eventType, selector, fn) {
    //参数处理
    if (typeof parentSelector !== "string")
      return hui.showLog(
        "delegate(parentSelector, eventType, selector, fn) -> [parentSelector] should be String"
      );
    if (typeof selector !== "string")
      return hui.showLog(
        "delegate(parent, eventType, selector, fn) -> [selector] should be String"
      );
    if (typeof fn !== "function")
      return hui.showLog(
        "delegate(parent, eventType, selector, fn) -> [fn] should be Function"
      );
    var parent = document.querySelector(parentSelector);
    if (!parent) return parent;

    hui.delegate.eventList = hui.delegate.eventList || {};
    hui.delegate.eventListIndex = hui.delegate.eventListIndex || 0;

    var handler = function(e) {
      var evt = window.event ? window.event : e;
      var target = evt.target || evt.srcElement;
      // 获取当前正在处理的事件源
      // 标准DOM方法是用currentTarget获取当前事件源
      // IE中的this指向当前处理的事件源
      // var currentTarget = e ? e.currentTarget : this;
      // 在IE 9下  window.event 与 e 不同 evt没有currentTarget属性,e才有currentTarg
      // return console.log("src id===" + target.id + "\n\ncurent target id==" + currentTarget.id);
      var elem = target;
      var plist = [];
      while (elem) {
        plist.push(elem);
        elem = elem.parentNode;
      }

      var list = document.querySelectorAll(parentSelector + " " + selector);
      for (var i = 0, len = list.length; i < len; i++) {
        var isEventTarget = false;
        for (var j = 0, len2 = plist.length; j < len2; j++) {
          if (plist[j] == list[i]) {
            isEventTarget = true;
            break;
          }
        }
        if (isEventTarget) fn.call(target);
      }
    };

    if (parent.addEventListener) {
      parent.addEventListener(eventType, handler, false);
    } else if (parent.attachEvent) {
      parent.attachEvent("on" + eventType, handler);
      // parent.attachEvent('on' + eventType, function(){handler.call(parent)});
      //此处使用回调函数call()，让 this指向parent //注释掉原因：无法解绑
    }
    hui.delegate.eventList[++hui.delegate.eventListIndex] = handler;
    fn.eventListIndex = hui.delegate.eventListIndex;
    return hui.delegate.eventListIndex;
  };

  hui.undelegate = function(parentSelector, eventType, eventListIndex) {
    if (typeof parentSelector !== "string")
      return hui.showLog(
        "undelegate(parentSelector, eventType, eventListIndex) -> [parentSelector] should be String"
      );
    var parent = document.querySelector(parentSelector);
    var handler = hui.delegate.eventList[eventListIndex];
    hui.delegate.eventList[eventListIndex] = null;
    try {
      delete hui.delegate.eventList[eventListIndex];
    } catch (e) {}
    if (!parent || !handler) return false;

    if (parent.removeEventListener) {
      return parent.removeEventListener(eventType, handler, false);
    } else if (parent.attachEvent) {
      return parent.detachEvent("on" + eventType, handler);
    }
  };

  /**
     * @method hui.format
     * @description 合并模板和数据
     * @public
     * @param {String} source 待格式化的字符串
     * @param {Object|Array} opts 要合并到字符串中的数据
     * @returns {String} 格式化之后的字符串
     * @example 
     * hui.format('Hello {{user}}', {user: 'Tom'});
     * >> Hello Tom
     */
  hui.format = function(source, opts) {
    var handler = function(match, key) {
      var type =
        String(key).indexOf("*") === 0
          ? "decode"
          : String(key).indexOf("!!") === 0 ? "" : "encode";
      var str = key
        .replace(/^!!/, "")
        .replace(/^\*/, "")
        .replace(/[\(\)]/g, "");
      if (hui.Template && hui.Template.overloadOperator) {
        str = hui.Template.overloadOperator(str);
      }

      var variable;
      if (!str.replace(/[0-9a-zA-Z\.]/g, "")) {
        var parts = str.split(".");
        var part = parts.shift();
        var cur = data;
        while (part) {
          if (cur[part] !== undefined) {
            cur = cur[part];
          } else {
            cur = undefined;
            break;
          }
          part = parts.shift();
        }
        variable = cur;
      } else {
        variable = Function("data", "with(data){return " + str + "}")(data);
      }
      // 加解码
      if (undefined !== variable) {
        variable = String(variable);
        // encodeURIComponent not encode '
        var fr = "&|<|>| |'|\"|\\".split("|"),
          to = "&amp;|&lt;|&gt;|&nbsp;|&prime;|&quot;|&#92;".split("|");
        if (type === "decode") {
          for (var i = fr.length - 1; i > -1; i--) {
            variable = variable.replace(new RegExp("\\" + to[i], "ig"), fr[i]);
          }
        } else if (type === "encode") {
          for (var i = 0, l = fr.length; i < l; i++) {
            variable = variable.replace(new RegExp("\\" + fr[i], "ig"), to[i]);
          }
        }
      }

      return undefined === variable ? "" : variable;
    };

    source = String(source);
    var data = Array.prototype.slice.call(arguments, 1);
    var toString = Object.prototype.toString;
    if (data.length) {
      data =
        data.length == 1
          ? /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            opts !== null &&
            /\[object (Array|Object)\]/.test(toString.call(opts))
            ? opts
            : data
          : data;

      return source
        .replace(/#\{(.+?)\}/g, handler)
        .replace(/\{\{([^\{]+?)\}\}/g, handler);
    }
    return source;
  };

  /**
     * @method hui.formatDate
     * @description 将Date类型解析为String类型. 
     * @param {Date} date 输入的日期
     * @param {String} fmt 输出日期格式
     * @example
     * hui.formatDate(new Date(2006,0,1), 'yyyy-MM-dd HH:mm');
     */
  hui.formatDate = function(date, fmt) {
    if (!date) date = new Date();
    fmt = fmt || "yyyy-MM-dd HH:mm:ss";
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
      "H+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    };
    var week = {
      "0": "/u65e5",
      "1": "/u4e00",
      "2": "/u4e8c",
      "3": "/u4e09",
      "4": "/u56db",
      "5": "/u4e94",
      "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    if (/(E+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (RegExp.$1.length > 1
          ? RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468"
          : "") + week[date.getDay() + ""]
      );
    }
    for (var k in o) {
      if (o.hasOwnProperty(k) && new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };
  /**
     * @method hui.parseDate
     * @description 将String类型解析为Date类型.  
     * @param {String} fmt 输入的字符串格式的日期
     * @example
     * parseDate('2006-1-1') return new Date(2006,0,1)  
     * parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
     * parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
     * parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
     * parseDate('不正确的格式') retrun null  
     */
  hui.parseDate = function(str) {
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/gi, "");
    var results = null;

    //秒数 #9744242680
    results = str.match(/^ *(\d{10}) *$/);
    if (results && results.length > 0)
      return new Date(parseInt(str, 10) * 1000);

    //毫秒数 #9744242682765
    results = str.match(/^ *(\d{13}) *$/);
    if (results && results.length > 0) return new Date(parseInt(str, 10));

    //20110608
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);
    if (results && results.length > 3)
      return new Date(
        parseInt(results[1], 10),
        parseInt(results[2], 10) - 1,
        parseInt(results[3], 10)
      );

    //20110608 1010
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);
    if (results && results.length > 5)
      return new Date(
        parseInt(results[1], 10),
        parseInt(results[2], 10) - 1,
        parseInt(results[3], 10),
        parseInt(results[4], 10),
        parseInt(results[5], 10)
      );

    //2011-06-08
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/
    );
    if (results && results.length > 3)
      return new Date(
        parseInt(results[1], 10),
        parseInt(results[2], 10) - 1,
        parseInt(results[3], 10)
      );

    //2011-06-08 10:10
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/
    );
    if (results && results.length > 5)
      return new Date(
        parseInt(results[1], 10),
        parseInt(results[2], 10) - 1,
        parseInt(results[3], 10),
        parseInt(results[4], 10),
        parseInt(results[5], 10)
      );

    //2011/06\\08 10:10:10
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/
    );
    if (results && results.length > 6)
      return new Date(
        parseInt(results[1], 10),
        parseInt(results[2], 10) - 1,
        parseInt(results[3], 10),
        parseInt(results[4], 10),
        parseInt(results[5], 10),
        parseInt(results[6], 10)
      );

    return new Date(str);
  };
});

("::jweixin::");
("use strict");
!(function(a, b) {
  "function" == typeof define && (define.amd || define.cmd)
    ? define(function() {
        return b(a);
      })
    : b(a, !0);
})(this, function(a, b) {
  function c(b, c, d) {
    a.WeixinJSBridge
      ? WeixinJSBridge.invoke(b, e(c), function(a) {
          g(b, a, d);
        })
      : j(b, d);
  }
  function d(b, c, d) {
    a.WeixinJSBridge
      ? WeixinJSBridge.on(b, function(a) {
          d && d.trigger && d.trigger(a), g(b, a, c);
        })
      : d ? j(b, d) : j(b, c);
  }
  function e(a) {
    return (a =
      a ||
      {}), (a.appId = z.appId), (a.verifyAppId = z.appId), (a.verifySignType = "sha1"), (a.verifyTimestamp = z.timestamp + ""), (a.verifyNonceStr = z.nonceStr), (a.verifySignature = z.signature), a;
  }
  function f(a) {
    return {
      timeStamp: a.timestamp + "",
      nonceStr: a.nonceStr,
      package: a.package,
      paySign: a.paySign,
      signType: a.signType || "SHA1"
    };
  }
  function g(a, b, c) {
    var d, e, f;
    switch ((
      delete b.err_code,
      delete b.err_desc,
      delete b.err_detail,
      (d = b.errMsg),
      d ||
        ((d = b.err_msg), delete b.err_msg, (d = h(a, d, c)), (b.errMsg = d)),
      (c = c || {}),
      c._complete && (c._complete(b), delete c._complete),
      (d = b.errMsg || ""),
      z.debug && !c.isInnerInvoke && alert(JSON.stringify(b)),
      (e = d.indexOf(":")),
      (f = d.substring(e + 1))
    )) {
      case "ok":
        c.success && c.success(b);
        break;
      case "cancel":
        c.cancel && c.cancel(b);
        break;
      default:
        c.fail && c.fail(b);
    }
    c.complete && c.complete(b);
  }
  function h(a, b) {
    var d, e, f, g;
    if (b) {
      switch (((d = b.indexOf(":")), a)) {
        case o.config:
          e = "config";
          break;
        case o.openProductSpecificView:
          e = "openProductSpecificView";
          break;
        default:
          (e = b.substring(0, d)), (e = e.replace(
            /_/g,
            " "
          )), (e = e.replace(/\b\w+\b/g, function(a) {
            return a.substring(0, 1).toUpperCase() + a.substring(1);
          })), (e =
            e.substring(0, 1).toLowerCase() + e.substring(1)), (e = e.replace(
            / /g,
            ""
          )), -1 != e.indexOf("Wcpay") &&
            (e = e.replace("Wcpay", "WCPay")), (f = p[e]), f && (e = f);
      }
      (g = b.substring(d + 1)), "confirm" == g && (g = "ok"), "failed" == g &&
        (g = "fail"), -1 != g.indexOf("failed_") && (g = g.substring(7)), -1 !=
        g.indexOf("fail_") && (g = g.substring(5)), (g = g.replace(
        /_/g,
        " "
      )), (g = g.toLowerCase()), ("access denied" == g ||
        "no permission to execute" == g) &&
        (g = "permission denied"), "config" == e &&
        "function not exist" == g &&
        (g = "ok"), (b = e + ":" + g);
    }
    return b;
  }
  function i(a) {
    var b, c, d, e;
    if (a) {
      for (b = 0, c = a.length; c > b; ++b)
        (d = a[b]), (e = o[d]), e && (a[b] = e);
      return a;
    }
  }
  function j(a, b) {
    if (!(!z.debug || (b && b.isInnerInvoke))) {
      var c = p[a];
      c && (a = c), b && b._complete && delete b._complete, console.log(
        '"' + a + '",',
        b || ""
      );
    }
  }
  function k() {
    if (!("6.0.2" > w || y.systemType < 0)) {
      var b = new Image();
      (y.appId = z.appId), (y.initTime =
        x.initEndTime - x.initStartTime), (y.preVerifyTime =
        x.preVerifyEndTime - x.preVerifyStartTime), C.getNetworkType({
        isInnerInvoke: !0,
        success: function(a) {
          y.networkType = a.networkType;
          var c =
            "https://open.weixin.qq.com/sdk/report?v=" +
            y.version +
            "&o=" +
            y.isPreVerifyOk +
            "&s=" +
            y.systemType +
            "&c=" +
            y.clientVersion +
            "&a=" +
            y.appId +
            "&n=" +
            y.networkType +
            "&i=" +
            y.initTime +
            "&p=" +
            y.preVerifyTime +
            "&u=" +
            y.url;
          b.src = c;
        }
      });
    }
  }
  function l() {
    return new Date().getTime();
  }
  function m(b) {
    t &&
      (a.WeixinJSBridge
        ? b()
        : q.addEventListener &&
          q.addEventListener("WeixinJSBridgeReady", b, !1));
  }
  function n() {
    C.invoke ||
      (
        (C.invoke = function(b, c, d) {
          a.WeixinJSBridge && WeixinJSBridge.invoke(b, e(c), d);
        }),
        (C.on = function(b, c) {
          a.WeixinJSBridge && WeixinJSBridge.on(b, c);
        })
      );
  }
  var o, p, q, r, s, t, u, v, w, x, y, z, A, B, C;
  if (!a.jWeixin)
    return (o = {
      config: "preVerifyJSAPI",
      onMenuShareTimeline: "menu:share:timeline",
      onMenuShareAppMessage: "menu:share:appmessage",
      onMenuShareQQ: "menu:share:qq",
      onMenuShareWeibo: "menu:share:weiboApp",
      onMenuShareQZone: "menu:share:QZone",
      previewImage: "imagePreview",
      getLocation: "geoLocation",
      openProductSpecificView: "openProductViewWithPid",
      addCard: "batchAddCard",
      openCard: "batchViewCard",
      chooseWXPay: "getBrandWCPayRequest"
    }), (p = (function() {
      var b,
        a = {};
      for (b in o) a[o[b]] = b;
      return a;
    })()), (q = a.document), (r =
      q.title), (s = navigator.userAgent.toLowerCase()), (t =
      -1 != s.indexOf("micromessenger")), (u = -1 != s.indexOf("android")), (v =
      -1 != s.indexOf("iphone") || -1 != s.indexOf("ipad")), (w = (function() {
      var a =
        s.match(/micromessenger\/(\d+\.\d+\.\d+)/) ||
        s.match(/micromessenger\/(\d+\.\d+)/);
      return a ? a[1] : "";
    })()), (x = {
      initStartTime: l(),
      initEndTime: 0,
      preVerifyStartTime: 0,
      preVerifyEndTime: 0
    }), (y = {
      version: 1,
      appId: "",
      initTime: 0,
      preVerifyTime: 0,
      networkType: "",
      isPreVerifyOk: 1,
      systemType: v ? 1 : u ? 2 : -1,
      clientVersion: w,
      url: encodeURIComponent(location.href)
    }), (z = {}), (A = { _completes: [] }), (B = {
      state: 0,
      res: {}
    }), m(function() {
      x.initEndTime = l();
    }), (C = {
      config: function(a) {
        (z = a), j("config", a);
        var b = z.check === !1 ? !1 : !0;
        m(function() {
          var a, d, e;
          if (b)
            c(
              o.config,
              { verifyJsApiList: i(z.jsApiList) },
              (function() {
                (A._complete = function(a) {
                  (x.preVerifyEndTime = l()), (B.state = 1), (B.res = a);
                }), (A.success = function() {
                  y.isPreVerifyOk = 0;
                }), (A.fail = function(a) {
                  A._fail ? A._fail(a) : (B.state = -1);
                });
                var a = A._completes;
                return a.push(function() {
                  z.debug || k();
                }), (A.complete = function() {
                  for (var c = 0, d = a.length; d > c; ++c) a[c]();
                  A._completes = [];
                }), A;
              })()
            ), (x.preVerifyStartTime = l());
          else {
            for (B.state = 1, a = A._completes, d = 0, e = a.length; e > d; ++d)
              a[d]();
            A._completes = [];
          }
        }), z.beta && n();
      },
      ready: function(a) {
        0 != B.state ? a() : (A._completes.push(a), !t && z.debug && a());
      },
      error: function(a) {
        "6.0.2" > w || (-1 == B.state ? a(B.res) : (A._fail = a));
      },
      checkJsApi: function(a) {
        var b = function(a) {
          var c,
            d,
            b = a.checkResult;
          for (c in b) (d = p[c]), d && ((b[d] = b[c]), delete b[c]);
          return a;
        };
        c(
          "checkJsApi",
          { jsApiList: i(a.jsApiList) },
          (function() {
            return (a._complete = function(a) {
              if (u) {
                var c = a.checkResult;
                c && (a.checkResult = JSON.parse(c));
              }
              a = b(a);
            }), a;
          })()
        );
      },
      onMenuShareTimeline: function(a) {
        d(
          o.onMenuShareTimeline,
          {
            complete: function() {
              c(
                "shareTimeline",
                {
                  title: a.title || r,
                  desc: a.title || r,
                  img_url: a.imgUrl || "",
                  link: a.link || location.href
                },
                a
              );
            }
          },
          a
        );
      },
      onMenuShareAppMessage: function(a) {
        d(
          o.onMenuShareAppMessage,
          {
            complete: function() {
              c(
                "sendAppMessage",
                {
                  title: a.title || r,
                  desc: a.desc || "",
                  link: a.link || location.href,
                  img_url: a.imgUrl || "",
                  type: a.type || "link",
                  data_url: a.dataUrl || ""
                },
                a
              );
            }
          },
          a
        );
      },
      onMenuShareQQ: function(a) {
        d(
          o.onMenuShareQQ,
          {
            complete: function() {
              c(
                "shareQQ",
                {
                  title: a.title || r,
                  desc: a.desc || "",
                  img_url: a.imgUrl || "",
                  link: a.link || location.href
                },
                a
              );
            }
          },
          a
        );
      },
      onMenuShareWeibo: function(a) {
        d(
          o.onMenuShareWeibo,
          {
            complete: function() {
              c(
                "shareWeiboApp",
                {
                  title: a.title || r,
                  desc: a.desc || "",
                  img_url: a.imgUrl || "",
                  link: a.link || location.href
                },
                a
              );
            }
          },
          a
        );
      },
      onMenuShareQZone: function(a) {
        d(
          o.onMenuShareQZone,
          {
            complete: function() {
              c(
                "shareQZone",
                {
                  title: a.title || r,
                  desc: a.desc || "",
                  img_url: a.imgUrl || "",
                  link: a.link || location.href
                },
                a
              );
            }
          },
          a
        );
      },
      startRecord: function(a) {
        c("startRecord", {}, a);
      },
      stopRecord: function(a) {
        c("stopRecord", {}, a);
      },
      onVoiceRecordEnd: function(a) {
        d("onVoiceRecordEnd", a);
      },
      playVoice: function(a) {
        c("playVoice", { localId: a.localId }, a);
      },
      pauseVoice: function(a) {
        c("pauseVoice", { localId: a.localId }, a);
      },
      stopVoice: function(a) {
        c("stopVoice", { localId: a.localId }, a);
      },
      onVoicePlayEnd: function(a) {
        d("onVoicePlayEnd", a);
      },
      uploadVoice: function(a) {
        c(
          "uploadVoice",
          {
            localId: a.localId,
            isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1
          },
          a
        );
      },
      downloadVoice: function(a) {
        c(
          "downloadVoice",
          {
            serverId: a.serverId,
            isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1
          },
          a
        );
      },
      translateVoice: function(a) {
        c(
          "translateVoice",
          {
            localId: a.localId,
            isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1
          },
          a
        );
      },
      chooseImage: function(a) {
        c(
          "chooseImage",
          {
            scene: "1|2",
            count: a.count || 9,
            sizeType: a.sizeType || ["original", "compressed"],
            sourceType: a.sourceType || ["album", "camera"]
          },
          (function() {
            return (a._complete = function(a) {
              if (u) {
                var b = a.localIds;
                b && (a.localIds = JSON.parse(b));
              }
            }), a;
          })()
        );
      },
      previewImage: function(a) {
        c(o.previewImage, { current: a.current, urls: a.urls }, a);
      },
      uploadImage: function(a) {
        c(
          "uploadImage",
          {
            localId: a.localId,
            isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1
          },
          a
        );
      },
      downloadImage: function(a) {
        c(
          "downloadImage",
          {
            serverId: a.serverId,
            isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1
          },
          a
        );
      },
      getNetworkType: function(a) {
        var b = function(a) {
          var c,
            d,
            e,
            b = a.errMsg;
          if (
            (
              (a.errMsg = "getNetworkType:ok"),
              (c = a.subtype),
              delete a.subtype,
              c
            )
          )
            a.networkType = c;
          else
            switch (((d = b.indexOf(":")), (e = b.substring(d + 1)))) {
              case "wifi":
              case "edge":
              case "wwan":
                a.networkType = e;
                break;
              default:
                a.errMsg = "getNetworkType:fail";
            }
          return a;
        };
        c(
          "getNetworkType",
          {},
          (function() {
            return (a._complete = function(a) {
              a = b(a);
            }), a;
          })()
        );
      },
      openLocation: function(a) {
        c(
          "openLocation",
          {
            latitude: a.latitude,
            longitude: a.longitude,
            name: a.name || "",
            address: a.address || "",
            scale: a.scale || 28,
            infoUrl: a.infoUrl || ""
          },
          a
        );
      },
      getLocation: function(a) {
        (a = a || {}), c(
          o.getLocation,
          { type: a.type || "wgs84" },
          (function() {
            return (a._complete = function(a) {
              delete a.type;
            }), a;
          })()
        );
      },
      hideOptionMenu: function(a) {
        c("hideOptionMenu", {}, a);
      },
      showOptionMenu: function(a) {
        c("showOptionMenu", {}, a);
      },
      closeWindow: function(a) {
        (a = a || {}), c(
          "closeWindow",
          { immediate_close: a.immediateClose || 0 },
          a
        );
      },
      hideMenuItems: function(a) {
        c("hideMenuItems", { menuList: a.menuList }, a);
      },
      showMenuItems: function(a) {
        c("showMenuItems", { menuList: a.menuList }, a);
      },
      hideAllNonBaseMenuItem: function(a) {
        c("hideAllNonBaseMenuItem", {}, a);
      },
      showAllNonBaseMenuItem: function(a) {
        c("showAllNonBaseMenuItem", {}, a);
      },
      scanQRCode: function(a) {
        (a = a || {}), c(
          "scanQRCode",
          {
            needResult: a.needResult || 0,
            scanType: a.scanType || ["qrCode", "barCode"]
          },
          (function() {
            return (a._complete = function(a) {
              var b, c;
              v &&
                (
                  (b = a.resultStr),
                  b &&
                    (
                      (c = JSON.parse(b)),
                      (a.resultStr =
                        c && c.scan_code && c.scan_code.scan_result)
                    )
                );
            }), a;
          })()
        );
      },
      openProductSpecificView: function(a) {
        c(
          o.openProductSpecificView,
          { pid: a.productId, view_type: a.viewType || 0, ext_info: a.extInfo },
          a
        );
      },
      addCard: function(a) {
        var e,
          f,
          g,
          h,
          b = a.cardList,
          d = [];
        for (e = 0, f = b.length; f > e; ++e)
          (g = b[e]), (h = { card_id: g.cardId, card_ext: g.cardExt }), d.push(
            h
          );
        c(
          o.addCard,
          { card_list: d },
          (function() {
            return (a._complete = function(a) {
              var c,
                d,
                e,
                b = a.card_list;
              if (b) {
                for (b = JSON.parse(b), c = 0, d = b.length; d > c; ++c)
                  (e = b[c]), (e.cardId = e.card_id), (e.cardExt =
                    e.card_ext), (e.isSuccess = e.is_succ
                    ? !0
                    : !1), delete e.card_id, delete e.card_ext, delete e.is_succ;
                (a.cardList = b), delete a.card_list;
              }
            }), a;
          })()
        );
      },
      chooseCard: function(a) {
        c(
          "chooseCard",
          {
            app_id: z.appId,
            location_id: a.shopId || "",
            sign_type: a.signType || "SHA1",
            card_id: a.cardId || "",
            card_type: a.cardType || "",
            card_sign: a.cardSign,
            time_stamp: a.timestamp + "",
            nonce_str: a.nonceStr
          },
          (function() {
            return (a._complete = function(a) {
              (a.cardList = a.choose_card_info), delete a.choose_card_info;
            }), a;
          })()
        );
      },
      openCard: function(a) {
        var e,
          f,
          g,
          h,
          b = a.cardList,
          d = [];
        for (e = 0, f = b.length; f > e; ++e)
          (g = b[e]), (h = { card_id: g.cardId, code: g.code }), d.push(h);
        c(o.openCard, { card_list: d }, a);
      },
      chooseWXPay: function(a) {
        c(o.chooseWXPay, f(a), a);
      }
    }), b && (a.wx = a.jWeixin = C), C;
});

window.hui && hui.define && hui.define("jweixin", [], function() {});
//add by xujian
(function() {
  var initialize = false;
  var configData;
  var configIsValid = false;
  var readyCallback = function() {
    var callback = readyCallback._que.shift();
    while (callback) {
      if (typeof callback === "function") callback();
      callback = readyCallback._que.shift();
    }
  };
  var ymt = (window.ymt = {
    initCallback: initCallback,
    config: config,
    ready: ready,
    test: test,
    //基础接口
    enterPage: enterPage,
    closeWin: closeWin,
    openWin: openWin,
    titleBar: titleBar,
    bottomBar: bottomBar,
    pageRefreshType: pageRefreshType,
    attach: attach,
    orderCenter: orderCenter,
    //用户接口
    userLogin: userLogin,
    getLoginStatus: getLoginStatus,
    getUserInfo: getUserInfo,
    uploadUserIcon: uploadUserIcon,
    interestMap: interestMap,
    //图像接口
    chooseImage: chooseImage,
    uploadImage: uploadImage,
    //支付接口
    pay: pay,
    order: order,
    orderPackage: orderPackage,
    notifyPay: notifyPay,
    orderDetail: orderDetail,
    withdraw: withdraw,
    //分享接口
    share: share,
    shareWith: shareWith,
    //评论接口
    comment: comment,
    replyComment: replyComment,
    //日记接口
    noteDetail: noteDetail,
    publishNote: publishNote,
    noteFansList: noteFansList,
    activityPartnerList: activityPartnerList,
    noteBrand: noteBrand,
    noteType: noteType,
    countryList: countryList,
    fansUserList: fansUserList,
    followUserList: followUserList,
    //消息接口
    showMsgIcon: showMsgIcon,
    onlineService: onlineService,
    openChat: openChat,
    // 订阅日历
    calendarEvent: calendarEvent,
    //业务接口
    liveDetail: liveDetail,
    productDetail: productDetail,
    tabHome: tabHome,
    feedBack: feedBack,
    contactBook: contactBook,
    bindMobile: bindMobile,
    couponProducts: couponProducts,
    similarProduct: similarProduct,
    similarTopic: similarTopic,
    search: search,
    promotionProduct: promotionProduct,
    topicDetail: topicDetail,
    topicList: topicList,
    //事件接口
    listenPageEvent: listenPageEvent,
    notifyEvent: notifyEvent,
    //系统接口
    getDeviceInfo: getDeviceInfo,
    callPhone: callPhone,
    screenShot: screenShot,
    getNetworkType: getNetworkType,
    clipboard: clipboard,
    //监控接口
    sendUmengLog: sendUmengLog,
    sendYLog: sendYLog,
    command: command,
    registEvent: registEvent,
    scrollEvent: scrollEvent
  });

  readyCallback._que = []; // manage ready callback event

  function registBridge() {
    var iframe = document.getElementById("initIframe");
    if (iframe) {
      initCallback();
      return true;
    }
    iframe = document.createElement("iframe");
    iframe.id = "initIframe";
    iframe.style.display = "none";
    iframe.src = "ymtapi://init/";
    document.documentElement.appendChild(iframe);
    return false;
  }

  // wait for bridge object injected
  function prepare(callback) {
    if (window.WebViewJavascriptBridge) {
      callback();
    } else {
      document.addEventListener(
        "WebViewJavascriptBridgeReady",
        function() {
          callback();
        },
        false
      );
    }
  }

  // invoke native methods
  function execute(method, data, callback) {
    // send to default handler via window.WebViewJavascriptBridge.send
    window.WebViewJavascriptBridge.callHandler(method, data, function(result) {
      callback(result);
    });
  }

  //无通用回调
  function execute2(method, data) {
    if (!isValid()) return;
    window.WebViewJavascriptBridge.callHandler2(method, data);
  }

  //配置化完成后，执行Ready设置的回调(如果ready没有执行过)
  function config(data) {
    configData = data;
    registBridge();
  }

  // 调用底层方法，在底层完成config状态检测，执行回调(如果config没有执行过)
  function ready(callback) {
    if (initialize) callback();
    else readyCallback._que.push(callback);
  }

  function initCallback() {
    prepare(function() {
      WebViewJavascriptBridge.debug = configData.debug;
      initialize = true;
      configIsValid = true;
      readyCallback();
      /*
            execute('config', configData, function(result){
                if(result.code == 1) {
                    configIsValid = true;
                    readyCallback();
                }
            });*/
      //set as a default js message handler
      window.WebViewJavascriptBridge.init(function(
        message,
        responseCallback
      ) {});
    });
  }

  // check the valid invoke status, when any api method invoked
  function isValid() {
    var ret = true;
    if (!initialize) ret = false;
    if (!configIsValid) ret = false;

    if (!ret) {
      alert("bridge module hasn't been initialized.");
      return ret;
    }
    var domain = window.location.host;
    if (domain.indexOf("ymatou.com") == -1) {
      //alert("对不起，你没有调用权限，请联系管理员.");
      //return false;
    }
    return ret;
  }

  function test(data) {
    execute2("test", data);
  }

  function closeWin() {
    execute2("closeWin", "");
  }

  function openWin(data) {
    execute2("openWin", data);
  }

  function titleBar(data) {
    execute2("titleBar", data);
  }

  function bottomBar(data) {
    execute2("bottomBar", data);
  }

  function pageRefreshType(data) {
    execute2("pageRefreshType", data);
  }

  function attach(data) {
    execute2("attach", data);
  }

  function orderCenter(data) {
    execute2("orderCenter", data);
  }

  function userLogin() {
    execute2("userLogin", "");
  }

  function getLoginStatus(data) {
    execute2("getLoginStatus", data);
  }

  function getUserInfo(data) {
    execute2("getUserInfo", data);
  }

  function uploadUserIcon(data) {
    execute2("uploadUserIcon", data);
  }

  function interestMap() {
    execute2("interestMap", "");
  }

  function chooseImage(data) {
    execute2("chooseImage", data);
  }

  function uploadImage(data) {
    execute2("uploadImage", data);
  }

  function pay(data) {
    execute2("pay", data);
  }

  function order(data) {
    execute2("order", data);
  }

  function orderDetail(data) {
    execute2("orderDetail", data);
  }

  function orderPackage(data) {
    execute2("orderPackage", data);
  }

  function withdraw() {
    execute2("withdraw", "");
  }

  function notifyPay(data) {
    execute2("notifyPay", data);
  }

  function share(data) {
    execute2("share", data);
  }

  function shareWith(data) {
    execute2("shareWith", data);
  }

  function comment(data) {
    execute2("comment", data);
  }

  function replyComment(data) {
    execute2("replyComment", data);
  }

  function noteDetail(data) {
    execute2("noteDetail", data);
  }

  function publishNote(data) {
    execute2("publishNote", data);
  }

  function noteFansList(data) {
    execute2("noteFansList", data);
  }

  function activityPartnerList(data) {
    execute2("activityPartnerList", data);
  }

  function noteBrand() {
    execute2("noteBrand", "");
  }

  function noteType(data) {
    execute2("noteType", data);
  }

  function countryList() {
    execute2("countryList", "");
  }

  function followUserList(data) {
    execute2("followUserList", data);
  }

  function fansUserList(data) {
    execute2("fansUserList", data);
  }

  function showMsgIcon() {
    execute2("showMsgIcon", "");
  }

  function onlineService() {
    execute2("onlineService", "");
  }

  function openChat(data) {
    execute2("openChat", data);
  }

  function liveDetail(data) {
    execute2("liveDetail", data);
  }

  function calendarEvent(data) {
    execute2("calendarEvent", data);
  }

  function enterPage(data) {
    execute2("enterPage", data);
  }

  function productDetail(data) {
    execute2("productDetail", data);
  }

  function tabHome(data) {
    execute2("tabHome", data);
  }

  function feedBack() {
    execute2("feedBack", "");
  }

  function contactBook() {
    execute2("contactBook", "");
  }

  function bindMobile(data) {
    execute2("bindMobile", data);
  }

  function couponProducts(data) {
    execute2("couponProducts", data);
  }

  function similarProduct(data) {
    execute2("similarProduct", data);
  }

  function similarTopic(data) {
    execute2("similarTopic", data);
  }

  function search(data) {
    execute2("search", data);
  }

  function promotionProduct(data) {
    execute2("promotionProduct", data);
  }

  function topicList(data) {
    execute2("topicList", data);
  }

  function topicDetail(data) {
    execute2("topicDetail", data);
  }

  function listenPageEvent(data) {
    execute2("listenPageEvent", data);
  }

  function notifyEvent(data) {
    execute2("notifyEvent", data);
  }

  function getDeviceInfo(data) {
    execute2("getDeviceInfo", data);
  }

  function callPhone(data) {
    execute2("callPhone", data);
  }

  function screenShot(data) {
    execute2("screenShot", data);
  }

  function getNetworkType(data) {
    execute2("getNetworkType", data);
  }

  function clipboard(data) {
    execute2("clipboard", data);
  }

  function sendUmengLog(data) {
    execute2("sendUmengLog", data);
  }

  function sendYLog(data) {
    execute2("sendYLog", data);
  }

  function registEvent(data) {
    execute2("registEvent", data);
  }

  function scrollEvent(data) {
    execute2("scrollEvent", data);
  }

  function command(name, data) {
    execute2(name, data);
  }
})();

/* global wx,window,hui,ymt,define */
("::ymtapi::");
("use strict");
//   __    __           ______   ______  _____    __  __
//  /\ \  /\ \ /'\_/`\ /\  _  \ /\__  _\/\  __`\ /\ \/\ \
//  \ `\`\\/'//\      \\ \ \/\ \\/_/\ \/\ \ \/\ \\ \ \ \ \
//   `\ `\ /' \ \ \__\ \\ \  __ \  \ \ \ \ \ \ \ \\ \ \ \ \
//     `\ \ \  \ \ \_/\ \\ \ \/\ \  \ \ \ \ \ \_\ \\ \ \_\ \
//       \ \_\  \ \_\\ \_\\ \_\ \_\  \ \_\ \ \_____\\ \_____\
//        \/_/   \/_/ \/_/ \/_/\/_/   \/_/  \/_____/ \/_____/
//
//

/**
 * @namespace YmtApi
 * @description YmtApi是h5与原生native交互的协议及工具
 * @version v2.0.0
 * @public
 * @author haiyang5210
 * @since 2015-06-25 10:48
 */

window.hui = window.hui ? window.hui : {};

hui.EventDispatcher = function() {
  this._listeners = {};
};
hui.EventDispatcher.prototype = {
  /**
     * @method on
     * @description 添加监听器
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
  on: function(eventType, listener) {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    var list = this._listeners[eventType],
      exist = false,
      index;

    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] === listener) {
        exist = true;
        index = i;
        break;
      }
    }
    if (!exist) {
      this._listeners[eventType].push(listener);
      index = this._listeners[eventType].length - 1;
    }
    return index;
  },

  /**
     * @method one
     * @description 添加一次性监听器
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
  one: function(eventType, listener) {
    function handler() {
      YmtApi.off(eventType, index);

      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      listener.apply(YmtApi, args);
    }
    var index = YmtApi.on(eventType, handler);
    return index;
  },

  /**
     * @method off
     * @description 移除监听器
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
  off: function(eventType, listener) {
    if (!this._listeners[eventType]) {
      return;
    }
    var list = this._listeners[eventType];

    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] === listener || i === listener) {
        this._listeners[eventType][i] = undefined;
        break;
      }
    }
    if (listener === undefined) {
      this._listeners[eventType] = [];
    }
  },
  /**
     * @method clear
     * @description 清除所有监听器
     * @public
     */
  clear: function(eventType) {
    // 清除全部
    if (!eventType) {
      this._listeners = [];
    } else if (this._listeners[eventType]) {
      // 只清除指定类型
      this._listeners[eventType] = [];
    } else if (Object.prototype.toString.call(eventType) === "[object Array]") {
      for (var i = 0, len = eventType.length; i < len; i++) {
        this.clear(eventType[i]);
      }
    }
  },
  /**
     * @method trigger
     * @description 触发事件
     * @public
     * @param {String} eventType 事件类型.
     */
  trigger: function(eventType) {
    if (!this._listeners[eventType]) {
      return;
    }
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    var list = this._listeners[eventType];
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i]) {
        list[i].apply(this, args);
      }
    }
  }
};
hui.EventDispatcher.prototype.constructor = hui.EventDispatcher;

window.YmtApi = window.YmtApi || {};
var YmtApi = window.YmtApi;

var obj = new hui.EventDispatcher();
for (var i in obj) {
  YmtApi[i] = obj[i];
}

YmtApi.version = "2.6.0";

var ua = window.navigator.userAgent;
YmtApi.isWechat = /MicroMessenger/i.test(ua);
YmtApi.isWeibo = /WeiBo/i.test(ua);
YmtApi.isAlipay = /Alipay/i.test(ua);
YmtApi.isSaohuoApp = /saohuoApp/i.test(ua);
YmtApi.isSellerApp = /sellerApp/i.test(ua);
// shareSource: 'ymtapp', 'saohuoApp'

YmtApi.OPERATORS = {
  GREATER:0, // 大于
  EQUAL:1, // 等于
  LESS:2  // 小于
}
// valid version should at least contain 2 digits seperated by '.'
// e.g "3.10" or "3.10.2" or "3.11beta"
YmtApi.compareVersion = function (s1, s2, op) {
  if (!YmtApi.isSaohuoApp && !YmtApi.isSellerApp)
    return false
  
  function stringTypeCheck(s) {
    if (typeof s != 'string') 
      throw new Error(s+" should be a litral string for version compare")
  }

  function validVersionStringCheck(s) {
    if (!s.match(/^[\.\d\w]+$/))
      throw new Error(s + " is not valid version string, valid version should only contain dot or number or alphabetic character")
    if (s.indexOf('.') < 0) 
      throw new Error(s + " should contain at least one dot for version compare")
  }

  function validVersionComponentCheck(s) {
    var parts = s.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (isNaN(parseInt(parts[i])))
        throw new Error(s + " is not a valid version to compare, " + parts[i] + " needs to be Integer parseble")
    }      
  }

  s1 = s1 || '';
  s2 = s2 || '';

  // backwords api compability
  s1 = s1.replace("appVersion/", "");
  s2 = s2.replace("appVersion/", "");
  
  stringTypeCheck(s1);
  stringTypeCheck(s2);

  validVersionStringCheck(s1);
  validVersionStringCheck(s2);
  
  validVersionComponentCheck(s1);
  validVersionComponentCheck(s2);

  var result;
  var vs1 = s1.split(".");
  var vs2 = s2.split(".");

  var operator = typeof op === 'undefined' ? YmtApi.OPERATORS.GREATER : op;
  if (operator !== YmtApi.OPERATORS.GREATER && operator !== YmtApi.OPERATORS.LESS && operator !== YmtApi.OPERATORS.EQUAL) {
    alert('invalid compare version operator passed:' + operator)
    return false
  }

  for (var i = 0; i < 3; i++) {
    var s1ver = parseInt(vs1[i])
    var s2ver = parseInt(vs2[i])
    
    if (s1ver != s2ver) {
      if (typeof vs1[i] == "undefined" || vs1[i] == null) vs1[i] = 0;
      if (typeof vs2[i] == "undefined" || vs2[i] == null) vs2[i] = 0;

      if ((operator === YmtApi.OPERATORS.GREATER) &&  (s1ver > s2ver)) {
        result = true;
      }else if ((operator === YmtApi.OPERATORS.EQUAL) &&  (s1ver == s2ver)) {
        result = true;
      }else if ((operator === YmtApi.OPERATORS.LESS) &&  (s1ver < s2ver)) {
        result = true;
      }  
      else {
        result = false;
      }
      break;
    }
  }

  return result;
};

/**
 * @namespace YmtApi.utils
 * @description YmtApi.utils是辅助工具集
 * @public
 * @author haiyang5210
 * @since 2015-06-25 10:48
 */
YmtApi.utils = {
  /**
     * @method YmtApi.utils.getAuthInfo
     * @description 获得token信息，没有则从cookie获得
     * @return {Object} currSearch
     * @example
     * YmtApi.utils.getAuthInfo();
     */
  getAuthInfo: function() {
    var query = YmtApi.auth || YmtApi.utils.getUrlObj();
    var result = {
      UserId: query.UserId,
      AccessToken: query.AccessToken
    };
    return result;
  },
  /**
     * @method YmtApi.utils.addAuth
     * @description 增加用户认证
     * @param {string}  url     需要增加的的地址
     * @param {Boolean} isForce 是否为强制认证，默认值：false；当为true
     *                              则会判断是否能得到用户认证，不能则触发登录。
     */
  addAuth: function(url, isForce) {
    var currSearch = YmtApi.auth || YmtApi.utils.getUrlObj();
    // return currSearch;
    var authInfo = currSearch;

    if (isForce) {
      if (!authInfo || !authInfo.AccessToken || authInfo.AccessToken == "nil") {
        return YmtApi.toLogin();
      }
    }

    return YmtApi.utils.addParam(url, {
      UserId: authInfo.UserId,
      AccessToken: authInfo.AccessToken,
      shareSource: currSearch.shareSource
    });
  },
  delAuth: function(url) {
    url = url || "";
    url = YmtApi.utils.delParam(url, [
      "AccessToken",
      "UserId",
      "IDFA",
      "DeviceId",
      "DeviceToken"
    ]);

    return url;
  },
  /*
     * 解析URL
     */
  parseUrl: function(str) {
    str = str === undefined ? "" : String(str).replace(/^\s+|\s+$/, "");
    if (!str) return {};
    str = (str.indexOf("?") !== -1 ? str.split("?")[1] : "").split("#")[0];

    var arr = str.split("&");
    var param = {};
    var part;
    for (var i in arr) {
      if (!arr[i]) continue;
      part = arr[i].split("=");
      param[part[0]] = part[1] === undefined ? "" : part[1];
    }
    return param;
  },
  /*
     * 获得当前页面的参数
     * return {UserId: 10001, AccessToken: 'ABCDSEFDG'}
     */
  getUrlObj: function(url) {
    return YmtApi.utils.parseUrl(url || window.location.search);
  },
  param: function(paramObj) {
    var str = [];
    for (var i in paramObj) {
      try {
        decodeURIComponent(paramObj[i]);
        paramObj[i] = decodeURIComponent(paramObj[i]);
      } catch (e) {}
      str.push(i + "=" + encodeURIComponent(paramObj[i]));
    }
    return str.join("&");
  },
  /*
     * 增加参数
     */
  addParam: function(url, params) {
    var list = hui.extend({}, params);
    for (var i in list) {
      try {
        decodeURIComponent(list[i]);
        list[i] = decodeURIComponent(list[i]);
      } catch (e) {}
      list[i] = encodeURIComponent(list[i]);
    }

    var SEARCH_REG = /\?([^#]*)/,
      HASH_REG = /#(.*)/;
    url = url || "";
    var search = {},
      searchMatch = url.match(SEARCH_REG),
      searchAttr = [],
      searchStr = "";

    if (searchMatch) search = YmtApi.utils.parseUrl(searchMatch[0]);
    search = hui.extend(search, list);
    for (var i in search) {
      if (search[i] === undefined) search[i] = "";
      searchAttr.push(i + "=" + search[i]);
    }
    if (searchAttr[0]) searchStr = "?" + searchAttr.join("&");

    //是否存在search
    if (SEARCH_REG.test(url)) url = url.replace(SEARCH_REG, searchStr);
    else {
      //是否存在hash
      if (HASH_REG.test(url)) {
        url = url.replace(HASH_REG, searchStr + "#" + url.match(HASH_REG)[1]);
      } else {
        url += searchStr;
      }
    }
    return url;
  },
  delParam: function(url, params) {
    var str = YmtApi.utils.addParam(url, {});
    if (params) {
      params =
        Object.prototype.toString.call(params) == "[object Array]"
          ? params
          : [params];
      for (var i = 0, len = params.length; i < len; i++) {
        str = str.replace(new RegExp("&" + params[i] + "=[^&#]*", "ig"), "");
        str = str.replace(new RegExp("\\?" + params[i] + "=[^&#]*", "ig"), "?");
        str = str.replace(/\?$/, "");
      }
    }
    return str;
  },
  addDefaultParam: function(url, params) {
    var search = hui.extend(
      YmtApi.utils.parseUrl(window.location.href),
      params
    );
    var str = YmtApi.utils.addParam(url, search);

    return str;
  },
  getDeviceId: function() {
    return YmtApi.utils.parseUrl(window.location.search).DeviceId;
  },
  getDeviceToken: function() {
    return YmtApi.utils.parseUrl(window.location.search).DeviceToken;
  },
  getCookieid: function() {
    return YmtApi.utils.parseUrl(window.location.search).Cookieid;
  },
  getIDFA: function() {
    return YmtApi.utils.parseUrl(window.location.search).IDFA;
  },
  getIMEI: function() {
    return YmtApi.utils.parseUrl(window.location.search).imei;
  }
};

/**
 * YmtApi
 *
 * @description
 *      这个脚本包含不同端的不同处理，方法名称参数类型基本保持一致，
 *      在特定场景不存在的方法也由空方法替代，不需要做过多的判断
 *
 * @example
 *   工具方法：
 *      判断环境
 *          YmtApi.isWechat
 *          YmtApi.isSaohuoApp
 *          YmtApi.isYmtApp
 *
 *      YmtApi.utils
 *          getOrderSource 获得订单来源
 *          addAuth        添加认证信息 url传递
 *
 *                           码头app             扫货app            微信
 *  open 打开页面               Y                    Y                 Y
 *  openShare 打开分享          Y                    Y                 Y
 *  openChatList 会话列表       Y                    N                 N
 *  previewImage 会话详情       Y                    Y                 N
 *  openPay 打开支付            Y                    Y                 Y
 *  toLogin 打开登录            Y                    Y                 Y
 *  openConfirmOrder  一键购买  N                    Y                 Y
 *
 *  事件：
 *      这里是自定义事件，自己sendEvent为单页触发，而由webview sendEvent为
 *  全局触发，默认添加 userStatusChange 登录变更之后会触发，你可以可以自定义
 *  自己的登录会触发回调
 *
 *      YmtApi.on('userStatusChange',function(){
 *          //Handling
 *      });
 *
 *      YmtApi.off('userStatusChange');//移除指定事件
 *      YmtApi.off('userStatusChange userStatusChange1 userStatusChange2');//移除指定多个事件
 *
 *      YmtApi.one('userStatusChange',function(){
 *
 *      });//执行一次
 *
 *  微信YmtApi做了相应调整
 *  1、微信初始化不再自动执行，请使用相关功能单独 initWechat
 *      两个参数：
 *          options 【 微信初始化参数 】
 *              参考http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E6.AD.A5.E9.AA.A4.E4.B8.80.EF.BC.9A.E7.BB.91.E5.AE.9A.E5.9F.9F.E5.90.8D
 *          wxReadyCallback  【微信初始化完毕回调方法】
 *       另外方便部分页面和功能不需要自定义，直接使用默认配置，那在调用ymtapi.js 增加wxAutoInit=1参数
 *       则自动会执行默认执行initWechat方法
 *    <script src="http://staticmatouapp.ymatou.com/js/YmtApi.js?wxAutoInit=1"> 【自动会执行initWechat使用默认参数】
 *
 *  2、所有页面将放开分享功能，如需关闭自己调用。【默认分享功能，允许分享当前页，切会移除token等信息分享当前页】
 *      initWechat({/*options* /},function(wx){
 *          wx.hideMenuItems(/* 关闭的自定义菜单列表* /);
 *      });
 *
 *  3、toLogin
 *      支持回调url
 *
 *
 */

/**
 * @method YmtApi.open
 * @description 打开Webview
 * @param  {object} options
 * @example
 * YmtApi.open({
 *     url: 'http://matouapp.ymatou.com/forYmatouApp/home',
 *     shareFlag: 1,
 *     backFlag: 1,
 *     backType: 0,
 *     backFlag: 1,
 *     msgFlag: 1,
 *     showWeiboFlag: 0,
 *     title: '商品详情',
 *     shareTitle: '分享标题',
 *     shareContent: '分享内容',
 *     sharePicUrl: 'http://分享图片',
 *     shareLinkUrl: 'http://分享链接地址',
 *     shareTimelineContent: 'ShareTimelineContent678'
 * });

 */
YmtApi.open = function(options) {
  if (!options || (!options.url && !options.shareLinkUrl)) {
    throw new Error("open: url Can not be empty!!");
  }

  // 当前页面跳转走YmtApi.openUrl协议，YmtApi.open默认打开新窗口，因此不再需要needJumpFlag
  if (options && options.url)
    options.url = options.url.replace(/needJumpFlag/gi, "noJumpFlag");
  delete options.needJumpFlag;
  delete options.forBuyerApp_needJumpFlag;

  if (options.url.indexOf("//") === 0) {
    options.url = location.protocol + options.url;
  }
  if (options.url.indexOf("/") === 0) {
    options.url = window.location.origin + options.url;
  } else if (
    options.url.indexOf("http://") !== 0 &&
    options.url.indexOf("https://") !== 0
  ) {
    options.url =
      window.location.origin +
      window.location.pathname.replace(/\/[^\/]*$/, "/") +
      options.url;
  }

  var idx;
  idx = options.url.indexOf("//m.ymatou.com/diary/");
  if (idx > -1 && idx < 8 && YmtApi.isIos)
    options.url = options.url.replace(
      "//m.ymatou.com/diary/",
      "//diary.ymatou.com/"
    );
  idx = options.url.indexOf("//m.ymatou.com/sq0/");
  if (idx > -1 && idx < 8 && YmtApi.isIos)
    options.url = options.url.replace(
      "//m.ymatou.com/sq0/",
      "//sq0.ymatou.com/"
    );

  if (YmtApi.isIos && YmtApi.compareVersion(YmtApi.appVersion , "appVersion/3.1.1"))
    options.url.replace(
      "//m.ymatou.com/diary/forBuyerApp/notes/details?",
      "//m.ymatou.com/note/detail?"
    );

  var args = {
    url: 1,
    shareurl: 1,
    title: 1,
    backtype: 1,
    backflag: 1,
    msgflag: 1,
    sharetitle: 1,
    sharecontent: 1,
    sharepicurl: 1,
    sharelinkurl: 1,
    sharetip: 1,
    price: 1,
    showsharebtn: 1,
    shareflag: 1,
    showweibobtn: 1,
    showweiboflag: 1,
    addauth: 1
  };
  // 容错处理
  options = hui.extend(
    YmtApi.utils.parseUrl(options.url),
    YmtApi.configShare(options)
  );

  var _param = {};
  for (var i in options) {
    if (!args[String(i).toLowerCase()]) _param[i] = options[i];
  }

  if (options.title) _param.title = options.title;
  if (options.backType) _param.backType = options.backType;
  if (options.backFlag) _param.backFlag = 1;
  if (options.msgFlag) _param.msgFlag = 1;

  if (options.showMore) _param.ShowMore = 1;
  if (options.backTitle) _param.BackTitle = options.backTitle;
  if (options.backUrl) _param.BackUrl = options.backUrl;

  if (YmtApi.isSaohuoApp) {
    //是否显示原生分享按钮
    if (options.showShareBtn || options.shareFlag) {
      // 显示右上角原生分享按钮，
      // 注：聚洋货会将该属性视为触发原生分享，故不能放到前面公共部分
      _param.shareFlag = 1;

      var shareLinkUrl = String(options.shareLinkUrl || options.shareLinkUrl);
      shareLinkUrl = shareLinkUrl
        .replace(/&?AccessToken=[^&#]*/gi, "")
        .replace(/&?UserId=[^&#]*/gi, "");
      shareLinkUrl = shareLinkUrl
        .replace(/&?IDFA=[^&#]*/gi, "")
        .replace(/&?DeviceId=[^&#]*/gi, "")
        .replace(/&?DeviceToken=[^&#]*/gi, "");
      options.shareLinkUrl = shareLinkUrl;

      _param.ShareLinkUrl =
        String(options.shareLinkUrl).indexOf("/") > -1
          ? encodeURIComponent(options.shareLinkUrl)
          : options.shareLinkUrl;
      _param.SharePicUrl =
        String(options.sharePicUrl).indexOf("/") > -1
          ? encodeURIComponent(options.sharePicUrl)
          : options.sharePicUrl;

      _param.ShareTitle = encodeURIComponent(options.shareTitle);

      try {
        _param.ShareContent = encodeURIComponent(options.shareContent);
      } catch (e) {
        _param.ShareContent = encodeURIComponent(
          options.shareContent.substring(0, options.shareContent.length - 1)
        );
      }
      try {
        _param.ShareTimelineContent = encodeURIComponent(
          options.shareTimelineContent
        );
      } catch (e) {
        _param.ShareTimelineContent = encodeURIComponent(
          options.shareTimelineContent.substring(
            0,
            options.shareTimelineContent.length - 1
          )
        );
      }

      _param.showWeiboFlag =
        +!!options.showWeiboBtn || +!!options.showWeiboFlag;
    }

    var str = String(options.url).toLowerCase();

    var path =
      "/" +
      (str.split(
        str.indexOf("forymatouapp/") !== -1 ? "forymatouapp/" : "forbuyerapp/"
      )[1] || "")
        .split("?")[0];
    if (path == String("/bindMobile").toLowerCase()) {
      return YmtApi.bindMobile();
    }
    if (path == String("/uploadUserIcon").toLowerCase()) {
      return YmtApi.uploadUserIcon();
    }
    if (path == String("/liveHome").toLowerCase()) {
      return YmtApi.liveHome();
    }
    if (path == String("/jyhHome").toLowerCase()) {
      return YmtApi.jyhHome();
    }

    // if (path == String('/notes/details').toLowerCase()) {
    //     return YmtApi.noteDetail(_param);
    // }

    if (path == String("/fansList").toLowerCase()) {
      return YmtApi.noteFansList(_param);
    }
    if (path == String("/activityPartnerList").toLowerCase()) {
      return YmtApi.activityPartnerList(_param);
    }

    if (path == String("/share").toLowerCase()) {
      return YmtApi.openShare(_param);
    }
    if (path == String("/productDetail").toLowerCase()) {
      return YmtApi.openProductDetail(_param);
    }

    if (path == String("/liveDetail").toLowerCase()) {
      return YmtApi.liveDetail(_param);
    }

    if (YmtApi.checkJSBridge("openWin")) {
      options.url = YmtApi.utils.addParam(options.url, _param);

      // alert('This is by JsBridge');
      return YmtApi.openWin(options);
    }

    // 兼容更老版本
    _param.forBuyerApp_needJumpFlag = 1;
    str = YmtApi.utils.addParam(options.url, _param);

    // alert(str);
    window.location.href = str;
  } else if (YmtApi.isWechat) {
    window.location.href = YmtApi.utils.addParam(options.url, _param);
  } else {
    for (var i in _param) {
      _param[i] = encodeURIComponent(_param[i]);
    }
    window.location.href = YmtApi.utils.addParam(options.url, _param);
  }
};
// 当前窗口内url跳转
YmtApi.openUrl = function(options) {
  if (options && options.url)
    options.url = options.url.replace(/needJumpFlag/gi, "noJumpFlag");
  var str = (options || {}).url;
  str = YmtApi.utils.addAuth(str);

  // alert(str);
  window.location.href = str;
};

YmtApi.openMiniAppConfig = function(matchFunction) {
  if (typeof matchFunction !== 'function')
    throw Error('invalid matchFunction passed! the parameter should be a function')

  YmtApi.openWinConfig = {
    miniAppMatchFunction : matchFunction
  }
}

YmtApi.openWin = function(options) {
  options = options || {};
  var url = String(options.url);
  delete options.url;
  options.needJumpFlag = 1;
  options.forBuyerApp_needJumpFlag = 1;

  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("openWin")) {
      url = url.replace(/needJumpFlag/gi, "noJumpFlag");

      var str = url.toLowerCase();
      var path =
        "/" +
        (str.split(
          str.indexOf("forymatouapp/") !== -1 ? "forymatouapp/" : "forbuyerapp/"
        )[1] || "")
          .split("?")[0];

      var winType = options.winType || 0;
      if (path == String("/notes/details").toLowerCase()) {
        winType = 2;
      }

      if (url.indexOf("//") === 0) {
        url = location.protocol + url;
      }
      if (
        url.indexOf("?title=") == -1 &&
        url.indexOf("&title=") == -1 &&
        options.title
      ) {
        url =
          url +
          (url.indexOf("?") == -1 ? "?title=" : "&title=") +
          encodeURIComponent(options.title);
      }

      if (YmtApi.isIos && YmtApi.compareVersion(YmtApi.appVersion , "appVersion/3.1.1"))
        url.replace(
          "//m.ymatou.com/diary/forBuyerApp/notes/details?",
          "//m.ymatou.com/note/detail?"
        );

      ymt.openWin({
        // url: "http://sq0.ymatou.com/forBuyerApp/discover/detail?topic=398&title=%E6%B5%8B%E8%AF%95%E6%8F%92%E5%85%A5%E5%95%86%E5%93%81&ShareTitle=%E6%B5%8B%E8%AF%95%E6%8F%92%E5%85%A5%E5%95%86%E5%93%81&ShareContent=asdfasdfsdfasdfasdfsadf&SharePicUrl=http%3a%2f%2fp6.img.ymatou.com%2fG01%2fM00%2f05%2f32%2frBBlD1YkffuAN1TvAADEF_KhqGA398_s.jpg&ShareLinkUrl=http%3a%2f%2fsq0.ymatou.com%2fforBuyerApp%2fdiscover%2fdetail%3ftopic%3d398&UserId=395528&AccessToken=7A14222AD0A4A56E5DCF417AEACB125F60304602F4C43BE38F908A44CB4182976613D3A87C875652E5B5920D55D40486EFF7ECF048BF89AB&IDFA=EB4D5648-E702-4DB2-B9F3-89062334AE0B&DeviceToken=8e99ab0988cfda50478eded6372d5dbd7782b1c000cc139404cf4f0ceb7f6cd1&Wifi=1&AppName=Buyer&DeviceId=91C1AB2E-9D59-487D-9277-2A0620D954D1",
        // url: "http://sq0.ymatou.com/forBuyerApp/discover/detail?
        // topic=398
        // &title=%E6%B5%8B%E8%AF%95%E6%8F%92%E5%85%A5%E5%95%86%E5%93%81
        // &ShareTitle=%E6%B5%8B%E8%AF%95%E6%8F%92%E5%85%A5%E5%95%86%E5%93%81
        // &ShareContent=asdfasdfsdfasdfasdfsadf
        // &SharePicUrl=http%3a%2f%2fp6.img.ymatou.com%2fG01%2fM00%2f05%2f32%2frBBlD1YkffuAN1TvAADEF_KhqGA398_s.jpg
        // &ShareLinkUrl=http%3a%2f%2fsq0.ymatou.com%2fforBuyerApp%2fdiscover%2fdetail%3ftopic%3d398
        url: url,
        anmiType: options.anmiType || 1,
        winType: winType
      });

      // alert('This is by JsBridge');
      return;
    } else {
      var idx;
      idx = url.indexOf("//m.ymatou.com/diary/");
      if (idx > -1 && idx < 8 && YmtApi.isIos)
        url = url.replace("//m.ymatou.com/diary/", "//diary.ymatou.com/");
      idx = url.indexOf("//m.ymatou.com/sq0/");
      if (idx > -1 && idx < 8 && YmtApi.isIos)
        url = url.replace("//m.ymatou.com/sq0/", "//sq0.ymatou.com/");

      url = YmtApi.utils.addParam(url, options);
      window.location.href = url;
    }
  } 
  // 小程序跳转, 根据h5跳转url，找到对应的匹配规则函数，再跳到匹配函数
  // 返回的小程序路径页面，如果对应的小程序页面没有，则还是用h5的跳转方法
  else if (YmtApi.isMiniApp) {
    if (YmtApi.openWinConfig && YmtApi.openWinConfig.miniAppMatchFunction) {
      url = YmtApi.utils.addParam(url, options);
      
      // 处理跳转目标url
      var sepPos = url.indexOf('?') < 0? url.length : url.indexOf('?')
      var queryString = url.substring(sepPos)
      var targetPath = url.substring(0, sepPos)

      // 生成小程序跳转路径
      var miniAppPath = YmtApi.openWinConfig.miniAppMatchFunction.call(this, targetPath, window.location.href)
      var miniAppUrl = miniAppPath + queryString

      if (wx && wx.miniProgram && miniAppPath && (typeof wx.miniProgram.navigateTo === 'function')) {
        wx.miniProgram.navigateTo({url: miniAppUrl})
      } else {
        console.warn('miniapp navigation function is not valid ['+ miniAppUrl +']')
        url = YmtApi.utils.addParam(url, options);
        window.location.href = url;
      }
    }
  }
  else if (YmtApi.isWechat) {
    url = YmtApi.utils.addParam(url, options);
    window.location.href = url;
  } else {
    url = YmtApi.utils.addParam(url, options);
    window.location.href = url;
  }
};

YmtApi.closeWin = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("closeWin")) {
      ymt.closeWin.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var url = "http://sq0.ymatou.com/forBuyerApp/goOver?refreshFlag=1";
    window.location.href = url;
  }
};

/**
 * @method YmtApi.shareWith
 * @description 条用原生分享功能
 * @param  {Object} options 分享标题文案图标等参数
 * @example
 * YmtApi.shareWith({
    "platform": YmtApi.SHARE_PLATFORMS.WX_FRIEND,    // 0:微博 1:微信好友 2:微信朋友圈
    "title": "分享标题",
    "content": "分享内容",
    "link": "分享链接",
    "pic": "分享图片链接或者图片base64字符串",
    "style": YmtApi.SHARE_STYLES.PIC_LINK,   // 0:分享图文加链接 1:分享纯图
    "tag": "原始值回传给h5",   // 标记点击位置，匹配分享结果
    "success":function(){}, //成功回调
    "failure":function(){}, // 失败回调
});
 *
 */
YmtApi.SHARE_PLATFORMS = {
  WB:3,
  WX_FRIEND:1,
  WX_TIMELINE:2
}

YmtApi.SHARE_STYLES = {
  PIC_LINK:0,
  PIC:1,
}

YmtApi.shareWith = function(options) {
  // 检查缺失参数
  function containKeys(obj, required){ 
    var isValid = true
    var errors = []
    var errMsgs = {}

    errMsgs[YmtApi.SHARE_PLATFORMS.WB] = '微博'
    errMsgs[YmtApi.SHARE_PLATFORMS.WX_FRIEND] = '微信个人'
    errMsgs[YmtApi.SHARE_PLATFORMS.WX_TIMELINE] = '微信朋友圈'

    required.forEach(function(key){
      if (typeof obj[key] === 'undefined' || obj[key] === null){
        isValid = false
        errors.push(key)
      }
    })

    if (!isValid) {
      alert('分享到' + errMsgs[options.platform] + '缺少参数' + errors.toString())
    }
    return isValid
  }

  // 根据分享场景检查传入的参数
  function checkOptions() {
    if (containKeys(options,['platform', 'style'])) {
      // 图文链接需要标题，内容，链接地址和缩略图
      if (options.style === YmtApi.SHARE_STYLES.PIC_LINK) {
        return containKeys(options, ['title','content','link','pic'])
      }
      // 如果是分享纯图到微信，需要图片地址或者数据
      if (options.platform === YmtApi.SHARE_PLATFORMS.WX_FRIEND ||  options.platform === YmtApi.SHARE_PLATFORMS.WX_TIMELINE) {
        return containKeys(options, ['pic'])
      }
      return false
    }
    return false
  }

  if (checkOptions()) {
    if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
      if (YmtApi.checkJSBridge("share")) {

        // 绑定分享事件
        YmtApi.off('shareEvent')
        YmtApi.on('shareEvent', function(res){
          if (res.success) { // 分享成功
            options.success && typeof options.success === 'function' && options.success(res)
          } else  { // 分享失败
            options.failure && typeof options.failure === 'function' && options.failure(res)
          }
        })

        // 调用natvie分享功能
        ymt.shareWith({
          "platform": options.platform,    // 1:微信好友 2:微信朋友圈 3:微博
          "title": options.title,
          "content": options.content,
          "link": YmtApi.utils.addParam(options.link, {
            shareSource: "saohuoApp"
          }),
          "pic": options.pic,
          "style": options.style,   // 0:分享图文加链接 1:分享纯图
          "tag": options.tag || '',   // 标记点击位置，匹配分享结果
          "showMessage": typeof options.showMessage === 'boolean'? options.showMessage : true  //是否让原生显示分享结果消息
        })
      }
    } else if (YmtApi.isWechat) {
      YmtApi.showShareMask();
    }
  }
}

/**
 * @method YmtApi.openShare
 * @description 打开原生分享面板
 * @param  {Object} options 分享标题文案图标等参数
 * @example
 * YmtApi.openShare({
 *     title: 'hy test share title',
 *     shareTitle: 'hy test shareTitle',
 *     sharePicUrl: 'http://static.ymatou.com/images/sprites/logo.png',
 *     shareLinkUrl: 'http://static.ymatou.com/images/sprites/logo.png',
 *     shareContent: 'hy test shareContent',
 *     shareTimelineContent: 'ShareTimelineContent678',
 *     theme:0,
 * });
 *
 */
YmtApi.openShare = function(options) {
  options = YmtApi.configShare(options);

  if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
    if (YmtApi.checkJSBridge("share")) {
      ymt.share({
        title: options.shareTitle,
        content: options.shareContent,
        moment: options.shareTimelineContent,
        sina: options.shareSina,
        linkUrl: YmtApi.utils.addParam(options.shareLinkUrl, {
          shareSource: "saohuoApp"
        }),
        imgUrl: options.sharePicUrl, // 分享图标
        hide: options.hide || ["SinaWeibo"],
        theme: options.theme || 0,
        style: options.style || 0,
        imageBase64: options.imageBase64 || '',
        success: function(res) {
          if (global.console) global.console.log(res);
          // alert('成功');
        },
        cancel: function(res) {
          if (global.console) global.console.log(res);
          // alert('取消');
        }
      });

      // alert('This is by JsBridge');
      return;
    }

    window.location.href =
      "http://sq0.ymatou.com/forYmatouApp/share?" +
      YmtApi.utils.param({
        title: "分享",
        ShareTitle: options.shareTitle,
        SharePicUrl: options.sharePicUrl,
        ShareContent: options.shareContent,
        ShareLinkUrl: YmtApi.utils.addParam(
          options.shareLinkUrl || options.shareUrl,
          {
            shareSource: "saohuoApp"
          }
        ),
        showWeiboFlag:
          +!!options.showWeiboBtn ||
          +!!options.showWeiboFlag ||
          +!!(options.hide && options.hide.join("").indexOf("SinaWeibo") < 0),
        ShareFlag: 1
      });
  } else if (YmtApi.isWechat) {
    YmtApi.showShareMask();
  }
};
/*
YmtApi.configShare({
    shareTitle: 'shareTitle23',
    shareContent: 'shareContent123',
    sharePicUrl: 'http://wx.qlogo.cn/mmopen/8pThLJOOtIQEZV4nKkEWWsmIQ0CoOUUlgY01r2syqNL8RwTNweTN9nYwHrUfibIfbhZd7necsvet2EGTqZk36dWJo6xPkxwSp/0',
    shareLinkUrl: 'http://haiyang.me',
    ShareTimelineContent: 'ShareTimelineContent678'
});
*/
YmtApi.configShare = function(options) {
  options = options || {};

  var shareLinkUrl = String(options.shareLinkUrl || window.location.href);
  var index = shareLinkUrl.indexOf("//h5.ymatou.com");
  if (index > -1 && index < 7) {
    shareLinkUrl = shareLinkUrl.replace("//h5.ymatou.com", "//m.ymatou.com");
  }

  options.shareLinkUrl = shareLinkUrl;
  options.shareTitle = options.shareTitle || "洋码头";
  options.shareContent = options.shareContent || "购在全球，洋码头只做洋货";
  options.sharePicUrl =
    options.sharePicUrl ||
    "http://staticontent.ymatou.com/ymtapp/logo-80x80.png";

  YmtApi.shareConfig = options;

  if (YmtApi.isSaohuoApp) {
    // Todo
  } else if (YmtApi.isWechat) {
    var shareConf1 = {}; //分享给朋友
    var shareConf2 = {}; //分享到朋友圈

    var shareSource = YmtApi.utils.getUrlObj().shareSource;

    shareConf1.title = shareConf2.title = YmtApi.shareConfig.shareTitle;

    var link = YmtApi.utils.delAuth(
      YmtApi.utils.addParam(YmtApi.shareConfig.shareLinkUrl, {
        shareSource: shareSource
      })
    );

    shareConf1.link = shareConf2.link = link;
    shareConf1.desc = shareConf2.desc = YmtApi.shareConfig.shareContent;
    shareConf1.imgUrl = shareConf2.imgUrl = YmtApi.shareConfig.sharePicUrl;

    // shareConf1.success = YmtApi.shareConfig.py_success;
    // shareConf1.cancel = YmtApi.shareConfig.py_cancel;
    // shareConf2.success = YmtApi.shareConfig.pyq_success;
    // shareConf2.cancel = YmtApi.shareConfig.pyq_cancel;

    function shareSuccess(type) {
      if (
        YmtApi.shareConfig.success &&
        typeof YmtApi.shareConfig.success === "function"
      ) {
        YmtApi.shareConfig.success.apply(
          this,
          [type].concat([].slice.call(arguments, 0))
        );
      }
    }

    shareConf1.success = function() {
      shareSuccess.call(this, "py", arguments);
    };
    shareConf2.success = function() {
      shareSuccess.call(this, "pyq", arguments);
    };

    YmtApi.onWeixinReady(function() {
      wx.onMenuShareAppMessage(shareConf1);
      if (YmtApi.shareConfig.shareTimelineContent) {
        shareConf2.title = YmtApi.shareConfig.shareTimelineContent;
      }
      wx.onMenuShareTimeline(shareConf2);
    });

    // YmtApi.showShareMask();
  }

  return options;
};
/**
 * @method YmtApi.openChatDetail
 * @description 打开聊天详情
 * @param  {object} options 对话参数
 * @example
 * YmtApi.openChatDetail({
 *     'SessionId': '1618229_1097476',
 *     'ToId': 1097476,
 *     'ToLoginId': 'foreverprince',
 *     'ToLogoUrl': 'http://p5.img.ymatou.com/upload/userlogo/big/1097476_cce6d77caa524c1f86b1e6dc5696a89a_b.jpg',
 *     'param': {
 *         'ProductModel': {
 *             'ProductId': '2b14bb1c-b734-4b52-b909-9c497365f12d',
 *             'Price': 92,
 *             'replayTag': 0,
 *             'ProductDesc': '美国进口Childlife钙镁锌补充液 婴儿幼儿童液体钙 474ml 现货',
 *             'ProductPics': ['http://p9.img.ymatou.com/G02/upload/product/big/M0A/39/63/CgvUBFXvLNCAFN3_AAD_TXljT4s321_b.jpg']
 *         },
 *         OrderModel: {
 *             OrderId: n.OrderId,
 *             ProductPic: n.PictureUrl,
 *             ProductDes: n.ProductName,
 *             ProductsNum: n.ProductNumber,
 *             Price: n.TotalPrice,
 *             ActuallyPrice: n.Price,
 *             LeaveWord: n.LeaveWord,
 *             Catalog: null  != n.CatalogName ? n.CatalogName.replace(/#/g, ":").replace(/尺码分类/, "尺寸") : "",
 *             DistributionType: n.CatalogStatus,
 *             LocalReturn: 1 == n.CanLocalReturn ? 1 : 0,
 *             PaidAmount: n.PaidAmount,
 *             TradingStatus: n.TradingStatus,
 *             FreeShipping: n.IsFreight,
 *             TariffType: 1 == n.IsTariffType ? 0 : 1,
 *             PriceType: n.PriceType,
 *             IsActivityProduct: n.IsActivityProduct,
 *             Freight: n.Freight,
 *             Platform: n.Platform
 *         }
 *     }
 * }
 *
 */
YmtApi.openChatDetail = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("openChat")) {
      if (options.exts && options.exts.ProductModel) {
        options.exts.ProductModel.IsReplay =
          options.exts.ProductModel.replayTag !== undefined
            ? options.exts.ProductModel.replayTag
            : options.exts.ProductModel.ReplayTag;
      }

      ymt.openChat({
        toId: options.ToId, //接收者id
        isM2C: options.IsM2C === undefined ? false : options.IsM2C, //是否来源于M2C
        paramType:
          !options.exts ||
          (!options.exts.OrderModel && !options.exts.ProductModel)
            ? 0
            : options.exts.OrderModel ? 1 : 2, //0普通聊天，1订单，2商品
        param:
          !options.exts ||
          (!options.exts.OrderModel && !options.exts.ProductModel)
            ? null
            : options.exts.OrderModel || options.exts.ProductModel
      });

      // alert('This is by JsBridge');
      return;
    }

    options = options || {};
    var url =
      "http://sq0.ymatou.com/forBuyerApp/contactSeller?" +
      YmtApi.utils.param({
        SessionId: options.SessionId,
        ToId: options.ToId,
        ToLoginId: options.ToLoginId,
        ToLogoUrl: options.ToLogoUrl,
        exts: JSON.stringify(options.exts || {})
      });
    window.location.href = url;
  }
};

/**
 * @method YmtApi.openPay
 * @description 打开支付面板
 *  trandingIds       交易号(微信下trandingId支付不管成功失败，只一次有效)
 *  orderId          订单号
 * @example
 * YmtApi.openPay({
 *     trandingIds: 208340912,
 *     orderId: 106960422,
 *     param: {
 *         AccessToken: '855A2FC3EDC3D10831518774E90FB853CA1EF15E4E1686DDCBCD5505C0E09AA44B133A574D0BA115D9A2A038A72124C61365CB4414AED5FC'
 *     }
 * });
 */
YmtApi.openPay = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("pay")) {
      ymt.pay.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    window.location.href =
      "http://sq0.ymatou.com/forYmatouApp/payMOrder?OrderId=" + options.orderId;
  } else if (YmtApi.isWechat) {
    var url = options.returnurl || window.location.href;

    var str =
      window.location.protocol + "//wx.ymatou.com/Pay/wechat.html?tradingId=" +
      options.trandingIds +
      "&ret=" +
      encodeURIComponent(url) +
      "&AccessToken=" +
      options.AccessToken + '&openId=' + options.openId;
    window.location.href = str;
  }
};
/**
 * @method YmtApi.toLogin
 * @description 唤出原生登录
 * @example
 * YmtApi.toLogin();
 */
YmtApi.toLogin = function(url) {
  if (YmtApi.checkJSBridge("userLogin")) {
    ymt.userLogin.apply(ymt, arguments);

    // alert('This is by JsBridge');
    return;
  }

  if (YmtApi.isSaohuoApp) {
    window.location.href =
      "http://sq0.ymatou.com/forBuyerApp/loginStatus?hasLogin=0";
  } else if (YmtApi.isWechat) {
    url = url || window.location.href;
    window.location.href =
      "//m.ymatou.com/account/page/go_wechat?ret=" + encodeURIComponent(url);
  } else if (YmtApi.isWeibo) {
    url = url || window.location.href;
    window.location.href =
      "//m.ymatou.com/account/page/go_weibo?ret=" + encodeURIComponent(url);
  } else if (YmtApi.isAlipay) {
    url = url || window.location.href;
    window.location.href =
      "//m.ymatou.com/account/page/go_alipay?ret=" + encodeURIComponent(url);
  } else {
    url = url || window.location.href;
    window.location.href =
      "//m.ymatou.com/account/page/signin?returnurl=" + encodeURIComponent(url);
  }
};

/**
 * @method YmtApi.hasLogin
 * @description 唤出原生登录
 * @example
 * YmtApi.hasLogin();
 */
YmtApi.hasLogin = function(callback) {
  if (YmtApi.checkJSBridge()) {
    YmtApi.getLoginStatus({
      success: function(res) {
        // var isLogin = res.data;
        if (typeof callback === "function") callback(res && res.data);
      }
    });

    // alert('This is by JsBridge');
    return;
  }

  if (YmtApi.isSaohuoApp) {
    if (typeof callback === "function")
      callback(!!YmtApi.utils.getUrlObj().AccessToken);
  } else {
    var AccessToken = YmtApi.utils.getUrlObj().AccessToken;
    if (AccessToken) {
      callback(true);
    } else {
      hui.xhr({
        url: "//m.ymatou.com/account/api/user_status",
        success: function(res) {
          if (typeof callback === "function")
            callback(res && res.Result && res.Result.isLogin);
        }
      });
    }
  }
};

/**
 * @method YmtApi.openProductDetail
 * @description 打开C的商品详情（原生）
 * @example
 * YmtApi.openProductDetail({
 *     SellerName: 'bighero',
 *     param: {
 *         SellerModel: {
 *             Logo: 'http://static.ymatou.com/images/sprites/logo.png'
 *             Seller: 'bighero'
 *             SellerId: 100066
 *         },
 *         ProductModel: {
 *             ProductId: '66a92b97-2903-4927-a931-8a5045058742'
 *         }
 *     }
 * });
 */
YmtApi.openProductDetail = function(options) {
  if (options && options.param && typeof options.param === "string")
    options.param = JSON.parse(options.param);

  var SellerModel =
    options && options.param && options.param.SellerModel
      ? options.param.SellerModel
      : {};
  var ProductModel =
    options && options.param && options.param.ProductModel
      ? options.param.ProductModel
      : {};

  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("productDetail")) {
      ymt.productDetail({
        seller: {
          Logo: SellerModel.Logo,
          Seller: SellerModel.Seller, //买手名称
          SellerId: SellerModel.SellerId //买手Id
        },
        product: {
          ProductId: ProductModel.ProductId, //商品Id
          snap: ProductModel.snap || false, //默认false
          version: ProductModel.version || "", //版本号
          tradingSpecial: ProductModel.tradingSpecial || 0 // 0:普通商品 1:交易隔离砍价团2017-02-20(ver3.3.1，需要做版本兼容)
        }
      });

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://sq0.ymatou.com/forBuyerApp/productDetail?param=" +
      encodeURIComponent(JSON.stringify(options.param || options.exts)) +
      "&SellerName=" +
      encodeURIComponent(options.SellerName);
    window.location.href = YmtApi.utils.addAuth(str);
  } else {
    if (ProductModel.tradingSpecial == 1) {
      window.location.href =
        window.location.protocol +
        "//m.ymatou.com/item/page/index/" +
        ProductModel.ProductId +
        "?title=全球好货&tradingSpecial=1";
    } else {
      window.location.href =
        window.location.protocol +
        "//m.ymatou.com/item/page/index/" +
        ProductModel.ProductId +
        "?title=全球好货";
    }
  }
};
/**
 * @method YmtApi.noteFansList
 * @description [社区]笔记喜欢的人列表
 * @param {Object} options 笔记喜欢的人参数
 * @example
 * YmtApi.noteFansList({NoteId:100317062, NoteVersion:20160316180503221, collectionNum:31});
 */
YmtApi.noteFansList = function(options) {
  if (YmtApi.checkJSBridge("noteFansList")) {
    ymt.noteFansList({
      noteId: options.NoteId,
      noteVersion: options.NoteVersion
    });

    // alert('This is by JsBridge');
    return;
  }

  var str =
    "http://diary.ymatou.com/forBuyerApp/fansList?" +
    YmtApi.utils.param(options);
  window.location.href = YmtApi.utils.addAuth(str);
};
/**
 * @method YmtApi.activityPartnerList
 * @description [社区]活动的人列表
 * @param {Object} options 活动的人列表参数
 * @example
 * YmtApi.activityPartnerList({ActivityId: 10449});
 */
YmtApi.activityPartnerList = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("activityPartnerList")) {
      ymt.activityPartnerList({
        activityId: options.ActivityId
      });

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://diary.ymatou.com/forBuyerApp/activityPartnerList?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};
YmtApi.diaryActivityPartnerList = YmtApi.activityPartnerList;

/**
 * @method YmtApi.noteBrand
 * @description [社区]笔记品牌
 * @example
 * YmtApi.noteBrand();
 */
YmtApi.noteBrand = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("noteBrand")) {
    ymt.noteBrand.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  var str = "http://diary.ymatou.com/forBuyerApp/brandList";
  window.location.href = YmtApi.utils.addAuth(str);
};

/**
 * @method YmtApi.activityPartnerList
 * @description [社区]不同类型的笔记列表
 * @param {Object} options.noteType：0买手、1买家、2关注
 * @example
 * YmtApi.noteType({noteType: 0});
 */
YmtApi.noteType = function(options) {
  if (YmtApi.isSaohuoApp) {
    // 新增的JSBridge方法，1002版本没有
    if (YmtApi.checkJSBridge("noteType")) {
      ymt.noteType.apply(ymt, arguments);
      // alert('This is by JsBridge');
      return;
    }
    //其他方法都是新增的，不需要兼容
    if (options && options.noteType == "0") {
      var str = "http://diary.ymatou.com/forBuyerApp/sellerNote";
      window.location.href = YmtApi.utils.addAuth(str);
    }
  }
};
/**
 * @method YmtApi.interestMap
 * @description [社区]兴趣图谱
 * @example
 * YmtApi.interestMap({});
 */
YmtApi.interestMap = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("interestMap")) {
    ymt.interestMap.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};
/**
 * @method YmtApi.similarProduct
 * @description [社区]相似商品
 * @example
 * YmtApi.similarProduct({});
 */
YmtApi.similarProduct = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("similarProduct")) {
    ymt.similarProduct.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};

/**
 * @method YmtApi.similarTopic
 * @description [社区]相似主题
 * @example
 * YmtApi.similarTopic({});
 */
YmtApi.similarTopic = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("similarTopic")) {
    ymt.similarTopic.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};

/**
 * @method YmtApi.withdraw
 * @description [个人中心] 提现
 * @example
 * YmtApi.withdraw({});
 */
YmtApi.withdraw = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("withdraw")) {
    ymt.withdraw.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};

/**
 * @method YmtApi.order
 * @description [个人中心] 下单
 * @example
 * YmtApi.order({});
 */
YmtApi.order = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("order")) {
    ymt.order.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};
/**
 * @method YmtApi.attach
 * @description
 * @example
 * YmtApi.attach({});
 */
YmtApi.attach = function() {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("attach")) {
    ymt.attach.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }
  // var str = 'http://diary.ymatou.com/forBuyerApp/brandList';
  // window.location.href = YmtApi.utils.addAuth(str);
};

/**
 * @method YmtApi.search
 * @description 跳原生搜索
 * @example
 * YmtApi.search({keys: []});
 */
YmtApi.search = function(options) {
  // 新增的JSBridge方法，1002版本没有
  if (YmtApi.checkJSBridge("search")) {
    ymt.search.apply(ymt, arguments);
    // alert('This is by JsBridge');
    return;
  }

  options = options || {};
  var keys = options.keys && options.keys.join ? options.keys.join(" ") : "";
  try {
    decodeURIComponent(keys);
    keys = decodeURIComponent(keys);
  } catch (e) {}

  var title = options.title || "搜索";
  try {
    decodeURIComponent(title);
    title = decodeURIComponent(title);
  } catch (e) {}

  var url =
    "http://s.app.ymatou.com/search?keywords=" +
    encodeURIComponent(keys) +
    "&title=" +
    encodeURIComponent(title);
  YmtApi.openWin({
    url: url
  });
};

/**
 * @method YmtApi.diaryOpenComment
 * @description [社区]唤出原生评论
 * @param {Object} options 新加评论初始参数
 * @param {String} ObjectId
 * @param {Number} ObjectType
 * @param {String} replyCommentId
 * @example
 * YmtApi.diaryOpenComment({
 *     ObjectId:'209--99232',
 *     ObjectType:4,
 *     replyCommentId: 209
 * });
 */
YmtApi.diaryOpenComment = function(options) {
  options = options || {
    ObjectId: "",
    ObjectType: ""
  };
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("comment")) {
      ymt.comment({
        objectId: options.ObjectId,
        objectType: options.ObjectType
      });

      // alert('This is by JsBridge');
      return;
    }

    //window.location.href = 'http://sq0.ymatou.com/forYmatouApp/payMOrder?OrderId=' + options.orderId;
    //http://sq0.alpha.ymatou.com/forBuyerApp/comment?ObjectId=209--99232&ObjectType=4&UserId=nil&DeviceToken=nil&AccessToken=nil&IDFA=nil&Wifi=1
    var str =
      "http://diary.ymatou.com/forBuyerApp/comment?refreshFlag=1&ObjectId=" +
      options.ObjectId +
      "&ObjectType=" +
      options.ObjectType;
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.diaryPublishReply
 * @description [社区]唤出原生回复
 * @param {Object} options 新加评论初始参数
 * @param {String} ObjectId
 * @param {Number} ObjectType
 * @example
 * YmtApi.diaryPublishReply({ObjectId:'209--99232',ObjectType:4});
 */
YmtApi.diaryPublishReply = function(options) {
  if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
    if (YmtApi.checkJSBridge("replyComment")) {
      ymt.replyComment({
        objectId: options.ObjectId,
        objectType: options.ObjectType,
        replyCommentId: options.ReplyCommentId,
        replyUserName: options.ReplyUserName
      });

      // alert('This is by JsBridge');
      return;
    }
    //window.location.href = 'http://sq0.ymatou.com/forYmatouApp/payMOrder?OrderId=' + options.orderId;
    //http://sq0.alpha.ymatou.com/forBuyerApp/replyComment?ObjectId=209--99232&ObjectType=4&UserId=nil&DeviceToken=nil&AccessToken=nil&IDFA=nil&Wifi=1
    var str =
      "http://diary.ymatou.com/forBuyerApp/replyComment?refreshFlag=1&ObjectId=" +
      options.ObjectId +
      "&ObjectType=" +
      options.ObjectType +
      "&ReplyUserName=" +
      options.ReplyUserName +
      "&ReplyCommentId=" +
      options.ReplyCommentId;
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.diaryPublishNote
 * @description [社区]发表日记
 * @param {Object} options 发表日记初始参数
 * @example
 * YmtApi.diaryPublishNote({ActivityId: '1000011', ActivityName: '澳洲奶粉'})})
 */
YmtApi.diaryPublishNote = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("publishNote")) {
      ymt.publishNote({
        activityId: options.ActivityId,
        activityName: options.ActivityName
      });

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://diary.ymatou.com/forBuyerApp/publishNote?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.contactServant
 * @description [buyerapp]在线洋管家
 * @example
 * YmtApi.contactServant({});
 */
YmtApi.contactServant = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("onlineService")) {
      ymt.onlineService.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://sq0.ymatou.com/forBuyerApp/chat/onlineService?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.callPhone
 * @description [buyerapp]油码头热线
 * @example
 * YmtApi.callPhone({phoneNumber:4008502233});
 */
YmtApi.callPhone = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("callPhone")) {
      ymt.callPhone.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://sq0.ymatou.com/forBuyerApp/callPhone?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.feedBack
 * @description [buyerapp]反馈意见
 * @example
 * YmtApi.feedBack({});
 */
YmtApi.feedBack = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("feedBack")) {
      ymt.feedBack.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://sq0.ymatou.com/forBuyerApp/feedBack?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};
/**
 * @method YmtApi.liveDetail
 * @description [buyerapp]直播详情
 * @example
 * YmtApi.liveDetail({
 *     "SellerModel": banner.SellerModel || {},
 *     "ActivityModel": banner.ActivityModel || {}
 * });
 */
YmtApi.liveDetail = function(options) {
  options = options || {};
  options.ActivityModel = options.ActivityModel || {};

  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("liveDetail")) {
      ymt.liveDetail({
        activity: {
          ActivityId: options.ActivityModel.ActivityId,
          TopProductId: options.ActivityModel.TopProductId
        }
      });

      // alert('This is by JsBridge');
      return;
    }
    // if (options && options.ActivityModel && options.ActivityModel.ActivityId) {
    //     options = {
    //         ActivityModel: {
    //             ActivityId: options.ActivityModel.ActivityId
    //         }
    //     };
    // }

    options = {
      ActivityModel: {
        ActivityId: options.ActivityModel.ActivityId
      }
    };
    var str =
      "http://sq0.ymatou.com/forBuyerApp/liveDetail?param=" +
      encodeURIComponent(JSON.stringify(options));
    window.location.href = str;
  } else {
    var str =
      window.location.protocol +
      "//m.ymatou.com/live/page/index/" +
      options.ActivityModel.ActivityId;
    window.location.href = str;
  }
};

// 页面跳转
YmtApi.bindMobile = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("bindMobile")) {
      ymt.bindMobile.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str = "http://sq0.ymatou.com/forBuyerApp/bindMobile";
    window.location.href = str;
  }
};
YmtApi.uploadUserIcon = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("uploadUserIcon")) {
      ymt.uploadUserIcon.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str = "http://sq0.ymatou.com/forBuyerApp/uploadUserIcon";
    window.location.href = str;
  }
};
// ymt.tabHome({subName:"" //tab_community_attention关注，tab_community_found发现，不有subName时不用传递该参数});
YmtApi.liveHome = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("tabHome")) {
      ymt.tabHome({
        name: "live"
      });

      // alert('This is by JsBridge');
      return;
    }

    var str = window.location.protocol + "//m.ymatou.com";
    window.location.href = str;
  }
};
YmtApi.jyhHome = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("tabHome")) {
      ymt.tabHome({
        name: "jyh"
      });

      // alert('This is by JsBridge');
      return;
    }

    var str = "http://sq0.ymatou.com/forBuyerApp/jyhHome";
    window.location.href = str;
  }
};
// YmtApi.noteDetail = function (options) {
//     if (YmtApi.isSaohuoApp) {
//         if (YmtApi.checkJSBridge('noteDetail')) {
//             ymt.noteDetail({
//                 noteId: options.NoteId,
//                 noteVersion: options.NoteVersion
//             });

//             // alert('This is by JsBridge');
//             return;
//         }

//         var str = 'http://diary.ymatou.com/forBuyerApp/notes/details?' + YmtApi.utils.param(options);
//         window.location.href = str;
//     }

// };

YmtApi.titleBarConfig = {};
YmtApi.titleBar = function(data) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("titleBar")) {
      YmtApi.titleBarConfig = hui.extend(YmtApi.titleBarConfig, data);

      if (YmtApi.titleBarConfig && YmtApi.titleBarConfig.shareIcon) {
        var shareIcon = YmtApi.titleBarConfig.shareIcon;
        var str;
        if (shareIcon.title) {
          str = shareIcon.title.substr(0, 100);
          try {
            encodeURIComponent(str);
          } catch (e) {
            str = str.substring(0, str.length - 1);
          }
          shareIcon.title = str;
        }
        if (shareIcon.content) {
          str = shareIcon.content.substr(0, 100);
          try {
            encodeURIComponent(str);
          } catch (e) {
            str = str.substring(0, str.length - 1);
          }
          shareIcon.content = str;
        }
        if (shareIcon.moment) {
          str = shareIcon.moment.substr(0, 100);
          try {
            encodeURIComponent(str);
          } catch (e) {
            str = str.substring(0, str.length - 1);
          }
          shareIcon.moment = str;
        }
        if (shareIcon.sina) {
          str = shareIcon.sina.substr(0, 100);
          try {
            encodeURIComponent(str);
          } catch (e) {
            str = str.substring(0, str.length - 1);
          }
          shareIcon.sina = str;
        }
        if (shareIcon.linkUrl) {
          var index = shareIcon.linkUrl.indexOf("//h5.ymatou.com");
          if (index > -1 && index < 7) {
            shareIcon.linkUrl = shareIcon.linkUrl.replace(
              "//h5.ymatou.com",
              "//m.ymatou.com"
            );
          }
        }
      }

      ymt.titleBar(YmtApi.titleBarConfig);
    }
  }
};

YmtApi.registEvent = function() {
  if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
    if (YmtApi.checkJSBridge("registEvent")) {
      ymt.registEvent.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

YmtApi.bottomBar = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("bottomBar")) {
      ymt.bottomBar.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

YmtApi.couponProducts = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("couponProducts")) {
      ymt.couponProducts.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

YmtApi.contactBook = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("contactBook")) {
      ymt.contactBook.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.orderDetail
 * @description [原生]订单详情
 * @example
 * YmtApi.orderDetail({orderId:4008502233});
 */
YmtApi.orderDetail = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("orderDetail")) {
      ymt.orderDetail.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    // var str = 'http://sq0.ymatou.com/forBuyerApp/orderDetail?' + YmtApi.utils.param(options);
    // window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.orderCenter
 * @description [原生]打开订单中心
 * @example
 * YmtApi.orderCenter({index: 0});
 */
YmtApi.orderCenter = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("orderCenter")) {
      ymt.orderCenter.apply(ymt, arguments);
      return;
    }
  }
};

/**
 * @method YmtApi.countryList
 * @description [原生]国家列表
 * @example
 * YmtApi.countryList();
 */
YmtApi.countryList = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("countryList")) {
      ymt.countryList.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    var str =
      "http://sq0.ymatou.com/forBuyerApp/countryList?" +
      YmtApi.utils.param(options);
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.fansUserList
 * @description [原生]粉丝列表
 * @example
 * YmtApi.fansUserList({userId: 4085});
 */
YmtApi.fansUserList = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("fansUserList")) {
      ymt.fansUserList.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    options = options || {};
    var userId = options.userId || options.FollowUserId || "";
    var str =
      "http://sq0.ymatou.com/forBuyerApp/fansUserList?FollowUserId=" +
      userId +
      "&userId=" +
      userId;
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.followUserList
 * @description [原生]关注列表
 * @example
 * YmtApi.followUserList({userId: 4085});
 */
YmtApi.followUserList = function(options) {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("followUserList")) {
      ymt.followUserList.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }

    options = options || {};
    var userId = options.userId || options.FollowUserId || "";
    var str =
      "http://sq0.ymatou.com/forBuyerApp/followUserList?FollowUserId=" +
      userId +
      "&userId=" +
      userId;
    window.location.href = YmtApi.utils.addAuth(str);
  }
};

/**
 * @method YmtApi.orderPackage
 * @description [原生]套餐包
 * @example
 * YmtApi.orderPackage({
 *     type:1, //套餐类型
 *     id:1 //套餐ID
 *     pids:['',''] //套餐对应的产品ID列表
 * });
 */
YmtApi.orderPackage = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("orderPackage")) {
      ymt.orderPackage.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.promotionProduct
 * @description [原生]活动商品
 * @example
 * YmtApi.promotionProduct({
 *     sellerId:'', //买手ID
 *     promotionId:'' //促销ID，活动ID
 * });
 */
YmtApi.promotionProduct = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("promotionProduct")) {
      ymt.promotionProduct.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.notifyEvent
 * @description 事件处理
 */
YmtApi.notifyEvent = function() {
  if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
    if (YmtApi.checkJSBridge("notifyEvent")) {
      ymt.notifyEvent.apply(ymt, arguments);
      return;
    }
  }
};

/**
 * @method YmtApi.topicDetail
 * @description [原生]清单(主题)详情
 * @example
 * YmtApi.topicDetail({
 *     topicId:'' //主题Id
 * });
 */
YmtApi.topicDetail = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("topicDetail")) {
      ymt.topicDetail.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.clipboard
 * @description [原生]复制到剪切板
 * @example
 * YmtApi.clipboard({
 *     topicId:'' //主题Id
 * });
 */
YmtApi.clipboard = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("clipboard")) {
      ymt.clipboard.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.scrollEvent
 * @description [原生]控制滚动事件
 * @example
 * YmtApi.scrollEvent({
 *     topicId:'' //主题Id
 * });
 */
YmtApi.scrollEvent = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("scrollEvent")) {
      ymt.scrollEvent.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.topicList
 * @description [原生]控制滚动事件
 * @example
 * YmtApi.topicList({
 *     topicId:'' //主题Id
 * });
 */
YmtApi.topicList = function() {
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge("topicList")) {
      ymt.topicList.apply(ymt, arguments);

      // alert('This is by JsBridge');
      return;
    }
  }
};

/**
 * @method YmtApi.showShareMask
 * @description 显示分享引导
 * @param  {object} options
 *
 */
YmtApi.showShareMask = function() {
  var mask = document.getElementById("ymtapiWechatMask");
  if (!mask) {
    mask = document.createElement("div");
    mask.className = "wechat-mask show";
    mask.id = "ymtapiWechatMask";
    mask.innerHTML =
      '<div style="position:fixed;z-index:9999;left:0px;top:0px;width:100%;text-align:' +
      'center;background-color: rgba(20, 20, 20, 0.95);height: 100%;">' +
      ' <img width="90%" src="http://staticontent.ymatou.com/ymtapp/wx_share.png" /></div>';

    (document.body || document.documentElement).appendChild(mask);
  }
  mask.onclick = function() {
    this.style.display = "none";
    window.localStorage.setItem("showShareMask", "fasle");
  };

  mask.style.display = "block";
};

/**
 * @method YmtApi.initWechat
 * @description 初始化微信
 * @param 参照open方法
 * @example
 * hui.define('jweixin_share_demo', ['jweixin_share'], function () {
 *     var conf = {
 *         title: 'hy_test分享标题', // 分享标题
 *         desc: 'hy_test分享描述', // 分享描述
 *         link: 'http://haiyang.me', // 分享链接
 *         imgUrl: 'hy_test分享图标', // 分享图标
 *         type: 'link', // 分享类型,music、video或link，不填默认为link
 *         dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
 *     };
 *
 *     YmtApi.initWechat({shareConf: conf, debug: true});
 * });
 */
YmtApi.wxReadyCallback = [];
/**
 * @method YmtApi.onWeixinReady
 * @description 微信完成初始化的回调函数，如果微信已经初始化好了，则直接执行回调函数
 * @param {Function} callback 回调函数
 * @example
 * YmtApi.onWeixinReady(function () {
 *     wx.onMenuShareTimeline(shareConf);
 *     wx.onMenuShareAppMessage(shareConf);
 * });
 */
YmtApi.onWeixinReady = function(callback) {
  if (YmtApi.isWechatReady) callback();
  else YmtApi.wxReadyCallback.push(callback);
};

YmtApi.initWechat = function(opts) {
  var baseUrl = "m.ymatou.com",
    u = window.encodeURIComponent(window.location.href.split(/#/)[0]);

  var wxconf = {
    debug:
      YmtApi.startDebugWeixin === undefined ? false : YmtApi.startDebugWeixin,
    appId: "wxa06ebe9f39751792",
    timestamp: null,
    nonceStr: "",
    signature: "",
    shareConf: {
      title: "洋码头",
      desc: "购在全球，洋码头只做洋货",
      imgUrl: "http://static.ymatou.com/images/home/zbuy-logo-n.png"
    },
    jsApiList: [
      "checkJsApi",
      "onMenuShareTimeline",
      "onMenuShareAppMessage",
      "onMenuShareQQ",
      "onMenuShareWeibo",
      "hideMenuItems",
      "showMenuItems",
      "hideAllNonBaseMenuItem",
      "showAllNonBaseMenuItem",
      "translateVoice",
      "startRecord",
      "stopRecord",
      "onRecordEnd",
      "playVoice",
      "pauseVoice",
      "stopVoice",
      "uploadVoice",
      "downloadVoice",
      "chooseImage",
      "previewImage",
      "uploadImage",
      "downloadImage",
      "getNetworkType",
      "openLocation",
      "getLocation",
      "hideOptionMenu",
      "showOptionMenu",
      "closeWindow",
      "scanQRCode",
      "chooseWXPay",
      "openProductSpecificView",
      "addCard",
      "chooseCard",
      "openCard"
    ],
    menuItemConf: {
      //
      menuList: [
        "menuItem:exposeArticle",
        "menuItem:setFont",
        "menuItem:dayMode",
        "menuItem:nightMode",
        // 'menuItem:refresh',
        "menuItem:profile",
        "menuItem:addContact",

        /*'menuItem:share:appMessage',
                'menuItem:share:timeline',
                'menuItem:share:qq',
                'menuItem:share:weiboApp',
                'menuItem:favorite',
                'menuItem:share:facebook',*/
        "menuItem:share:QZone",

        "menuItem:editTag",
        "menuItem:delete",
        "menuItem:copyUrl",
        "menuItem:originPage",
        "menuItem:readMode",
        /*'menuItem:openWithQQBrowser',
                'menuItem:openWithSafari',*/
        "menuItem:share:email",
        "menuItem:share:brand"
      ],
      success: function() {},
      fail: function() {
        wx.showOptionMenu();
        wx.showAllNonBaseMenuItem();
      }
    }
  };

  for (var i in opts) {
    wxconf[i] = opts[i];
  }

  window.jweixin_share_callback = function(res) {
    res = res || {};

    if (!res.Signature || !res.TimeStamp || !res.NonceStr) return;
    wxconf.signature = res.Signature;
    wxconf.timestamp = res.TimeStamp;
    wxconf.nonceStr = res.NonceStr;
    wxconf.appId = res.AppId;

    wx.config(wxconf);

    var onreadyhandeler = function() {
      if (YmtApi.isWechatReady) return;
      YmtApi.isWechatReady = true;

      wx.hideMenuItems(wxconf.menuItemConf);

      var callback = YmtApi.wxReadyCallback.shift();
      while (callback) {
        if (typeof callback === "function") callback();
        callback = YmtApi.wxReadyCallback.shift();
      }
    };

    wx.ready(function() {
      if (document.readyState == "complete") {
        onreadyhandeler();
      } else {
        window.addEventListener("WeixinJSBridgeReady", onreadyhandeler, false);
      }

      window.setTimeout(function() {
        if (!YmtApi.isWechatReady) onreadyhandeler();
      }, 500);
    });
  };

  var elem = document.createElement("script");
  elem.src =
    "//" +
    baseUrl +
    "/GetJsSignature.aspx?v=" +
    new Date().getTime() +
    "&appId=" +
    wxconf.appId +
    "&u=" +
    u +
    "&callback=jweixin_share_callback";
  document.documentElement.appendChild(elem);
};

// 初始化微信JS-SDK
var ua = window.navigator.userAgent;

// 判断是否在小程序里面， android在小程序webview的window.location跳转时候，小程序
// 的__wx_enviroment为undefined，所以需要再加上从url上获取标志参数来判断是否是小程序
YmtApi.isMiniApp = (window && window.__wxjs_environment === 'miniprogram') || (YmtApi.utils.getUrlObj().isMiniApp)

YmtApi.isWechat = /MicroMessenger/i.test(ua);
YmtApi.isAndroid = /Android|Linux/i.test(ua);
YmtApi.isIos = /\(i[^;]+;( U;)? CPU.+Mac OS X/i.test(ua);
// YmtApi.appVersion = window.navigator.userAgent.match(/appVersion\/[0-9]\.[0-9]\.[0-9]/);
YmtApi.appVersion = window.navigator.userAgent.match(/appVersion\/[\.\d]*/);
YmtApi.appVersion =
  YmtApi.appVersion && YmtApi.appVersion.length ? YmtApi.appVersion[0] : 0;

if (YmtApi.isWechat) YmtApi.initWechat({});


/**
 * @method YmtApi.checkJSBridge
 * @description 检测是否支持新版YmtJSBridge
 * @example
 * YmtApi.checkJSBridge();
 */
YmtApi.checkJSBridge = function(n) {
  var w = window.WebViewJavascriptBridge;
  var result = false;
  var list = "";

  if (!w) result = false;
  if (YmtApi.isAndroid) {
    // IOS and Android has diff version number!
    list +=
      "|openWin|closeWin|share|openChat|pay|userLogin|productDetail|noteFansList|activityPartnerList|";
    list +=
      "|comment|replyComment|publishNote|onlineService|callPhone|feedBack|liveDetail|bindMobile|";
    list +=
      "|uploadUserIcon|tabHome|noteDetail|titleBar|registEvent|bottomBar|couponProducts|contactBook|";
    list += "|sendYLog|";

    if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/4.6")) {
      list += "|shareWith|";
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list +=
        "|topicDetail|notifyEvent|orderPackage|promotionProduct|orderCenter|";
      list += "|withdraw|order|attach|"; // 线上版本3.2.4
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    }else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.3.1")) {
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list +=
        "|topicDetail|notifyEvent|orderPackage|promotionProduct|orderCenter|";
      list += "|withdraw|order|attach|"; // 线上版本3.2.4
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.5")) {
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list += "|withdraw|order|attach|"; // 线上版本3.2.4
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.4")) {
      list += "|clipboard|scrollEvent|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list += "|withdraw|order|attach|"; // 线上版本3.2.4
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.0")) {
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list += "|withdraw|order|attach|"; // 线上版本3.1.2
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.1.2")) {
      list += "|withdraw|order|attach|"; // 线上版本3.1.2
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.0.2")) {
      list +=
        "|noteBrand|noteType|interestMap|similarProduct|similarTopic|search|orderDetail|countryList|fansUserList|followUserList|"; // 线上版本3.0.2

      result = list.indexOf("|" + n + "|") > -1;
    } else if (
      w && 
      w.getVersion &&
      w.getVersion() &&
      list.indexOf("|" + n + "|") > -1
    )
      result = true;
  } else if (YmtApi.isIos) {
    if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/4.6")) {
      list += "|shareWith|";
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|orderCenter|";

      result = list.indexOf("|" + n + "|") > -1;
    }else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.8")) {
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|orderCenter|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.6")) {
      list += "|topicList|";
      list += "|clipboard|scrollEvent|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.4")) {
      list += "|clipboard|";
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.2.1")) {
      list += "|topicDetail|notifyEvent|orderPackage|promotionProduct|";
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.1.1")) {
      list +=
        "|tabHome|userLogin|getLoginStatus|getUserInfo|uploadUserIcon|chooseImage|uploadImage|pay|withdraw|orderDetail|comment|";
      list +=
        "|replyComment|publishNote|noteFansList|activityPartnerList|onlineService|openChat|liveDetail|productDetail|feedBack|";
      list +=
        "|contactBook|bindMobile|getDeviceInfo|callPhone|screenShot|sendUmengLog|sendYLog|";

      list += "|withdraw|order|attach|";

      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.1.0")) {
      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.0.1")) {
      list += "|openWin|closeWin|share|registEvent|bottomBar|titleBar|";
      list += "|couponProducts|similarProduct|similarTopic|search|";
      list +=
        "|interestMap|noteBrand|noteType|orderDetail|followUserList|fansUserList|countryList|";

      result = list.indexOf("|" + n + "|") > -1;
    } else if (YmtApi.compareVersion(YmtApi.appVersion, "appVersion/3.0.0")) {
      list += "|openWin|closeWin|share|registEvent|"; // 线上版本3.0.1

      result = list.indexOf("|" + n + "|") > -1;
    } else result = false;
  }
  return result;
};

if (YmtApi.isSaohuoApp || YmtApi.isSellerApp) {
  ymt.config({
    debug: false,
    appId: "",
    timestamp: "",
    nonceStr: "",
    signature: "",
    jsApiList: []
  });
}

// 添加认证监听
YmtApi.on("userStatusChange", function(ret) {
  YmtApi.auth = {
    AccessToken: ret.AccessToken,
    UserId: ret.UserId
  };
});

YmtApi.refresh = function(ret) {
  ret = ret || {
    UserId: "",
    AccessToken: ""
  };
  var url = YmtApi.utils.addParam(
    YmtApi.utils.delAuth(window.location.href),
    ret
  );
  window.location.href = url;
};

YmtApi.sendEvent = function(eventName, data, callback) {
  if (Object.prototype.toString.call(data) === "[object String]") {
    data = JSON.parse(data);
  }
  // 监听页面刷新事件
  // 1001 页面刷新 {"PageType": 1,"Status":1}
  // YmtApi.on('refreshPageEvent', function(res, callback) {

  // 监听用户点我喜欢
  // 1002 点击我喜欢 {"Status":1} //1喜欢，0不喜欢
  // YmtApi.on('clickFavoriteEvent', function(res) {

  // 监听用户评论完成
  // 1003 评论完成 YmtApi.sendEvent('sendCommentEvent',);
  // YmtApi.on('sendCommentEvent', function(res) {

  // 监听用户登录态变更
  // 1004 登录状态改变 {"UserId":"1", "AccessToken ":"AFEEEAAA"}
  // YmtApi.on('userStatusChange', function(res, callback) {

  // 1005 页面位置定位
  // sendPositionEvent
  var oldEvent = {
    refreshPageEvent: 1001,
    userStatusChange: 1004,
    clickFavoriteEvent: 1002,
    sendCommentEvent: 1003,
    sendPositionEvent: 1005,
    1001: "refreshPageEvent",
    1004: "userStatusChange",
    1002: "clickFavoriteEvent",
    1003: "sendCommentEvent",
    1005: "sendPositionEvent"
  };
  if (YmtApi.isSaohuoApp && YmtApi.checkJSBridge() && oldEvent[eventName]) {
    YmtApi.trigger(oldEvent[eventName], data, callback);
  }

  YmtApi.trigger(eventName, data, callback);

  return YmtApi;
};
/**
 * @method YmtApi.sendEvent
 * @description 触发事件
 * @example
 * // 刷新页面
 * YmtApi.sendEvent('refreshPageEvent', {
 *     'PageType': 1,
 *     'Status': 1
 * });
 * // 用户登录态变更
 * YmtApi.sendEvent('userStatusChange', {
 *     'UserId': '1',
 *     'AccessToken ': 'AFEEEAAA'
 * });
 * // 用户点我喜欢
 * YmtApi.sendEvent('clickFavoriteEvent', {
 *     'Status': 1
 * });
 *
 * // 监听页面刷新事件
 * YmtApi.on('refreshPageEvent', function (res) {
 *     // res => {
 *     //     'PageType': 1,
 *     //     'Status': 1
 *     // };
 *     // Todo
 * });
 * // 监听用户登录态变更
 * YmtApi.on('userStatusChange', function (res) {
 *     // res => {
 *     //     'UserId': '1',
 *     //     'AccessToken ': 'AFEEEAAA'
 *     // };
 *     // Todo
 * });
 * // 监听用户点我喜欢
 * YmtApi.on('clickFavoriteEvent', function (res) {
 *     // res => {
 *     //     'Status': 1
 *     // };
 *     // Todo
 * });
 */
YmtApi.fn = function(func, scope) {
  if (Object.prototype.toString.call(func) === "[object String]") {
    func = scope[func];
  }
  if (Object.prototype.toString.call(func) !== "[object Function]") {
    throw 'Error "hui.fn()": "func" is null';
  }
  var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
  return function() {
    var fn =
        "[object String]" == Object.prototype.toString.call(func)
          ? scope[func]
          : func,
      args = xargs ? xargs.concat([].slice.call(arguments, 0)) : arguments;
    return fn.apply(scope || fn, args);
  };
};
YmtApi.extend = hui.extend;

YmtApi.ready = YmtApi.fn(ymt.ready, ymt);
// Proxy ymt to YmtApi
YmtApi.ready(function() {
  for (var i in ymt) {
    if (!YmtApi[i] && typeof ymt[i] == "function") {
      YmtApi[i] = YmtApi.fn(ymt[i], ymt);
    }
  }
});

if (window.hui && hui.define) {
  hui.define("ymtapi", [], function() {});
  // Compatable for old version.
  hui.define("ext_ymtapi", [], function() {});
}

if ("function" == typeof define) {
  if (define.amd)
    define(function() {
      return YmtApi;
    });
  else
    define(function(require, exports, module) {
      module.exports = YmtApi;
    });
}

// Not use in YmtApi, only for defining ymtapi_unity.js
window.hui && hui.define && hui.define("ymtapi_unity", [], function() {});

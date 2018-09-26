var isFuntion = function (target) {
    return 'function' === typeof target
}

var isObject = function (target) {
  return 'object' === typeof target
}

var extractModuleMetadata = function (code) {
  if (!typeof code === 'string') throw new Error('asset meta needs to be a string')
  var params = code.split('@')
  var code = params[0]
  var data = {}
  var dataParams = params.slice(1)
  dataParams.forEach((dataItem) => {
    var arr = dataItem.split('_')
    var key = arr[0]
    var value = arr[1] || true
    data[key] = value
  })
  return {
    code, data
  }
}


var runInNode = function (target) {
  if ('undefined' !== typeof window) {
    var fn = target(window)
    return fn
  }
  return () => {}
}
var parseLocator = function(url, args) {
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
 /* 通过jsonp获得数据
 * @param  {String}   url      请求的地址
 * @param  {Function} callback 回调方法
 * @param  {String}   fnName   [description]
 * @return {[type]}            [description]
*/
var jsonp = function (urlConfigs, callback, callbackName) {
    var defUrlConfigs = {
      host: 'jsapi.ymatou.com',
      root: 'evt'
    }

    // var defUrlConfigs = { // sit环境使用
    //   host: 'evt.jsapi.ymatou.com',
    //   protocol: 'http',
    //   root: 'Api'
    // }

    var buildUrl = function (cfg) {
      var RM_LEADING_SEP = function (str) {
        if (str === '/') return ''
        return str.replace(/^\//, '')
      }

      var RM_TRAILING_SEP = function (str) {
        return str.replace(/\/$/, '')
      }

      var JOIN_PATH = function (str, isFile) {
        var ret = RM_LEADING_SEP(RM_TRAILING_SEP(str))
        ret = ret ? `${ret}/` : ret
        ret = isFile ? ret.replace(/\/$/, '') : ret
        return ret
      }

      return `//${cfg.host}/${JOIN_PATH(cfg.root)}${JOIN_PATH(cfg.path, true)}`
    }

    var cbFn = {}

    if (typeof callback === 'function') {
        cbFn.success = callback
    }

    if (typeof callback === 'object') {
        cbFn = callback
    }

    cbFn.error = cbFn.error || function (res) {
        // var index = res.Msg.indexOf(':');
        // if (index != -1) {
        //     res.Msg = res.Msg.slice(index + 1);
        // }
    }

    var getDefCallbackName = function() {
      var requestid = '' + Date.now() + parseInt(Math.random() * 1000)
      return 'ymtcb' + requestid
    }

    $.ajax({
        url: urlConfigs.url || buildUrl($.extend(defUrlConfigs, urlConfigs)),
        type: 'GET',
        jsonpCallback: callbackName || getDefCallbackName(),
        dataType: 'jsonp',
        timeout: 30000,
        cache: true,
        success: function (res) {
            if (res && (res.Code === 200 || res.Code === '200')) {
                isFuntion(cbFn.success) && cbFn.success(res.Data);
            }
            else {
                cbFn.error = callback;
                isFuntion(cbFn.error) && cbFn.error(res);
            }
        },
        error: function (res) {

            isFuntion(cbFn.error) && cbFn.error(res);
        }
    })
}

var adaptHeight = runInNode(function(){
  return (url) => {
    // 匹配图片高宽信息
    var hw = url && url.match(/(\d+)_(\d+)_[a-zA-Z]/) || []
    if (hw && hw.length && hw.length == 3) {
      return ($(window).width() / parseInt(hw[1]) * parseInt(hw[2])) + 'px'
    }
    return 'auto'
  }
})

var imgLazyLoader = runInNode(function(){
  var lazyLoad = {
        version: '1.0.3'
    };

    var callback = function() {};

    var offset, poll, throttle, unload;

    var initialized = false

    //使用requestAnimationFrame 替代 settimeout 来处理
    var raf = window.requestAnimationFrame || function(fn) {
            clearTimeout(poll);
            poll = setTimeout(fn, throttle);
        }
        /**
         * 判断元素是否在视口中
         * @param  {element} element 图片对象
         * @param  {object}  view 视图及页面显示部分
         * @return {Boolean} 是否在视图中
         */
    var inView = function(element, view) {
        var box = element.getBoundingClientRect();
        return ((box.top >= view.t && box.top < view.b || box.bottom >= view.t && box.bottom < view.b || box.bottom > view.b && box.top < view.t) && (box.left >= view.l && box.left < view.r || box.right < view.l && box.right <= view.r || view.l >= box.left && view.r <= box.right))
    };

    /**
     * 判断元素是否显示中
     * @param  {Element} element
     * @return {boolea}  是否显示
     */
    var isShow = function(element) {
        return String.prototype.toLocaleLowerCase.apply(element.style.display) !== 'none'
    }

    var debounce = function() {
        raf(lazyLoad.render);
    };

    lazyLoad.init = function(opts) {
        if (initialized) return
        opts = opts || {};
        var offsetAll = opts.offset || 0;
        var offsetVertical = opts.offsetVertical || offsetAll;
        var offsetHorizontal = opts.offsetHorizontal || offsetAll;
        var optionToInt = function(opt, fallback) {
            return parseInt(opt || fallback, 10);
        };
        this.offset = {
            t: optionToInt(opts.offsetTop, offsetVertical),
            b: optionToInt(opts.offsetBottom, offsetVertical),
            l: optionToInt(opts.offsetLeft, offsetHorizontal),
            r: optionToInt(opts.offsetRight, offsetHorizontal)
        };
        throttle = optionToInt(opts.throttle, 250);
        unload = !!opts.unload;
        callback = opts.callback || callback;
        this.render();
        if (document.addEventListener) {
            window.addEventListener('scroll', debounce, false);
            window.addEventListener('touchstart', debounce, false);
            window.addEventListener('load', debounce, false);
        }

        initialized = true
    };
    lazyLoad.render = function() {
        var nodes = (function() {
            var lazyLoad = [].slice.call(document.querySelectorAll('img[lazy-load]'), 0),
                lazyLoadBackgroud = [].slice.call(document.querySelectorAll('[lazy-load-background]'), 0);

            [].push.apply(lazyLoad, lazyLoadBackgroud);

            return lazyLoad;
        })()

        var length = nodes.length;
        var src, elem;

        var view = {
            l: (window.pageXOffset || document.documentElement.scrollLeft) - lazyLoad.offset.l,
            t: -lazyLoad.offset.t,
            b: window.innerHeight + lazyLoad.offset.b,
            r: (window.innerWidth+2000 || document.documentElement.clientWidth+2000) + lazyLoad.offset.r
        };

        var loadError = function(elem) {
            var errImg = 'data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw==';
            if (elem.getAttribute('lazy-load')) {
                elem.removeEventListener('error');
                elem.removeEventListener('load');
                elem.src = errImg;
            } else if (elem.getAttribute('lazy-load-background')) {
                elem.style.backgroundImage = 'url(' + errImg + ')';
            }

            elem.className += ' lazyload-error ';
        };

        /**
         * 检测加载状态
         * @param  {Element}   elem     [description]
         * @param  {Function} sucFn [description]
         * @param  {Function} failFn [description]
         */
        var monitorLoad = function(elem, sucFn, failFn, targetElem) {
            elem.addEventListener('load', function() {
                elem = targetElem || elem;
                elem.style.opacity = '1';
                sucFn(this, 'load');
            }, false);

            elem.addEventListener('error', failFn, false);
        }

        for (var i = 0; i < length; i++) {
            elem = nodes[i];
            if (isShow(elem) && inView(elem, view)) {
                if (unload) {
                    elem.setAttribute('lazy-load-placeholder', elem.src);
                }
                src = elem.getAttribute('lazy-load') || elem.getAttribute('lazy-load-background');

                elem.removeAttribute('lazy-load');
                elem.removeAttribute('lazy-load-background');
                elem.className += ' lazyload transition';


                var style = elem.getAttribute('style');

                if (elem.tagName === 'IMG') {

                    (function(elem) {
                        monitorLoad(elem, function() {
                            callback(elem, 'load');
                        }, function() {
                            loadError(elem);
                        });
                    })(elem);

                    elem.src = src;

                    /* //图片写在background-image时的做法
                     if (!style || style.indexOf('background') == -1) {
                         elem.src = src;
                     } else if (style && style.indexOf('background') != -1) {
                          elem.style.backgroundImage = 'url(' + src + ')';
                     }*/

                } else {
                    var img = new Image();
                    (function(elem, src) {
                        monitorLoad(img, function() {
                            elem.style.backgroundImage = 'url(' + src + ')';
                            callback(elem, 'load');
                        }, function() {
                            loadError(elem);
                        }, elem);
                    })(elem, src);

                    img.src = src;
                }
            }
        }

        /*if (!length) {
            lazyLoad.detach();
        }*/
    };

    /**
     * 提供外部API可以手动检查
     */
    lazyLoad.check = debounce;

    lazyLoad.detach = function() {
        if (document.removeEventListener) {
            $(window).off('scroll')
                .off('touchstart');
        }
        /* else {
            window.detachEvent('onscroll', debounce);
        }*/
        clearTimeout(poll);
    };

   return lazyLoad
})

var raf = runInNode(function() {
  var RAF = {
    version:'1.0.0'
  }

  if (!Date.now)
  Date.now = function() { return new Date().getTime(); };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        RAF.invoke = window[vp+'RequestAnimationFrame'];
        RAF.cancel = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !RAF.invoke || !RAF.cancel) {
        var lastTime = 0;
        RAF.invoke = function(callback, threashold) {
            threashold = threashold || 1000/60
            var now = Date.now();
            var nextTime = Math.max(lastTime + threashold, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        RAF.cancel = clearTimeout;
    }

    return RAF
})


/**
* zepto plugin for fixing the element to
* the top of viewport when scrolling to it's position
*/
var fixTop = runInNode(function(){
// var fixTop = (function( $ ) {
  if (!$)
    throw error("Zepto global variable not found when using fixedTop")

  var FixTop = {
    version: '1.0.0'
  }

  FixTop.top = function(el, options) {
    if (!el) return

		// Define default setting
		var settings = $.extend({
			marginTop: 0,
			zIndex: 1000,
			fixedWidth: "100%"
    }, options );

    // this.navHeight = el.height();
    // console.log('nav的offset-top');
    // console.log(el.offset().top);

		var missingHeight = el.height() + settings.marginTop;

    var from_top = el.offset().top - settings.marginTop;
    var end_top = settings['rangeEnd'];

		var blankArea = $("<div/>")
		blankArea.css({
        'display' : el.css('display'),
        'width' : el.width(),
        'height' : el.height(),
        'float' : el.css('float')
    });

    var self = this;
	  $(window).scroll(function(e){
      var scrollTop = $(this).scrollTop();
	    //Set position of sub navogation
	    if (scrollTop > from_top && (!end_top || scrollTop < end_top) && el.css('position') != 'fixed'){
        //el.parents('.module').css({'visibility': 'visible'});
        el.find('#nav-scroll').removeClass('height0');
        // el.parents('.module').removeClass('height0');
        //console.log('进入');
	    	el.after(blankArea);
	      el.css({
          'display': 'block',
          //'visibility': 'visible',
	      	'position': 'fixed',
	      	'top': settings.marginTop+'px',
	      	'z-index': settings.zIndex,
	      	'width': settings.fixedWidth,
          'transform': 'translateY(0px)'
	      });
        self.navHeight = el.height();
	      if(settings.fixed !== undefined){
	      	settings.fixed(el);
	      }
	    }
      // var transitionBegin = end_top - navHeight, transitionEnd = end_top;
      // if($(this).scrollTop() > transitionBegin && $(this).scrollTop() < transitionEnd){
      //   var increment = $(this).scrollTop() - transitionBegin;//增量
      //   //blankArea.remove();
      //   el.css({
      //     'transform': 'translateY(-' + increment + 'px' + ')'
      //   })
      // }


	    if ((scrollTop < from_top || (end_top && scrollTop > end_top)) && el.css('position') == 'fixed'){
        //el.parents('.module').css({'visibility': 'hidden'});
        //console.log('出去');
        // el.find('#nav-scroll').addClass('height0');
        // el.find('#nav-scroll').hide();
        // el.parents('.module').addClass('height0');
	    	blankArea.remove();
	    	el.css({
          'display': 'none',
          //'visibility': 'hidden',
	     		'position': 'relative',
	     		'top': '0px',
	     		'z-index': settings.zIndex,
          'transform': 'translateY(0px)'
	     	});
	     	if(settings.unfixed !== undefined){
	      	settings.unfixed(el);
	     	}
	    }
	  });

		// Return Zepto so that it's chainable
		return el;
  };

  //判断
  FixTop.isInView = function($el){
    if(!$el){
      return;
    }
    var rangeBegin = $el.offset().top;
    var rangeEnd =  rangeBegin + $el.height();
    this.isInViewByRange([rangeBegin, rangeEnd]);
  };

  //判断
  FixTop.isInViewByRange = function(range){
    if(!range){
      return;
    }
    var scrollTop = $('body').scrollTop() + window.innerHeight/3;
    if (scrollTop >= range[0] && scrollTop <= range[1]){
      return true;
    }
  };

  FixTop.aimToView = function($el){
    var navHeight = (94 /2);
    var rangeBegin = $el.offset().top - navHeight + 5;
    $('body').scrollTop(rangeBegin);
  },

  //锚点至view
  FixTop.anchorView = function($el, idx, partId){
    if(!$el){
      return;
    }
    var navHeight = (94 /2);
    var rangeBegin = $el.offset().top - navHeight + 5;
    // console.log('anchorView 判断');
    // console.log($el);
    // console.log($el.offset());
    //
    // console.log('anchorView 开始进入....');
    // console.log('navHeight: ' + navHeight);
    // $('body').scrollTop(rangeBegin);
    if($('.nav').find('li').eq(idx).data('loaded')){
      $('body').scrollTop(rangeBegin);
      return;
    }

    var viewportSize =  window.innerHeight;
    var tiqianliang = 1000;
    var windowBegin = rangeBegin - tiqianliang, windowEnd = rangeBegin + viewportSize + tiqianliang ;
    var wRange = [windowBegin, windowEnd];//窗口范围

    var allLoad = true;//是否范围内的模块全部被加载
    $.each(window.bigObj, function(moduleId, moduleItem){
      if(moduleItem['loaded']){
        return;
      }
      
      var mRange = moduleItem['range'];//模块范围
     
      //判断模块范围是否在窗口范围之内      
      if((mRange[0] >= wRange[0] && mRange[0] <= wRange[1]) || (mRange[1] >= wRange[0] && mRange[1] <= wRange[1])){//inview
        allLoad = false;
        moduleItem['loaded'] = true;
        // console.log('moduel laded:'+ moduleId);
        moduleItem.datatopass = moduleItem.datatopass || {};
        moduleItem.datatopass.anchorView = partId;
        moduleItem.datatopass.tabIndex = idx;        
        ymtloader.load(moduleId,  moduleItem.code, {partmetadata: moduleItem.datatopass})
      }
    });

    if(allLoad){
      $('.nav').find('li').eq(idx).data('loaded', 1);
      // $('.nav').find('li').eq(idx).css({'border': '3px solid green;'});//test
      // console.log('全部加载完毕....');
      // console.log($el.offset());
      $('body').scrollTop($el.offset().top - navHeight + 5);
    }


    // $('.modules').one('moduleloaded' ,function(e, module){
    //   console.log('click callback!~~~~~~~~~~~~~~~');
    //   // setTimeout(function(){
    //   //   console.log('shoudong click: ');
    //   //   self.tabClicked(self.curMenuIdx, module.id);
    //   // }, 700);
    //   setTimeout(function(){
    //     $('body').scrollTop(rangeBegin);
    //   }, 3000);
    //
    // });
  }

  return FixTop
});


var inView = runInNode(function() {

  var InView = {
    version : '1.0.0'
  }

  function throttle(fn, threshhold, scope) {
    return function () {
      raf.invoke(fn, threshhold)
    }
  }

  function hasClass(el, name) {
      return new RegExp(' ' + name + ' ').test(' ' + el.className + ' ');
  }

  function addClass(el, name) {
      if (!hasClass(el, name)) {
          el.className += ' ' + name;
      }
      return el;
  }

  function removeClass(el, name) {
      var newClass = ' ' + el.className.replace(/[\t\r\n]/g, ' ') + ' ';
      if (hasClass(el, name)) {
          while (newClass.indexOf(' ' + name + ' ') >= 0) {
              newClass = newClass.replace(' ' + name + ' ', ' ');
          }
          el.className = newClass.replace(/^\s+|\s+$/g, '');
      }
      return el;
  }

  function addEvent(el, name, fn) {
      if (el.addEventListener) {
          return el.addEventListener(name, fn, false);
      } else if (el.attachEvent) {
          return el.attachEvent('on' + name, fn);
      }
  }

  function getScrollTop() {
      if (typeof window.pageYOffset !== 'undefined') {
          return window.pageYOffset;
      } else {
          var b = document.body;
          var d = document.documentElement;
          d = d.clientHeight ? d : b;
          return d.scrollTop;
      }
  }

  function isInView(obj, offset) {
      var winTop = getScrollTop(),
          winBottom = winTop + window.innerHeight,
          objTop = obj.offsetTop,
          objBottom = objTop + obj.offsetHeight;

      offset = offset || 0;

      if ((objTop <= winBottom + offset) && (objBottom >= winTop)) {
          return true;
      }
  }

  /**
   * @desc Create an InView instance.
   *
   * @class
   * @func InView
   * @param {HTMLElement} element - element to detect when scrolled to view
   * @param {scrollCallback} scrollCallback - callback function fired on scroll event
   * @return {HTMLElement} - element
   *
   * @example
   * var el = document.querySelector('.item');
   *
   * var InView = InView(el, function(isInView, data) {
   *   if (isInView) {
   *     console.log('in view');
   *   } else {
   *     if (data.windowScrollTop - (data.elementOffsetTop - data.inViewHeight) > data.inViewHeight) {
   *       console.log('not in view (scroll up)');
   *     } else {
   *       console.log('not in view (scroll down)');
   *     }
   *   }
   * });
   */
  InView.observe = function (el, callback, offset) {
    function check() {
        var params = {
          windowScrollTop: getScrollTop(),
          elementOffsetTop: el.offsetTop,
          inViewHeight: window.outerHeight,
          elementOffsetTopInViewHeight: window.outerHeight - (getScrollTop() - (el.offsetTop - window.outerHeight))
        };
        if (isInView(el, offset)) {
            addClass(el, 'inview');
            callback.call(el, true, params);
        } else {
            removeClass(el, 'inview');
            callback.call(el, false, params);
        }
    }

    var throttledCheck = throttle(check, 1000 / 60);

    check();
    addEvent(window, 'scroll', throttledCheck);
    addEvent(window, 'checkInView', throttledCheck);
  }
  /**
   * @desc InView callback
   *
   * @callback scrollCallback
   * @param {boolean} isInView - is in view
   * @param {object} data - scroll data
   * @param {number} data.windowScrollTop - scrolled amount
   * @param {number} data.elementOffsetTop - element top offset
   * @param {number} data.inViewHeight - height of visible area
   * @param {number} data.elementOffsetTopInViewHeight - element top offset relative to height of visible area
   */

  return InView
})

var styleHelper = (function () {
  var helper = {
    torem: function (num) {
      return num / 32 + 'rem'
    }
  }
  return helper
})()

var convertImgUrl = (function(){
  var converter = {
    version:'0.2.0'
  }

  converter.convert = function(oldUrl) {
    if(oldUrl.indexOf('_n_')>-1 || oldUrl.indexOf('shangou')>-1){
        return oldUrl.replace('_o.','_l.');
    }

    if(oldUrl.indexOf('/product/')>-1){
        return oldUrl.replace("original","list").replace("_o.","_l.");
    }

    if(oldUrl.indexOf('original')>-1){
        return oldUrl.replace("original", "listb").replace("_o.", "_lb.");
    }

    if(oldUrl.indexOf('lists')>-1){
        return oldUrl.replace("lists", "listb").replace("_ls.", "_lb.");
    }

    if(oldUrl.indexOf('/list')>-1){
        return oldUrl.replace("/list", "/listb").replace("_l.", "_lb.");
    }

    return oldUrl.replace("_o.","_lb.").replace("_ls.","_lb.").replace("_l.","_lb.");
  }

  return converter
})()

var utils = {
  jsonp,
  imgLazyLoader,
  fixTop,
  inView,
  raf,
  styleHelper,
  convertImgUrl,
  runInNode,
  extractModuleMetadata,
  adaptHeight,
  parseLocator
}

if (typeof window != 'undefined') {
  window.utils =  utils
}

export default utils

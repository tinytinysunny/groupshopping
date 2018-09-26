var runInNode = function (target) {
    if ('undefined' !== typeof window) {
        var fn = target(window)
        return fn
    }
    return () => {}
}

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

export default{
	imgLazyLoader
}

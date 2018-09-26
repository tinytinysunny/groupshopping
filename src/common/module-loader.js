import utils from 'common/utils'

var loader = (function () {
  var VMS = {}   // mappings of module code and creator
  var modules = {} //  mappings of module id and vms
  var body = document.body


var count = 0;

/**
 * Noop function.
 */

function noop(){}

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }


  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }


  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');


  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}



function loadScript(url) {
         var script = document.createElement("script");
         script.type = "text/javascript";
         script.src = url;
         document.body.appendChild(script);
     }
     // 测试

// 动态加载css文件
    function loadStyles(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }


  var $mount = ($VMOptions, mt, data, replace) => {
     var VM = Vue.extend($VMOptions)
    new VM({
      propsData: data,
      el: mt
    })
    // var el, vm, mountpointEl
    // VM.props = data
    // VM.el = mt
    // vm = new Vue(VM)
    // if (typeof VM === 'function') {
    //   vm = new VM({props: data})
    // } else if (typeof VM === 'object') {
    //   vm = module
    //   vm.data = data
    // }
    // render dom
    // console.log(vm)

    // if (vm.$mount) {
    //   vm.$mount(mt)
    // } else if (vm.render) {
    //   el = vm.render.call(vm)
    //
    //   if (mt.nodeType && mt.nodeType === 1) mountpointEl = mt
    //   if (typeof mt === 'string') mountpointEl = body.querySelector(mt)
    //   if (mt) {
    //     replace ? body.replceChild(mountpointEl, el) : mountpointEl.append(el)
    //     return
    //   }
    //   console.warn(`mount point is not found for module '${vm.name}'`)
    // }
    //
    // console.error('fail to mount the component')
  }

  return {
    register: function (code, module) {
      if (VMS[code]) {
        console.warn(`VM ${code} is already registed`)
        return
      }
      VMS[code] = module
    },

    isLoaded: utils.runInNode(function () {
      return (moduleId) => {
        return !!modules[moduleId]
      }
    }),


    asyncLoad: utils.runInNode(function() {

      return  () => {
        const path = '//s1.ymatou.com/evt/static'
          Object.keys(window.__INITIAL_STATE_FLATTEN).forEach((moduleId)=>{
            if (window.__INITIAL_STATE_FLATTEN[moduleId].SkinId == 'customskin') {

    //         // if (!modules[moduleId]) return
            jsonp(`//jsapi.ymatou.com/evt/api/page/GetCustomPagePartInfo?PagePartId=${moduleId}`, function (err, data) {
    //             if (err) return

                if (data.Data) {
                    var res = JSON.parse(data.Data)
                    if (res.js) {

                      loadScript( res.js)
                    }

                    if (res.css){

                      loadStyles( res.css)
                    }
                  }
                })

              }})


            }
          }
      ),

    // asyncLoad: utils.runInNode(function() {
    //   return  () => {
    //       Object.keys(window.__INITIAL_STATE_FLATTEN).forEach((moduleId)=>{

    //         if (window.__INITIAL_STATE_FLATTEN[moduleId].SkinId == 'customskin') {

    //         // if (!modules[moduleId]) return

    //         jsonp(`//jsapi.ymatou.com/evt/api/page/GetCustomPagePartInfo?PagePartId=${moduleId}`, function (err, data) {
    //             if (err) return
    //             if (data) {
    //               if (data.js) {
    //                 loadScript(path + data.js)
    //               }

    //               if (data.css){
    //                 loadStyles(path + data.css)
    //               }
    //             }

    //           });


    //         }
    //       })
    //   }



    load: utils.runInNode(function () {
      return (moduleId, code, data) => {
         // if (modules[moduleId]) return // already loaded
        var target = [].slice.call(body.querySelectorAll('.module')).filter((el) => {
          return el.getAttribute('data-id') == moduleId
        })

        if (target && target.length) {
          var mt = target[0].querySelector('.loader-mt')
          if (mt) {            
            $mount(VMS[code], mt, data)
            modules[moduleId] = true
            window.bigObj && window.bigObj[moduleId] && (window.bigObj[moduleId].loaded = true)
          }
        }
      }
    })
  }
})()

window.ymtloader = loader

export default loader

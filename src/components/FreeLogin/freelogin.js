import FreeLogin from './ui-freelogin'


// function getCookie(name) {
//     var start = document.cookie.indexOf(name + '=');
//     var len = start + name.length + 1;
//     if ((!start) && (name != document.cookie.substring(0, name.length))) {
//         return undefined;
//     }
//     if (start == -1) return undefined;
//     var end = document.cookie.indexOf(';', len);
//     if (end == -1) end = document.cookie.length;
//     return unescape(document.cookie.substring(len, end));
// };
// function setCookie(name, value, expires, path, domain, secure) {
//     expires = expires === undefined ? 100 * 360 * 24 * 60 * 60 * 1000 : (expires || 0);
//     var expires_date = new Date((new Date()).getTime() + expires);
//     document.cookie = name + '=' + escape(value) + ';expires=' + expires_date.toGMTString() +
//         (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
// };
// hui.removeCookie = hui. || function(name, path, domain) {
//     if (hui.getCookie(name)) document.cookie = name + '=' + (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + ';expires=' + (new Date(0)).toGMTString();
// };


function parseLocator(url, args) {
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
      } else query[key] = str[1];
    }

    for (var i in query) {
      if (query[i] && query[i].length === 1) {
        query[i] = query[i][0];
      }
    }
  }
  return query;
}


function getaccesstoken(){
  var accesstoken = parseLocator(window.location.href, 'lower').accesstoken;
  if(accesstoken && accesstoken != 'undefined' && accesstoken != 'null' && accesstoken != 'nil') {
    return true
  } else {
    if(YmtApi.isSaohuoApp) {
      return false
    } else {
      $.get('//m.ymatou.com/account/api/user_status', function(data) {
        if(data.Status == 200 && data.Result && data.Result.accessToken) {
          return true
        } else {
          return false
        }
      })
    }
  }
}

var dogetaccesstoken = function(callback){
  var urlData = parseLocator(window.location.href, 'lower');
  var accesstoken = urlData.accesstoken;
  if(accesstoken && accesstoken != 'undefined' && accesstoken != 'null' && accesstoken != 'nil' && urlData.userid) {
    callback(accesstoken,urlData.userid)
  } else {
    if(YmtApi.isSaohuoApp) {
      callback()
    } else {
      $.get('//m.ymatou.com/account/api/user_status', function(data) {
        if(data.Status == 200 && data.Result && data.Result.accessToken) {
          callback(data.Result.accessToken,data.Result.userId)
        } else {
          callback()
        }
      })
    }
  }
}


var freeloginapi = {
  install: function(Vue) {
    if (typeof window == 'undefined') {return};
    if (!document.getElementById("UIFREELOGIN")) {
      var dom = document.createElement("div");
      dom.id = "UIFREELOGIN";
      document.body.appendChild(dom);
    };
    var VM = Vue.extend(FreeLogin)
    var freeloginobj = new VM({
      el: '#UIFREELOGIN',
      propsData:{
        freeLoginSuccess:null,
        freeLoginFail:null
      }
    })

    Vue.prototype.$login = {
      tologinfunc: function(successcbname,failcbname){
        // 清除 success
        if (localStorage.getItem('freeloginsuccess')) {
          localStorage.setItem('freeloginsuccess','');
        }
        // 设置 success
        if (successcbname) {
          localStorage.setItem('freeloginsuccess',successcbname);
        }
        // 清除 fail
        if (localStorage.getItem('freeloginfail')) {
          localStorage.setItem('freeloginfail','');
        }
        // 设置 fail
        if (failcbname) {
          localStorage.setItem('freeloginfail',failcbname);
        }
        if(!getaccesstoken()){
          if (YmtApi.isSaohuoApp) {
            YmtApi.toLogin();
          }
          else if (YmtApi.isWechat) {
            var url =  window.location.href;
            window.location.href = '//m.ymatou.com/account/page/new_go_wechat?ret=' + encodeURIComponent(url);
          }
          else if (YmtApi.isWeibo) {
            var url =  window.location.href;
            window.location.href = '//m.ymatou.com/account/page/new_go_weibo?ret=' + encodeURIComponent(url);
          }
          else if (YmtApi.isAlipay) {
            var url =  window.location.href;
            window.location.href = '//m.ymatou.com/account/page/new_go_alipay?ret=' + encodeURIComponent(url);
          }
          else {
            freeloginobj.visible = true;
          }
        }
      },
      tologinobj:freeloginobj,
      getAccesstoken: dogetaccesstoken
    };

  },

};
export default freeloginapi;

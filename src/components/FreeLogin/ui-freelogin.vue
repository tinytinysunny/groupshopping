<template>
  <div class="freelogin-wrap">
    <div class="freelogin" :class="{'show':visible&&!showChangeMobilePop}">
      <div class="title"><span v-text="titleText"></span></div>
      <div class="content">
        <div class="input-phone">
          <label>
            <span class="icon icon-phone"></span>
            <input type="phone" v-model="phone" name="phone" maxlength="11" placeholder="请输入手机号">
          </label>
          <span v-show="phoneDelete" @click.prevent.stop="deletephone" class="delete icon-delete"></span>
        </div>
        <div class="input-validatacode">
          <label>
            <span class="icon icon-code"></span>
            <input type="text" v-model="validatacode" name="validatacode" maxlength="6" placeholder="请输入短信验证码">
          </label>
          <span v-if="!countdown" class="send-validatacode" @click.stop="clickvalidatacode" module_name="tk_getnum" module_index sub_module_name="get_code">获取验证码</span>
          <span v-if="countdown" class="send-validatacode disabled">{{countdown}}秒后获取</span>
          <span v-show="codeDelete" @click.prevent.stop="deletevalidatacode" class="delete icon-delete"></span>
        </div>
      </div>
      <div class="btn-wrap">
        <button type="button" class="btn-login" @click="freeloginfunc" :disabled="!btnloginstatus" module_name="tk_getnum" module_index sub_module_name="login">{{btnText}}</button>
        <span class="gologin" @click.stop="gotologinpage" module_name="tk_getnum" module_index sub_module_name="password_login">帐号密码登录</span>
      </div>
      <div class="close icon-close" @click="close">关闭</div>
    </div>
    <!-- 切换帐号 -->
    <div class="freelogin-pop" :class="{'show':showChangeMobilePop}">
      <div class="content">哈尼，该手机号码<br>已经绑定了别的洋码头帐号了</div>
      <div class="btn-list">
        <span @click.stop="replacephone" module_name="tk_getnum" module_index sub_module_name="change_phonenum">换个手机号</span>
        <span @click.stop="usephonelogin" module_name="tk_getnum" module_index sub_module_name="phonenum_login">使用该手机号登录</span>
      </div>
      <div class="close icon-close" @click="closepopchangephone">关闭</div>
    </div>
    <!-- 切换帐号 end -->
    <div class="freelogin-layer" :class="{'show':visible}" @touchmove.prevent.stop></div>
  </div>
</template>

<script>
  export default {
    name: 'ui-freelogin',
    props: {
      showClose:{
        type:Boolean,
        default:true
      },
      beforeSendCode:{
        type:Function,
        default:null
      },
      freeLoginSuccess:{
        type:Function,
        default:null
      },
      freeLoginFail:{
        type:Function,
        default:null
      },
      // visible:{
      //     type:Boolean,
      //     default:false
      // },
    },
    data() {
      return {
        visible: false,
        titleText:'手机登录',
        btnText:'登录',
        bindthirdpard:false,
        phone:'',
        validatacode:'',
        phoneDelete:false,
        codeDelete:false,
        btnloginstatus:false,
        showChangeMobilePop:false,
        xhrStaus:{
          sendCodeStatus:false,
          loginStatus:false,
        },
        urlObj:null,
        countdown:null,
        pathname:'//m.ymatou.com/account'    //http://coupon.m.ymatou.com:3344
      }
    },
    computed: {
    },
    mounted(){
      var _this = this;
      this.urlObj = this.parseLocator(window.location.href, 'lower');
      if (YmtApi.isWechat || YmtApi.isAlipay || YmtApi.isWeibo) {
        this.titleText = '绑定手机号';
        this.btnText = '绑定并登录';
        // alert(document.cookie)
        // alert(this.getCookie('TOKENID'))
        if (this.urlObj.showfreelogin && this.getCookie('TOKENID')) {
          // if (this.urlObj.showfreelogin && this.urlObj.tokenid){
          this.visible = true;
          this.bindthirdpard = true;
        }else{
          this.visible = false;
          this.bindthirdpard = false;
        }
      }
      console.log(this.urlObj);

      console.log(this.getCookie('ymt_cookieid'));

      window.UIFreeToLogin = function(url){
        if (YmtApi.isSaohuoApp) {
          YmtApi.toLogin();
        }
        else if (YmtApi.isWechat) {
          url = url || window.location.href;
          window.location.href = '//m.ymatou.com/account/page/new_go_wechat?ret=' + encodeURIComponent(url);
        }
        else if (YmtApi.isWeibo) {
          url = url || window.location.href;
          window.location.href = '//m.ymatou.com/account/page/new_go_weibo?ret=' + encodeURIComponent(url);
        }
        else if (YmtApi.isAlipay) {
          url = url || window.location.href;
          window.location.href = '//m.ymatou.com/account/page/new_go_alipay?ret=' + encodeURIComponent(url);
        }
        else {
          _this.visible = true;
        }
      }
      window.UIFreeToLoginClose = function(){
        _this.close();
      }
    },

    methods:{
      freeloginfunc(){
        var _this = this;
        if (_this.xhrStaus.loginStatus) {
          return hui.showLog('数据正在请求中，请稍等～', {time: 1500});
        };
        if (_this.phone.length !== 11 || _this.phone.indexOf('1') !== 0) {
          return hui.showLog('请输入正确手机号', {time: 1500});
        }
        if (_this.validatacode.length !==6) {
          return hui.showLog('请输入有效六位验证码', {time: 1500});
        }
        _this.xhrStaus.loginStatus = true;
        if (_this.bindthirdpard) {
          _this.bindthirdpart()
        }else{
          console.log("登录");
          _this.notThirdPartyFreeLogin();
        }
      },
      clickvalidatacode(){
        var _this = this;
        if (_this.phone.length !== 11 || _this.phone.indexOf('1') !== 0) {
          return hui.showLog('请输入正确手机号', {time: 1500});
        }
        // _this.$emit('beforeSendCode',_this.getvaliadatacode);

        if(typeof _this.beforeSendCode === 'function'){
          _this.beforeSendCode(_this.phone,function(){
            _this.getvaliadatacode();
          });
        }else{
          _this.getvaliadatacode();
        }
      },
      getvaliadatacode(){
        var _this = this;
        if (_this.bindthirdpard) {
          _this.checkmobile();
        }else{
          _this.sendvalidatacode();
        }
      },
      checkmobile(){
        var _this = this;
        hui.xhr({
          url: _this.pathname+'/api/CheckMobile',
          type: 'POST',
          data: {
            Mobile: _this.phone,
            // TokenId: _this.urlObj.tokenid || ''
            TokenId: _this.getCookie('TOKENID') || ''
          },
          success: function (res) {
            console.log(res.Status);
            if (res.Status == 200) {
              // 发送绑定的验证码
              _this.sendvalidatacode('13');
            } else if(res.Status == 500){
              _this.showChangeMobilePop = true;
            }
          }
        })
      },
      sendvalidatacode(type){
        var _this = this;
        if (_this.phone.length !== 11 || _this.phone.indexOf('1') !== 0) {
          return hui.showLog('请输入正确手机号', {time: 1500});
        }
        if (_this.xhrStaus.sendCodeStatus) {return hui.showLog('短信验证码发送中～', {time: 1500});};
        // 发送验证码
        _this.xhrStaus.sendCodeStatus = true;

        hui.xhr({
          url: _this.pathname +'/api/GenerateToken',
          type: 'GET',
          success: function (res) {
            if (res && res.t) {
              var csrfStr = res.t;
              hui.showLog('验证码发送中...', {time: 30000});
              hui.xhr({
                url: _this.pathname+'/api/getvalidatecode',
                type: 'POST',
                data: {
                  phone: _this.phone,
                  validatetype: type||'17',
                  _csrf: csrfStr,
                },
                success: function (res) {
                  console.log('send',res);
                  _this.xhrStaus.sendCodeStatus = false;
                  _this.countdownfunc();
                  if (res.status == 200) {
                    return hui.showLog(res.msg || '短信验证码发送成功～', {time: 1500});
                  }else{
                    return hui.showLog('获取验证失败，请稍后重试～', {time: 1500});
                  }
                }
              });
            }
          }
        })
      },
      bindthirdpart(){
        var _this = this;
        var data = {};
        data.Phone = _this.phone;
        data.TokenId = _this.getCookie('TOKENID') || ''
        data.ValidationCode = _this.validatacode;
        hui.xhr({
          url: _this.pathname+'/api/BindThirdPartyAccount',
          type: 'POST',
          data: data,
          success: function (res) {
            _this.xhrStaus.loginStatus = false;
            if (res && res.Status == 200) {
              // 注册成功
              if (localStorage.getItem('freeloginsuccess') && window.freeloginCB && window.freeloginCB[localStorage.getItem('freeloginsuccess')] && typeof window.freeloginCB[localStorage.getItem('freeloginsuccess')] === 'function') {
                _this.visible = false;
                hui.showLog('登录成功',{time: 1500});
                window.freeloginCB[localStorage.getItem('freeloginsuccess')](res);
                localStorage.setItem('freeloginsuccess','');
              }else{
                _this.visible = false;
                hui.showLog(res && res.msg ? res.msg : '登录失败');
              }
            } else {
              if(res.msg && res.msg.indexOf("已经绑定过码头账号")>1){
                _this.showChangeMobilePop = true;
              }else if(localStorage.getItem('freeloginfail') && window.freeloginCB && window.freeloginCB[localStorage.getItem('freeloginfail')] && typeof window.freeloginCB[localStorage.getItem('freeloginfail')] === 'function'){
                _this.visible = false;
                hui.showLog(res && res.msg ? res.msg : '登录失败，请稍后重试');
                window.freeloginCB[localStorage.getItem('freeloginfail')](res);
                localStorage.setItem('freeloginfail','');
              }else{
                hui.showLog(res && res.msg ? res.msg : '登录失败，请稍后重试');
              }
            }
          }
        });
      },
      notThirdPartyFreeLogin(){
        var _this = this;
        if(!_this.getCookie('ymt_cookieid')){
          _this.xhrStaus.loginStatus = false;
          return hui.showLog('设备号不能为空，请联系码头客服', {time: 1500});
        }
        var data = {
          phone: _this.phone,
          validatecode:_this.validatacode,
          deviceid:_this.getCookie('ymt_cookieid') || '',
        }
        hui.xhr({
          url: _this.pathname+'/api/notthirdpartyfreelogin',
          type: 'POST',
          data: data,
          success: function (res) {
            _this.xhrStaus.loginStatus = false;
            console.log(res);
            if (res && res.status == 200) {
              if (localStorage.getItem('freeloginsuccess') && window.freeloginCB && window.freeloginCB[localStorage.getItem('freeloginsuccess')] && typeof window.freeloginCB[localStorage.getItem('freeloginsuccess')] === 'function') {

                _this.visible = false;
                hui.showLog('登录成功',{time: 1500});
                window.freeloginCB[localStorage.getItem('freeloginsuccess')](res);
                localStorage.setItem('freeloginsuccess','');
              }else{
                _this.visible = false;
                hui.showLog(res && res.msg ? res.msg : '登录失败');
              }
            } else {
              if(localStorage.getItem('freeloginfail') && window.freeloginCB && window.freeloginCB[localStorage.getItem('freeloginfail')] && typeof window.freeloginCB[localStorage.getItem('freeloginfail')] === 'function'){
                _this.visible = false;
                hui.showLog(res && res.msg ? res.msg : '登录失败，请稍后重试');
                window.freeloginCB[localStorage.getItem('freeloginfail')](res);
                localStorage.setItem('freeloginfail','');
              }else{
                hui.showLog(res && res.msg ? res.msg : '登录失败，请稍后重试');
              }
            }
          }
        })
      },
      replacephone(){
        var _this = this;
        _this.showChangeMobilePop = false;
        _this.phone = '';
        _this.validatacode = "";
        _this.countdown = 0;
      },
      usephonelogin(){
        var _this = this;
        _this.titleText = '手机登录';
        _this.btnText = '登录';
        _this.bindthirdpard = false;
        _this.showChangeMobilePop = false;

        _this.validatacode = "";
        _this.countdown = 0;
      },
      gotologinpage(){
        YmtApi.openWin({
          url: '//m.ymatou.com/account/page/signin?returnurl='+ window.location.href,
          backFlag: true
        })
      },
      closepopchangephone(){
        var _this = this;
        _this.showChangeMobilePop = false;
        _this.validatacode = "";
        _this.countdown = 0;
      },
      close(){
        var _this = this;
        _this.visible = false;
        _this.showChangeMobilePop = false;

        _this.phone = "";
        _this.validatacode = "";
        _this.countdown = 0;

        // _this.setCookie('TOKENID','');
        // _this.$emit('onClose');
      },
      countdownfunc(){
        var _this = this;
        _this.countdown = 60;
        var curtdownTime = setInterval(function(){
          if (_this.countdown >= 1) {
            _this.countdown -= 1;
          }else{
            clearInterval(curtdownTime);
          }
        },1000)
      },
      deletephone(){
        this.phone = '';
      },
      deletevalidatacode(){
        this.validatacode = '';
      },
      watchloginstatus(){
        if (this.phone.length && this.validatacode.length) {
          this.btnloginstatus = true;
        }else{
          this.btnloginstatus = false;
        }
      },
      parseLocator(url, args) {
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
      },
      param(paramObj) {
        var str = [];
        for (var i in paramObj) {
          try {
            decodeURIComponent(paramObj[i]);
            paramObj[i] = decodeURIComponent(paramObj[i]);
          }
          catch (e) {}
          str.push(i + '=' + encodeURIComponent(paramObj[i]));
        }
        return str.join('&');
      },
      getCookie(name) {
        var start = document.cookie.indexOf(name + '=');
        var len = start + name.length + 1;
        if ((!start) && (name != document.cookie.substring(0, name.length))) {
          return undefined;
        }
        if (start == -1) return undefined;
        var end = document.cookie.indexOf(';', len);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(len, end));
      },
      setCookie(name, value, expires, path, domain, secure) {
        expires = expires === undefined ? 100 * 360 * 24 * 60 * 60 * 1000 : (expires || 0);
        var expires_date = new Date((new Date()).getTime() + expires);
        document.cookie = name + '=' + escape(value) + ';expires=' + expires_date.toGMTString() +
          (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
      }
    },
    watch: {
      phone:function(val) {
        this.phone = val.replace(/[^0-9.]/g, '') || '';
        if (this.phone.length) {
          this.phoneDelete = true;
        }else{
          this.phoneDelete = false;
        }
        // btn
        this.watchloginstatus();
      },
      validatacode:function (val) {
        this.validatacode = val.replace(/[^A-Za-z0-9]+$/g, '');
        if (this.validatacode.length) {
          this.codeDelete = true;
        }else{
          this.codeDelete = false;
        }
        // btn
        this.watchloginstatus();
      },
      visible:function(val){
        if (val) {
          $('body').css({
            position: 'fixed',
            top: '-' + $('body').scrollTop() + 'px'
          });
        };

        if (!val && !this.showChangeMobilePop) {
          // 隐藏所有
          var top = -parseFloat($('body').css('top'));
          $('body').css({
            position: 'static'
          }).scrollTop(top);
        }
      }
    }
  }
</script>

<style scoped lang="scss">

  $rem:1rem/16;
  // $rem: 1rem/37.5;
  .freelogin-wrap{
    outline: none;
    .freelogin-layer{
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,.5);
      left: 0;
      top:0;
      z-index: 111;
      display: none;
      &.show{
        display: block;
      }
    }
    .freelogin{
      width: $rem*290;
      box-sizing: border-box;
      min-height: $rem*200;
      background: #fff;
      border-radius: $rem*4;
      position: fixed;
      left:50%;
      top: 50%;
      padding: $rem*20 $rem*15 $rem*20 $rem*15;
      overflow: hidden;
      z-index: 222;
      opacity:0;
      transform: scale(0,0) translate(-50%,-50%);
      -webkit-transform: scale(0,0) translate(-50%,-50%);
      transform-origin:0 0;
      -webkit-transform-origin:0 0;
      transition: all 0.25s ease-in-out 0.1s;
      -webkit-transition: all 0.25s ease-in-out 0.1s;
      &.show{
        opacity:1;
        transform: scale(1,1) translate(-50%,-50%);
        -webkit-transform: scale(1,1) translate(-50%,-50%);
        transform-origin:0 0;
        -webkit-transform-origin:0 0;
      }
      .title{
        width: 100%;
        text-align: center;
        font-size: $rem*14;
        color: #666;
        margin: $rem*5 0 $rem*25 0;
        overflow: hidden;
        span{
          display: inline-block;
          padding: 0 $rem*40;
          overflow: hidden;
          position: relative;
          &:after,&:before{
            content: '';
            position: absolute;
            width: $rem*30;
            height:1px;
            background: #E4E5E4;
            top:50%;
            transform:translate(0,-50%);
            -webkit-transform:translate(0,-50%);
          }
          &:after{
            left: 0;
          }
          &:before{
            right: 0;
          }
        }
      }
      .content{
        width: 100%;
        overflow: hidden;
        .input-phone{
          width: 100%;
          overflow: hidden;
          border-bottom: 1px solid #E4E5E4;
          position: relative;
          margin-bottom: $rem*15;
          label{
            outline: none;
            width: 100%;
            display: inline-block;
            overflow: hidden;
            position: relative;
            .icon{
              width: $rem*17;
              height: $rem*17;
              background-size: cover;
              background-repeat: no-repeat;
              display: inline-block;
              position: absolute;
              top:$rem*5;
              left: 0;
            }
            input{
              margin: 0;
              width: $rem*220;
              padding: $rem*5 $rem*25;
              line-height: $rem*17;
              -webkit-appearance:none;
              outline: none;
              border:0;
              font-size: $rem*16;
              color: #212121;
              outline: none;
              &::placeholder{
                font-size: $rem*13;
                color:#ccc;
              }
            }
          }
          .delete{
            width: $rem*17;
            height: $rem*17;
            display: inline-block;
            position: absolute;
            right: 0;
            top:$rem*5;
            &:after{
              content: '';
              width: $rem*12;
              height: $rem*12;
              display: inline-block;
              background-size: cover;
              position: absolute;
              top:$rem*2.5;
              right:$rem*2.5;
              @extend %icon-delete;
            }
          }
        }
        .input-validatacode{
          width: 100%;
          overflow: hidden;
          border-bottom: 1px solid #E4E5E4;
          position: relative;
          margin-bottom: $rem*15;
          label{
            outline: none;
            width: 100%;
            display: inline-block;
            overflow: hidden;
            position: relative;
            .icon{
              width: $rem*17;
              height: $rem*17;
              background-size: cover;
              background-repeat: no-repeat;
              display: inline-block;
              position: absolute;
              top:$rem*5;
              left: 0;
            }
            input{
              margin: 0;
              outline: none;
              width: $rem*140;
              padding:$rem*5 $rem*5 $rem*5 $rem*25;
              line-height: $rem*17;
              box-sizing: border-box;
              -webkit-appearance:none;
              outline: none;
              border:0;
              font-size: $rem*16;
              color: #212121;
              &::placeholder{
                color:#ccc;
                font-size: $rem*13;
              }
            }
          }
          .delete{
            width: $rem*17;
            height: $rem*17;
            display: inline-block;
            position: absolute;
            right: $rem*110;
            top:$rem*5;
            &:after{
              content: '';
              width: $rem*12;
              height: $rem*12;
              display: inline-block;
              background-size: cover;
              position: absolute;
              top:$rem*2.5;
              right:$rem*2.5;
              @extend %icon-delete;
            }
          }
          .send-validatacode{
            outline: none;
            width: $rem*100;
            display: inline-block;
            text-align: center;
            line-height: $rem*20;
            position: absolute;
            box-sizing: border-box;
            right: 0;
            top:$rem*2.5;
            color: #cc3333;
            font-size: $rem*13;
            border-left: 1px solid #E4E5E4;
            padding: 0 $rem*15;
            &.disabled{
              color: #ccc;
            }
          }
        }
      }
      .btn-wrap{
        width: 100%;
        overflow: hidden;
        text-align: center;
        .btn-login{
          display: inline-block;
          -webkit-appearance:none;
          outline: none;
          border:0;
          width: 100%;
          line-height: $rem*40;
          background-color: #c33;
          font-size: $rem*15;
          color: #fff;
          text-align: center;
          border-radius: $rem*3;
          &:disabled{
            background-color: #ccc;
          }
        }
        .gologin{
          display: inline-block;
          margin: $rem*15 0 $rem*5 0;
          padding-right: $rem*10;
          text-decoration: none;
          font-size: $rem*12;
          color: #999;
          position: relative;
          &:after{
            right: 0;
            top:50%;
            content: '';
            display: block;
            position: absolute;
            width: $rem*6;
            height: $rem*6;
            border-width: 1px;
            border-style: solid;
            border-color: #999 #999 transparent transparent;
            transform: translate(0, -50%) rotate(45deg);
            -webkit-transform: translate(0, -50%) rotate(45deg);
          }
        }
      }
      .close{
        position: absolute;
        width: $rem*20;
        height: $rem*20;
        right: $rem*10;
        top:$rem*10;
        text-indent: -9999px;
        &:after{
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: $rem*12;
          height: $rem*12;
          display: inline-block;
          @extend %icon-close;
          background-size: cover;
          background-repeat: no-repeat;
          transform:translate(-50%,-50%);
          -webkit-transform:translate(-50%,-50%);
        }
      }
    }
    .freelogin-pop{
      width: $rem*290;
      min-height: $rem*200;
      background: #fff;
      border-radius: $rem*4;
      position: fixed;
      left:50%;
      top: 50%;
      transform:translate(-50%,-50%);
      -webkit-transform:translate(-50%,-50%);
      padding: 0 0 $rem*5 0;
      overflow: hidden;
      z-index: 223;
      opacity:0;
      transform: scale(0,0) translate(-50%,-50%);
      -webkit-transform: scale(0,0) translate(-50%,-50%);
      transform-origin:0 0;
      -webkit-transform-origin:0 0;
      transition: all 0.25s ease-in-out 0.1s;
      -webkit-transition: all 0.25s ease-in-out 0.1s;
      &.show{
        opacity:1;
        transform: scale(1,1) translate(-50%,-50%);
        -webkit-transform: scale(1,1) translate(-50%,-50%);
      }
      .content{
        width: 100%;
        padding: $rem*28 0;
        font-size: $rem*15;
        color: #666;
        text-align: center;
      }
      .btn-list{
        width: 100%;
        overflow: hidden;
        span{
          display: inline-block;
          width: 100%;
          line-height: $rem*44;
          text-align: center;
          color: #c33;
          font-size: $rem*15;
          border-top: 1px solid #DDDEDD;
        }
      }
      .close{
        position: absolute;
        width: $rem*20;
        height: $rem*20;
        right: $rem*10;
        top:$rem*10;
        text-indent: -9999px;
        &:after{
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: $rem*12;
          height: $rem*12;
          display: inline-block;
          @extend %icon-close;
          background-size: cover;
          background-repeat: no-repeat;
          transform:translate(-50%,-50%);
          -webkit-transform:translate(-50%,-50%);
        }
      }
    }
    .icon-phone{
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAMAAAANmfvwAAAAV1BMVEUAAACZmZmenp6ampqbm5uampqZmZmampqZmZmZmZmcnJyampqZmZmampqenp6bm5u2traZmZmbm5ucnJybm5ucnJylpaWqqqqZmZmampqYmJiampqZmZnKotJCAAAAHHRSTlMA3iHZJ8nw1c+/P/bpliQcB+RhTUgsEQyysWgrUEz8LgAAAJNJREFUOMvt1LcOwzAMRVHShapWc0vh/39ngASQASvg7MF3PngDB8K36ImbyESopQfjeE4T61RJp2iGpsWr7iA9Di0ZsL/JTS5Ctve6ycQqRGMlsiL3mV0QyMQUBsWTQAwXgMJGXDH7nsUV6xxql61AoGgifMl3CdYG+EeUX6BpJnWQpJn0eA75maAWDXET+d8L+gAg2Awkx4U8UAAAAABJRU5ErkJggg==');
    }
    .icon-code{
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0UxOEJDRUY2REUwMTFFN0IwQUREQzYzQ0E1NkQxODQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0UxOEJDRjA2REUwMTFFN0IwQUREQzYzQ0E1NkQxODQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRTE4QkNFRDZERTAxMUU3QjBBRERDNjNDQTU2RDE4NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRTE4QkNFRTZERTAxMUU3QjBBRERDNjNDQTU2RDE4NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtlQwoYAAANOSURBVHja7JhfSNNRFMf97Y9hq9gsWMbsj0tfIgJLIglEKo1Bkg+JMIJyU7GHKKICexSEyJeCoE23ycCyFUWQWC/6UBEpIiRl5B6sFBGkMVox5/70+dkGP3+Wmm66By+cnfM79/7O9/u79557LhNisVhGOjRFRpq0tCGiQoS2trbr0Wi0WBCEzakCIv53lUrVbbFYnOBE5xFpbW29wz45h70plfsFcJHMCfAO8tgwjwjg5QxCxToVCkVXqogQ/ySqEn2cFdhrtVq9c4hAYjud45mZmedpwVQR6ejo6AoEAoWYWvC2oecQUeBUon/p9frVyOMZPly5nr7rRFJGhHQ7a7PZjHK/w+Eow18o99vt9mL8p5NKhKDVkUjEjvlQ6hcPpnA4/ADzqWx8AZnYTnZg2ouSQsTlcu0m4A3hT7uf8Lvdbg1gLZjZ6B7JoSWgriH52MNarXY4KUT44ssE3Ic5qNFoXAn/9PR0Nf5DyAgH4S3JLB1BlSNTSqWypaqqKpDoCwaDYdSueBmZWTIRce156RTi5/G22Wz2xcH0+MRakQWYp6am5mN8vBrVSJ8B/dpoNHZL41HsfjC+jDLSWFtbO/C36juveTwepc/nE4PuYUleGgwG6T5ooHgdwD+EvispahUocUa+YjeXlpaG5XGpL32oviUvjd/vL4kHneALmk0m07TodzqdeYBXAhTi8V59ff2E5LVLEM+m73ldXV1/UtIX8HHUVoL2MKWvEn72wxRKj4zqdDq3/DXGD6jV6iv/WQx1LOthgZ+fPH/Kzc0tTnz5ajWwxSpsQ0rW7GQVSYhnDaa4tzYo1ooE+ylBYoxsOpM0IuJhBsBFZOdSSLAPK9Df0FfJphdJI0I9MjPVN5G3gOUstBxSEpwpj5NafQH4gPoMwA5sj7xISveEnERSiTC9g6SuFXMIoKOAtifILEYikfsR8R45OTkprJQMl+9+zhqLlAyFM38xErMzSqkejd+sO3nhzTKWJMZpO8Ip+05StYtCoZADcz/9YgUuWIjEbByK2CMGmZCNK7mdA5IHyJiMzDPMHMi8R5r+RWKWSG9vr8rr9V7gq44xeMsySGQhXwCpFmdHdp/J58rwBJJN1B/PgjO7/rdEuhL5LcAAxAqrRnFDi4AAAAAASUVORK5CYII=');
    }
    %icon-delete{
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAqVJREFUSA21lktrE1EUxzOTENwUXPhaaek2/QYuavIBBBG1Qhg05gEixSCSb2C1uCkKkgcEgtDgRunCZbPyGxhdKVgVtK7EjSYw8fefZOJN5mHr48LNPY//+Z9zz70zEysRM1qt1inXdVdHo1EOWMayrKOCo39h6aPv2LbdLRaL72QPG1aYsV6vnyT4HkQX8dthGMPmgn0CtlapVHYNuycGEjQajbN4HhOwMA+O00nyDX++XC5vm7iZ6qh8Deezg5KLUDHMpxOOaY7pDlS5AHhmkk6R+xfUsnP+TrwEk56//JPKw/KqXXAt60y8ajHoQA/U8zBi3yYucUq32u324mAweIMcaA2gF8znXNUq/iMK8Af2D8j3mRcgPO3bjdVNJpNL9nA4vIQxQC4gJNdLpdId1jPMz0bw+1QqtUKfNyG/ZdhN0dYzZAPImVZTxndFOkR6qLKIn5gfmdlCofCWVaMyXoK/4lblmaBrbAFQ5QKsS2Mnr1my6XQ6y+GppQl8D1muSo4YGYvr+QOidATAM1P9BruomRjIN9H13EQO4gahvZ+PoACn2Wwe9+2dTucY8nlfj1t1BnpxRQ4dLi+0HC2aHrLjOHsErODTTYoc4tYO+pGIRGKP2yJy9V8935i0JqFz0E3CvBsT37epYicKgO8at+WV/JzVXZbbzDXkB7LpJoFxJIcNcbN7u4vTDQOwxRNMi6rXWaeHjHyDJI96vV4KkqWwWHGK23sXAd4iaHUeSPAI21d8h+d90vF/x3cowtfl5l32bhGgGmC9z2cGdiuKXMAYcr3svB17CSZfojwxoa2ayfp7RRz5CeevdxDb2WYXN/8yicir4vLr8M7AV7RyHv/vk6kEyk7/ltnNFup+WqYvWFcxZuXi0gjsYGwe//6Lvy0/AahbO0BBzQ8cAAAAAElFTkSuQmCC');
    }
    %icon-close{
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAp9JREFUSA2tVltu01AQnbmI9SBWg1ShUgoVjmMnkWggEKWEVoGW8ErsOC6lKaWiEqyAbbAeVF/OaeUmdpwHEP/kPmbOmTvPaD8c/rQio6pX+iEr/PphtC9Wbhtr5ZeKnAdBtLYq/H4YvxHRbTVmZKp+6amq/WBVvwZRfPd/SWi5tcljtXbdLzvfDQH9slsXsW+Ti+S0P4jX/5UE7u7AI3VR3fB995w4lwRcVDy3YVQObJKc9AfDDZ79zQe37FlrGzdUNhHPs1T3moAHvuc+VzWvEJxRMIgfpEKLfnvBsA0PNI2Yh57nnk7KZwh4UfGcFoRpzRFesjUpXLQOBsOWquyo6pbvOyd5mSkCCsBdL5AFbbzkECSP8krpHpY34fOXVqyDgB6n55O/hQQUwEt2odwCyRDucieVuIblDVi+p1bdqud+yt+ne5TA/K8Xxs9UbEdUKpVyKaQ0wJ8kiT0wxpRheTQPYSFBBlBMLRG5KZJ0kYCVqu8E88B5txQBBXtBvI2C7CL4yG1TQ0B7PF/0zYxBXhGCvwmObJGrV+QlivdLESCTvESSj3BLHUGt0UWMQzFk9nShi5hBsDyE4Q2/XEITEyEhsquP9zSrnvM6C5ndzX1BEMQOwQmUglOd2QRXecwu1kIWMrubScAqtmoj1kKRlUxP1gBrAX1oJws73hW6iH0Ilh+xmllwY/HpFQ1hxcOQXbT+dl5iigBuuQ/Lj2cp5AG4nzCoc9XLxlIZgjCM7l2gk7Kj5gXHKsUrGoZM+8yWz66cSl0TcJpx4CB4+xWvNDdwqXL+l8OK8wRx6XK+8P6SgPMYxXM2eZFXXnZPQ21iv3AMc1Iq/HcHAf0Grvdwy1LFs4iMBnPGI47vDJ60yXm8KnCScx7jr9AaPHLrD3cCP02UEytEAAAAAElFTkSuQmCC');
    }
  }

</style>

/*
 *   Development Environment
 *   http://localhost
 */
// exports.logDir = '/usr/local/log/order.m.ymatou.com/';
exports.logDir = 'log';

// exports.logDir = '/usr/local/log/jslog.api.ymatou.com/';
var path = require('path');
var fs = require('fs');
var mkdir_p = function (dirpath, mode, callback) {
  fs.exists(dirpath, function (exists) {
    if (exists) callback && callback(dirpath);
    else mkdir_p(path.dirname(dirpath), mode, function () {
      fs.mkdir(dirpath, mode, callback);
    });
  });
};
mkdir_p(exports.logDir);


exports = module.exports = {

  port: 2020, //node port
  tpl: {
    compress: false, //compress html
    escape: false, //build html
    cache: false //off or on cache
  },
  isDev: true, //development

  // 临时上传文件存放路径
  upload_tmp: __dirname + '/dist/upload_tmp',

  env: 'evt',
  viewModel: {
    staticDomain: 's1.ymatou.com'
  },

  //日志 配置
  LogConfig: {
    logDir: this.logDir,
    uploadLog: false, //开启log上传
    serverHost: 'alarm.ymatou.com',
    serverPath: '/Alarm/SaveSingle',
    "appenders": [{
      category: "debug",
      type: "file",
      filename: this.logDir + "/debug.log",
      layout: {
        type: 'basic'
      },
      patterm: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    }, {
      category: "info",
      type: "file",
      filename: this.logDir + "/info.log",
      layout: {
        type: 'basic'
      },
      patterm: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    }, {
      category: "error",
      type: "file",
      filename: this.logDir + "/error.log",
      layout: {
        type: 'basic'
      },
      patterm: '.yyyy-MM-dd',
      alwaysIncludePattern: true,
      //"category": "error",
      //"type": "file",
      //"absolute": true,
      //"filename": __dirname + "/log/error.log",
      //"maxLogSize": 1048576,
      //"backups": 1000
    }]
  },
  // 性能监控
  monitorConfig: {
    appId: 'null.m.ymatou.com', //项目名
    host: '172.16.100.13', //提交到服务器地址 //10.10.15.239
    port: 8089, //提交到服务器端口 //9095
    path: '/api/perfmon/', //提交到服务器路径
    open: true, //是否开启
    loopTime: 30000 //上传耗时间隔  Default:30s
  },

  ResultStatus: {
    /// 成功  HttpStatusCode.OK
    Success: 200,

    /// 参数错误  HttpStatusCode.BadRequest
    ParameterError: 400,

    /// 权限错误,没有授权或者没有权限   HttpStatusCode.Unauthorized
    AuthorizeError: 401,

    /// 邮箱用户未激活授权失败
    EmailUserNotActiveAuthorizeError: 411,

    /// 手机用户未激活授权失败
    PhoneUserNotActiveAuthorizeError: 412,

    /// 用户需要修改昵称
    UserNeedFillNickName: 413,

    /// 业务异常
    BussinessError: 500,

    /// 商品图片超过最大数量限制
    ProductPicOverflow: 511,

    //404
    NoPage: 404
  },
  connections: {
    ymtcms: {
      host: 'mysql.ymatou.com',
      user: 'YmtCRMuser',
      port: 30001,
      password: '123456',
      database: 'YmtCRM'
    }
  }
};

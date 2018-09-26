'use strict';

var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var exphbs = require('express-handlebars');
var util = require('./util');
global.log = util.log;

var conf = require('./config');
var app = express();

var response = require('./helper/response')

// //view engine setup
// template.config('extname', '.html');
// template.config('compress', conf.tpl.compress);
// template.config('escape', conf.tpl.escape);
// template.config('cache', conf.tpl.cache);

// view engine setup
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: util.helpers,
    layoutsDir: path.join(__dirname, 'views/layouts/'),
    partialsDir: [
        path.join(__dirname, 'views/partials/')
    ]
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
conf.env === 'production' && app.enable('view cache');
app.set('session name','SESSIONID');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'dist')));
app.disable('etag'); //disable etag
app.disable('x-powered-by');
//request information for client
app.all('/*', function (req, res, next) {
    global.CLIENT_INFO = {
        AppId: 'member.m.ymatou.com',
        ReqUrl: req.headers['host'] + req.url,
        ReqForm: req.body,
        Header: req.headers,
        MachineIp: req.headers['HTTP_Cdn_Src_Ip'] || req.headers['cdn_src_ip'] || '',

        //用户信息
        User: {
            UserId: req.query.UserId || '',
            AccessToken: req.query.AccessToken || '',
            DeviceToken: req.query.DeviceToken || ''
        }
    };

    //代理接口统一认证url
    global.CLIENT_INFO.URLAuth = 'AppID=' + global.CLIENT_INFO.AppId + '&UserId=' + (req.query.UserId || '') + '&AccessToken=' + (req.query.AccessToken || '') + '&DeviceToken=' + (req.query.DeviceToken || '');

    if (global.CLIENT_INFO.MachineIp === '') {

        var forwardStr = req.headers['x_forwarded_for'];

        if (forwardStr) {
            var forwardList = forwardStr.split(',');
            if (forwardList.length >= 2 || forwardList.length == 1) {
                global.CLIENT_INFO.MachineIp = forwardList[0];
            }
        }
    }

    // 初始化微信JS-SDK
    // var ua = window.navigator.userAgent;
    var ua = req.headers['user-agent'];
    var clientVersionInfo = req.clientVersionInfo = {};

    clientVersionInfo.isWechat = /MicroMessenger/i.test(ua);
    clientVersionInfo.isAndroid = /Android|Linux/i.test(ua);
    clientVersionInfo.isIos = /\(i[^;]+;( U;)? CPU.+Mac OS X/i.test(ua);
    clientVersionInfo.appVersion = ua.match(/appVersion\/[0-9]\.[0-9]\.[0-9]/);
    clientVersionInfo.appVersion = clientVersionInfo.appVersion && clientVersionInfo.appVersion.length ? clientVersionInfo.appVersion[0] : 0;

    next();
});

// var PHR = require('perfmon-http-request');
// app.use(PHR.run(conf.monitorConfig));
//load routes
require('./routes')(app, express);
global.app = app;

// handle fallback for HTML5 history API and redirect page to vue router
app.use(function (req, res, next) {
  if (req.originalUrl) {
    var protocol = util.ymtEnv.isNotInProduction() ? 'http' : 'https'
    protocol = 'https' // for some reason  isnotinproduction not working , urgent fix for now
    var url = protocol + '://m.ymatou.com/coin/?page=' + encodeURIComponent('/coin' + req.originalUrl)
    response.redirect(req, res, url)
  } else {
    next && next()
  }
})

// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {

        log.Error({
            Message: err.message
        });
        res.status(err.status || 500);
        err.status = (err.status || 500);
        res.render('section/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    log.Error({
        Message: err.message
    });

    res.status(err.status || 500);
    res.render('section/error', {
        message: err.message,
        error: {
            status: err.status
        }
    });
});

process.on('uncaughtException', function (err) {
    log.Error({
        Message: "进程异常： " + JSON.stringify(err)
    });
    if (err.message) {
        log.Error({
            Message: "进程异常(错误信息): " + err.message
        });
    }
    if (err.stack) {
        log.Error({
            Message: "进程异常(CallStack信息): " + err.stack
        });
    }
});

module.exports = app;

var log4js = require('log4js');
var config = require('../config');
var common = require('./_common');
var FormData = require('form-data');

log4js.configure(config.LogConfig);


var debuglogger;
debuglogger = log4js.getLogger('debug');
debuglogger.setLevel('TRACE');

var infologger;
infologger = log4js.getLogger('info');
infologger.setLevel('TRACE');

var errorlogger;
errorlogger = log4js.getLogger('error');
errorlogger.setLevel('TRACE');

/**
 * 上传错误日志
 * HTTP Method POST
 * http://alarm.alpha.ymatou.com/Alarm/SaveSingle
 *
 * @param AppId         系统ID(域名)
 * @param ReqUrl        请求URL
 * @param ReqForm       访问请求信息
 * @param ErrorLevel    错误级别-Error/Fatal/Warning
 * @param MethodName    出错的方法名
 * @param AssemblyName  出错类库名
 * @param Title         报错信息头
 * @param Message       错误信息
 * @param ExceptionName 异常类型名
 * @param Header        头信息
 * @param StackTrace    错误堆栈信息
 * @param AddTime       添加时间
 * @param MachineIp     本地服务器IP
 *
 * @Return
 * {
 *      Result:true
 * }
 */
var logServer = function (AppId, ReqUrl, ReqForm, ErrorLevel, MethodName, AssemblyName, Title, Message, ExceptionName, Header, StackTrace, AddTime, MachineIp) {

    var data = {
        AppId: String(AppId),
        ReqUrl: String(ReqUrl),
        ReqForm: String(ReqForm),
        ErrorLevel: String(ErrorLevel),
        MethodName: String(MethodName),
        AssemblyName: String(AssemblyName),
        Title: String(Title),
        Message: String(Message),
        ExceptionName: String(ExceptionName),
        Header: String(Header),
        StackTrace: String(StackTrace),
        AddTime: String(AddTime),
        MachineIp: String(MachineIp)
    };

    var form = new FormData();
    for (var i in data) {
        form.append(i, data[i]);
    }

    form.submit({
        host: config.LogConfig.serverHost,
        path: config.LogConfig.serverPath,
    }, function (err, res, body) {
        console.log('==========');
        console.log(err);
        console.log(body);
        console.log('==========');
    });

};

function AddLog(msg, loglevel) {

    switch (loglevel) {
    case 'trace':
        infologger.trace(msg);
        break;
    case 'debug':
        debuglogger.debug(msg);
        break;
    case 'info':
        infologger.info(msg);
        break;
    case 'warn':
        errorlogger.warn(msg);
        break;
    case 'error':
        errorlogger.error(msg);
        break;
    case 'fatal':
        errorlogger.fatal(msg);
        break;
    }
}

exports.Trace = function (msg) {
    AddLog(msg, 'trace');
};

exports.Debug = function (msg) {
    AddLog(msg, 'debug');
};

exports.Info = function (msg) {
    AddLog(msg, 'info');
};

exports.Warn = function (err) {
    var CLIENT_INFO = global.CLIENT_INFO || {};
    var o = {
        AppId: CLIENT_INFO.AppId || 'social.ymatou.com', //** 系统ID
        ReqUrl: err.url || CLIENT_INFO.ReqUrl || '', //** 访问URL
        ReqForm: err.body || '', //form信息
        ErrorLevel: err.level || 'Warning', //** 错误级别    Error/Fatal/Warning
        MethodName: err.MethodName || '', //出错方法名
        AssemblyName: err.AssemblyName || '', //出错类名
        Title: err.Title || '', //信息头
        Message: err.Message || '', //错误信息
        ExceptionName: err.ExceptionName || '', //异常类型名
        Header: err.Header || CLIENT_INFO.Header || '', //头信息
        StackTrace: err.StackTrace || '', //错误堆栈信息
        AddTime: err.AddTime || common.GetNowTime(), //错误时间**
        MachineIp: CLIENT_INFO.MachineIp //本地服务器**
    };

    if (config.LogConfig.uploadLog) {
        logServer(o.AppId, o.ReqUrl, o.ReqForm, 'Error', o.MethodName, o.AssemblyName, o.Title, o.Message, o.ExceptionName, o.Header, o.StackTrace, o.AddTime, o.MachineIp);
    }
    AddLog((err.Message || ''), 'warn');
};

exports.Error = function (err) {
    var CLIENT_INFO = global.CLIENT_INFO || {};
    var o = {
        AppId: CLIENT_INFO.AppId || 'social.ymatou.com', //** 系统ID
        ReqUrl: err.url || CLIENT_INFO.ReqUrl || '', //** 访问URL
        ReqForm: err.body || '', //form信息
        ErrorLevel: err.level || 'Warning', //** 错误级别    Error/Fatal/Warning
        MethodName: err.MethodName || '', //出错方法名
        AssemblyName: err.AssemblyName || '', //出错类名
        Title: err.Title || '', //信息头
        Message: err.Message || '', //错误信息
        ExceptionName: err.ExceptionName || '', //异常类型名
        Header: err.Header || CLIENT_INFO.Header || '', //头信息
        StackTrace: err.StackTrace || '', //错误堆栈信息
        AddTime: err.AddTime || common.GetNowTime(), //错误时间**
        MachineIp: CLIENT_INFO.MachineIp //本地服务器**
    };

    if (config.LogConfig.uploadLog) {
        logServer(o.AppId, o.ReqUrl, o.ReqForm, 'Error', o.MethodName, o.AssemblyName, o.Title, o.Message, o.ExceptionName, o.Header, o.StackTrace, o.AddTime, o.MachineIp);
    }

    //发送至服务端
    AddLog((err.Message || ''), 'error');
};

exports.Fatal = function (err) {
    var CLIENT_INFO = global.CLIENT_INFO || {};
    //发送至服务端
    var o = {
        AppId: 'social.ymatou.com', //** 系统ID
        ReqUrl: err.url || CLIENT_INFO.ReqUrl || '', //** 访问URL
        ReqForm: err.body || '', //form信息
        ErrorLevel: err.level || 'Warning', //** 错误级别    Error/Fatal/Warning
        MethodName: err.MethodName || '', //出错方法名
        AssemblyName: err.AssemblyName || '', //出错类名
        Title: err.Title || '', //信息头
        Message: err.Message || '', //错误信息
        ExceptionName: err.ExceptionName || '', //异常类型名
        Header: err.Header || CLIENT_INFO.Header || '', //头信息
        StackTrace: err.StackTrace || '', //错误堆栈信息
        AddTime: err.AddTime || common.GetNowTime(), //错误时间**
        MachineIp: CLIENT_INFO.MachineIp //本地服务器**
    };

    if (config.LogConfig.uploadLog) {
        logServer(o.AppId, o.ReqUrl, o.ReqForm, 'Fatal', o.MethodName, o.AssemblyName, o.Title, o.Message, o.ExceptionName, o.Header, o.StackTrace, o.AddTime, o.MachineIp);
    }

    AddLog((err.Message || ''), 'fatal');
};

exports.Monitor = function (ip, url, body) {
    AddLog('ip:' + ip + '----url:' + url + '----body:' + body, 'trace');
};
var async = require('async');
var config = require('../config');

/**
 * 图片url格式转化
 * @param format    {string}    图片所需格式  _o:原图 _m:640*640 _l:320*320
 * @param imageUrl  {string}    图片地址
 * @returns         {string}    新图片地址
 */
exports.imgUrlFormat = function (format, imageUrl) {
    return imageUrl.replace(/_[oml]\./g, (format + '.'));
};

//###################################################################定义json标准输出
//返回客户端标准json字符串
function ResponseResult(status, msg, result) {
    return JSON.stringify({
        Msg: msg,
        Status: status,
        Result: result,
        ServerTime: getTime()
    });
}
//标准化输出response
exports.ResponseResult = function (status, msg, result) {
    return ResponseResult(status, msg, result);
};
//正确返回结果
exports.SuccessReponse = function (msg, result) {
    return ResponseResult(config.ResultStatus.Success, msg, result);
};
//错误返回结果
exports.ErrorResponse = function (msg, result) {
    return ResponseResult(config.ResultStatus.BussinessError, msg, result);
};
//====================================================================

//###################################################################时间操作
function getTime(date) {
    if (date) {

    }
    else {
        date = new Date();
    }
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    mm = mm < 10 ? "0" + mm : mm;
    dd = dd < 10 ? "0" + dd : dd;

    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    return yy + "-" + mm + "-" + dd + " " + h + ":" + m + ":" + s;
}
/**
 * @method 格式化时间如果时间小于10 前面加0，如9-
 * @param time
 * @returns {Date}
 */
function formateTime(time) {
    if (!time) {
        return '00';
    }
    return parseInt(time) > 9 ? time : '0' + time;
}
exports.GetNowTime = function () {
    return getTime(new Date());
};

exports.TimeFormat = function (date) {
    return getTime(date);
};

exports.AddTime = function (data, addnum, addtype) {
    var addtime = 0;
    if (addtype == 'd') {
        addtime = 60 * 60 * 1000 * 24 * addnum;
    }
    else if (addtype == 'h') {
        addtime = 60 * 60 * 1000 * addnum;
    }

    return new Date(new Date().getTime() + addtime);
};
//====================================================================

//###################################################################获取IP
function getClientIp(req) {
    var ipAddress =
        req.headers['HTTP_Cdn_Src_Ip']; // || req.headers['REMOTE_ADDR'];// || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    if (ipAddress) {
        return ipAddress;
    }

    ipAddress = req.headers['REMOTE_ADDR'];

    var forwardStr = req.headers["HTTP_X_FORWARDED_FOR"];

    if (forwardStr) {
        var forwardList = forwardStr.split(',');
        if (forwardList.Length >= 2 || forwardList.Length == 1) {
            return forwardList[0];
        }
    }

    return ipAddress;
    //var forwardedIpsStr = req.header('X-Real-IP');

    //console.log(req.headers.client_ip);
    ////console.log(req.header('x-forwarded-for'));
    ////console.log(req.header('X-Real-IP'));
    ////console.log(req.header('X-Forwarded-Proto'));
    ////console.log(req.ip);
    ////console.log(req.connection.remoteAddress);

    //if (forwardedIpsStr) {
    //    var forwardedIps = forwardedIpsStr.split(',');
    //    ipAddress = forwardedIps[0];
    //}
    //if (!ipAddress) {
    //    ipAddress = req.connection.remoteAddress;
    //}
};

function getServerIp() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};

exports.GetClientIp = function (req) {
    return getClientIp(req);
};

var thisip;
exports.GetServerIp = function () {
    if (thisip) return thisip;

    thisip = getServerIp();
    return thisip;
};

exports.GetDns = function (domain) {

    var dns = require('dns');

    dns.resolve4(domain, function (err, addresses) {
        if (err) throw err;

        console.log('addresses: ' + JSON.stringify(addresses));

        addresses.forEach(function (a) {
            dns.reverse(a, function (err, domains) {
                if (err) {
                    console.log('err:' + err.message);
                }

                console.log('reverse for ' + a + ': ' + JSON.stringify(domains));
            });
        });
    });
};

/**
 * @method 格式化时间
 * @param time
 * @returns {Date}
 */
exports.formatDate = function (time) {
    time = time.replace(/-/g, '/');
    return new Date(time);
};

/**
 * @name 格式化日记发布日间
 * @description 格式化日记发布时间，详细见prd:http://172.16.100.245/D1506-SQB-show-UE/#p=2_1__-h5
 * @param publishTime
 * @param serviceTime
 */

exports.formatNoteTime = function (publishTime, serviceTime) {
    if (!publishTime || !serviceTime) {
        return;
    }
    publishTime = publishTime.replace(/-/g, '/');
    serviceTime = serviceTime.replace(/-/g, '/');
    var publishDate = new Date(publishTime);
    var serviceDate = new Date(serviceTime);
    publishTime = publishDate.getTime();
    serviceTime = serviceDate.getTime();
    var dis = serviceTime - publishTime,
        s = Math.ceil(dis / 1000), // 共多少秒
        year, // 年
        month, // 月
        dd, // 天
        hh, // 小时
        mm, // 分
        rst = '';

    if (s < 60) {
        rst = s + '秒前';
    }
    else if (s < 3600) {
        rst = Math.floor(s / 60) + '分钟前';
    }
    else if (s <= 8 * 3600) {
        rst = Math.floor(s / 3600) + '小时前';
    }
    else if (publishDate.getDate() == serviceDate.getDate()) {
        hh = publishDate.getHours();
        mm = publishDate.getMinutes();
        rst = formateTime(hh) + ':' + formateTime(mm);
    }
    else if (publishDate.getDate() < serviceDate.getDate() && (serviceDate.getDate() - publishDate.getDate()) < 3) {
        dd = serviceDate.getDate() - publishDate.getDate();
        hh = publishDate.getHours();
        mm = publishDate.getMinutes();
        if (dd == 1) {
            dd = '昨天,';
        }
        else {
            dd = dd + '天前,';
        }
        rst = dd + formateTime(hh) + ':' + formateTime(mm);
    }
    else if (publishDate.getFullYear() == serviceDate.getFullYear()) {
        month = publishDate.getMonth() + 1;
        dd = publishDate.getDate();
        hh = publishDate.getHours();
        mm = publishDate.getMinutes();

        rst = month + '月' + dd + '日' + formateTime(hh) + ':' + formateTime(mm);
    }
    else if (publishDate.getFullYear() < serviceDate.getFullYear()) {
        year = publishDate.getFullYear();
        month = publishDate.getMonth() + 1;
        dd = publishDate.getDate();

        rst = year + '年' + month + '月' + dd + '日';
    }

    return rst;
};

// 按字节截取
exports.subChar = function (str, len) {
    var b = 0,
        l = str.length,
        rst = [];
    if (l) {
        for (var i = 0; i < l; i++) {
            if (str.charCodeAt(i) > 255) {
                b += 2;
            }
            else {
                b++;
            }

            if (b <= len) {
                rst.push(str[i]);
            }
            if (b >= len) {
                rst.push('...');
                break;
            }
        }
    }

    return rst.join('');
};
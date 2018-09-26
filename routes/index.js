var config = require('../config');
var auth = require('ymt-node-auth');
var session = require('ymt-session');
var Util = require('../helper/util');
var request2 = require('request');
var routeLog = require('debug')('routes');

//controller
var MAXAGE = 1000 * 60 * 30;

var proxy = function (app, express) {
  //公共参数
  app.use(function (req, res, next) {
    req.body.ClientType = config.clientType;
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    next();
  });


  // app.all('/api/signin', coupon.toSignin);
  app.all('/api/*', require('./_api')(express));
};

module.exports = function (app, express) {
  //用于解密SessionId的到AccessToken
    app.use(session._parseSession());
   
    app.use(function (req, res, next) {
        
        routeLog(+new Date());
        var query = Util.parseLocator(req.originalUrl, 'lower');
        if (query.accesstoken) {
            request2.get({
                url: 'http://auth.ymatou.com/json/reply/SignAuthRequestDto?Token=' + query.accesstoken + '&tokensource=app'
            }, function (err, res1, text) {
                if (err) {
                    log.Error({
                        Message: err
                    });
                    return res.send(err);
                }

                var body01 = {};
                try {
                    body01 = (typeof text == 'string') ? JSON.parse(text) : text;
                } catch (e) {}

                if (body01.Result && body01.Result.Code === 'OK' && body01.Result.UserData.UserId) {
                    req.appInfo.userId = body01.Result.UserData.UserId;
                    req.appInfo.accessToken = query.accesstoken;

                    // session._createIdentSession(res, req.appInfo.userId, req.appInfo.accessToken);
                }

                next();
            });
        } else if (req.appInfo.userId && req.appInfo.accessToken) {
            next();
        } else next();
    });

    app.all('/warmup', function (req, res) {
        res.send('ok');
    }); //点火
  proxy(app, express);
};

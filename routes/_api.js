"use strict";
var http = require("http");
var querystring = require("querystring");
var proxyDic = require("./config");
var path = require("path");
var request = require("request-json");
var request2 = require("request");
var apiLog = require("debug")("request:_api");

module.exports = function(express) {
  var route = express.Router();

  //所有AccessToken参数都会在routes/index中被处理,
  //身份证验证只接受SessionID中的AccessToken值
  route.all("*", function(req, res) {
    var data = req.body;
    var key = req.path.replace(/\/api\//i, "");
    var pd = proxyDic[key];
    apiLog(+new Date());
    if (!pd) {
      return res.end('{Code:404,Msg:"Not found."}');
    }

    pd.host = pd.host.replace(/(^\S*\:\/\/)/, "");

    var reqUrl = req.protocol + "://" + pd.host;
    var client = request.createClient(reqUrl);
    var handleMap = {
      GET: function() {
        var url =
          pd.api +
          "?" +
          querystring.stringify(req.query) +
          "&userId=" +
          req.appInfo.userId;
          //console.log(req.appInfo.userId);
        //console.log(url+"...",req.appInfo.userId);
        console.log(req.appInfo.userId);
        client.get(url, responseHandle);
      },
      POST: function() {
        //官方的示例client.post(url,data,callback) data处传参不适用于'x-www-form-urlencoded'形式传参，
        //故POST统一使用URLQueryString传参。测试可行,特此提示!
        //TODO:来日研究request-json包有什么问题。
        req.body.userId = req.body.UserId || req.appInfo.userId;
        req.body.AccessToken = req.body.accessToken;
        //var url = reqUrl + "" + pd.api + "?" + querystring.stringify(req.body);
        var url = pd.api;
        // console.log(url);
        // console.log(JSON.stringify(req.body));

        // request2.post({
        //     url: url,
        //     form: req.body
        // }, responseHandle);
        client.post(url,data, responseHandle);
      },
      PUT: function() {
        client.post(pd.api, data, responseHandle);
      },
      DEL: function() {
        var url = path.join(pd.api, querystring.stringify(req.body));
        client.get(url, responseHandle);
      },
      PATCH: function() {
        client.post(pd.api, data, responseHandle);
      }
    };

    var handle = handleMap[req.method.toUpperCase()];
    if (handle) {
      handle();
    } else {
      res.send('{Code:500,Msg:"Server Error."}');
    }

    function responseHandle(err, response, body) {
      if (err) {
        return res.send(err.message);
      }
      if (body.Status === 200 && body.Result) {
        //console.info(body);

        //body.Result = {State: 'success'};
        res.send(body);
      } else {
        res.send(body);
      }
    }
  });

  return route;
};

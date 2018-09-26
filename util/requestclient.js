/**
 * Created by fengbiao on 2016/11/15.
 */
var apiClient = require('ymt-node-apiclient');

function handleResponse(path, err, body, callback) {
  if (!err && body && !(typeof body === "object" || body instanceof Array) &&
    body.indexOf("<!DOCTYPE html PUBLIC") != -1) {
    err = new Error('错误的body返回内容' + body);
  }

  if (err) {
    log.Error({Message: '访问url(' + path + '), 服务端发生异常'});
    log.Error({Message: "服务端返回数据： " + body});
    log.Error({Message: "Error： " + JSON.stringify(err)});
  }
  callback(err, body);
}

exports.get = function (host, path, params, callback) {
  var url = host + path;
  var callInfo = {
    method: 'get',
    host: host,
    headers: {"Content-Type": "application/json"},
    path: path
  };
  try {
    apiClient.exec(callInfo, params, function (err, body) {
      handleResponse(url, err, body, callback);
    });
  }
  catch (e) {
    log.Error({Message: "服务端发生异常： " + e});
    log.Error({Message: "请求地址： " + url});
    log.Error({Message: "Error： " + JSON.stringify(e)});
    callback(e, undefined);
  }
};

exports.post = function (host, path, data, callback) {
  var url = host + path;
  var callInfo = {
    method: 'post',
    host: host,
    headers: {"Content-Type": "application/json"},
    path: path
  };

  try {
    apiClient.exec(callInfo, data, function (err, body) {
      handleResponse(url, err, body, callback);
    });
  }
  catch (e) {
    log.Error({Message: "服务端发生异常： " + e});
    log.Error({Message: "请求地址： " + url});
    log.Error({Message: "Error： " + JSON.stringify(e)});
    callback(e, undefined);
  }
};
/**
 * Created by fengbiao on 2016/10/8.
 */
exports.hasError = function(paramArray) {
  var err = undefined;
  for(var key in paramArray) {
    if(key == 'callback') {
      if (typeof paramArray[key] !== 'function') {
        err = new Error('缺少回掉函数');
        err.code = 422;
        break;
      }
    }
    else {
      if (!paramArray[key]) {
        err = new Error('缺少必要参数(' + key + ')');
        err.code = 422;
        break;
      }
    }
  }
  return err;
};

exports.compatibleParam = function (queryObj, targetWord) {
  targetWord = targetWord.toLowerCase();
  var paramVal = undefined;
  for(var key in queryObj) {
    if(key.toLowerCase() == targetWord) {
      paramVal = queryObj[key];
      break;
    }
  }
  return paramVal;
};
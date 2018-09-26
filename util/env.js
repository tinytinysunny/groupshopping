/**
 * 简单的通过ip判断是否本机运行在SIT， 还是STAGE或者生产环境中
 * @type {[type]}
 */

var os = require('os')

const YMATOU_SIT_PATTERN = /^172\.16/

exports.isNotInProduction = function () {
  var interfaces = os.networkInterfaces()
  var addresses = []
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2]
          if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address)
          }
      }
  }
  var ip = addresses.length && addresses[0] || ''
  var notProd = YMATOU_SIT_PATTERN.test(ip)

  return notProd
}

"use strict"
// 引入express
const express = require('express');
const domain = require('domain');
// 处理路径
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
// 定义全局的Vue为了服务端的app.js
global.Vue = require('vue');
var layout = fs.readFileSync('./index.html', 'utf8')
// 创建一个渲染器
var renderer = require('vue-server-renderer').createRenderer();


// 处理post数据模块
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: false
}));
server.use(cookieParser());
// 访问静态资源文件，假设访问的dist目录
server.use(express.static(path.join(__dirname, '/dist')));


// 部署静态文件夹为 "assets"文件夹
server.use('/assets', express.static(
  path.resolve(__dirname, 'assets')
))
// 处理所有的Get请求
server.get('*', function (request, response) {
  // 渲染我们的Vue应用为一个字符串
  renderer.renderToString(
    // 创建一个应用实例
    require('./assets/app')(),
    // 处理渲染结果
    function (error, html) {
      // 如果渲染时发生了错误
      if (error) {
        // 打印错误到控制台
        console.error(error)
        // 告诉客户端错误
        return response
          .status(500)
          .send('Server Error')
      }
      // 发送布局和HTML文件
      response.send(layout.replace('<div id="app"></div>', html))
    }
  )
})
// 监听5000端口
server.listen(5000, function (error) {
  if (error) throw error
  console.log('Server is running at localhost:5000')
});




module.exports = server;
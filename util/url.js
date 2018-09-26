var host = 'http://127.0.0.1:3000/api/v1';
module.exports = {
  // 首页banner
  banners: host + '/api/home/getbannerlist',
  // 限时抢
  panicbuy: host + '/api/home/getpanicbuy',
  // 全部必买清单
  hometopic: host + '/api/home/gethometopic',
  // 洋货集
  foreigngroup: host + '/api/nodehome/foreigngroup?moduleType=1&pageid=2027&pageindex=1',
  // 小图片
  operations: host + '/api/nodesearch/assortment/operationlist',

  smalls: host + '/api/nodesearch/assortment/smalllist?pageindex=1',
  // 品牌
  brands: host + '/api/nodesearch/assortment/brandlist?pageindex=1',
  // 猜你喜欢
  homeprod: host + '/api/guess/homeprod',
  // 7.
  bigs: host + '/api/nodesearch/assortment/biglist',
  // 凑热闹
  funs: host + '/api/nodehome/joinfun'
}

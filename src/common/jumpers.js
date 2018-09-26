// ymtApi 跳全部商品详情
var goToProduct = function ({ productId, sellerId, logo, seller, tradingSpecial }) {
  YmtApi.openProductDetail({
    SellerName: seller,
    param: {
      SellerModel: {
        Logo: logo,
        Seller: seller,
        SellerId: sellerId
      },
      ProductModel: {
        ProductId: productId,
        tradingSpecial: tradingSpecial,
      }
    }
  })
}

// 跳转直播频道
var goToLiveHome = function () {
  YmtApi.liveHome()
}

//跳转直播详情
var goToLive = function (id, topId) {
  id = id && id.toString();
  topId = topId && topId.toString() || "";
  if (YmtApi.isSaohuoApp) {
    if (YmtApi.checkJSBridge('liveDetail')) {
      ymt.liveDetail({
        "activity": {
          "ActivityId": id,
          "TopProductId": topId
        }
      });
    }
  } else {
    var str = window.location.protocol + '//m.ymatou.com/live/page/index/' + id;
    window.location.href = str;
  }

}


// 跳转买手主页
var goToSellerHome = function (userName, userId, userPic) {
  var userType = 1;
  openUserPage({ userName, userId, userType, userPic })
}

var openUserPage = function (userInfo) {//{userName,userId,userType,userPic}
  if (userInfo) {
    var winCfg = getOpenWinConfig('user', userInfo);
    YmtApi.openWin(winCfg);
  }
}

//获取openWin的配置信息
var getOpenWinConfig = function (type, info) {
  var typeRule = { 'user': getUserWinConfig };//detail:笔记详情，user:用户主页
  if (type) {
    var btnCfg = getBtnFlagConfig();
    var winCfg = typeRule[type] && typeRule[type].call(this, info);
    return $.extend({}, btnCfg, winCfg);
  }
}

//获取nav上的按钮的配置信息
var getBtnFlagConfig = function () {
  return {
    msgFlag: 1,
    shareFlag: 1,
    showWeiboFlag: 1
  };
}

//获取用户主页的配置信息及文案
var getUserWinConfig = function (userInfo) {
  const urlConfig = {
    buyer: '//m.ymatou.com/diary/forBuyerApp/buyerHome',//买家主页
    seller: '//m.ymatou.com/sellerhome/forBuyerApp/sellerHome',//买手主页
    detail: '//m.ymatou.com/note/detail',//note站点
    diaryDetail: '//m.ymatou.com/diary/forBuyerApp/notes/details',//老diary站点
  }
  var userName = userInfo['userName'] || '';
  var userId = userInfo['userId'];
  var userType = userInfo['userType'];
  var userPic = userInfo['userPic'] || '';
  var buyerUrl = YmtApi.utils.addParam(urlConfig['buyer'], { BuyerId: userId });
  var sellerUrl = YmtApi.utils.addParam(urlConfig['seller'], { SellerId: userId });
  //买家文案
  var buyer = {
    url: buyerUrl,
    title: '买家主页',
    ShareTitle: '看看' + userName + '的好货分享，败家心得，不吐不快',
    ShareContent: '',
    SharePicUrl: userPic,
    ShareLinkUrl: buyerUrl
  };
  //买手文案
  var seller = {
    url: sellerUrl,
    title: '买手主页',
    ShareTitle: '我是洋码头认证买手' + userName,
    ShareContent: '愿做你发现世界的眼睛，全球好货尽收囊中',
    SharePicUrl: userPic,
    ShareLinkUrl: sellerUrl
  };
  var cfg = {
    0: buyer,
    1: seller
  };
  return cfg[userType]
}

var goToSearch = function (filters) {
  var search = {
    type: 1,  // 目前只支持商品
    keys: filters.KeyWords,
    filter: []
  }

  var filterItem

  if (filters.MinPrice && filters.MaxPrice) {
    search.filter.push({
      "list": [
        {
          "name": `${filters.MinPrice}-${filters.MaxPrice}`,
          "type": 0
        }
      ],
      "name": "价格区间",
      "type": 4
    })
  }

  for (var typeName in filters) {
    const fitlerDict = {
      'Categorys': {
        id: 3,
        name: '品类'
      },
      'Brands': {
        id: 2,
        name: '品牌'
      },
      'Countrys': {
        id: 6,
        name: '买手地区'
      }
    }

    var typeObj = fitlerDict[typeName]

    if (typeof typeObj !== 'undefined') {
      filterItem = {
        type: typeObj.id,
        name: typeObj.name
      }

      filterItem.list = []
      for (var id in filters[typeName]) {
        filterItem.list.push({
          id: id,
          name: filters[typeName][id]
        })
      }

      search.filter.push(filterItem)
    }
  }

  YmtApi.search(search)
}

// ymtApi open
var goToLink = function ({ url, title }) {
  if (!url) return
  YmtApi.openWin({
    url: url,
    title: title,
    backFlag: true
  })
}

export default {
  goToLiveHome,
  goToProduct,
  goToLink,
  goToSearch,
  goToSellerHome,
  goToLive,
}

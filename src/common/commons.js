//根据banner数据跳转
//type类型枚举： 1:直播，2:url链接，3:商品，4:买手，5:模块, 6:直播模块，7:专题， 8:社区， 9:笔记
const commonUtil = {
  urlMapping: {
    "1": function(opt) {
      //1:直播
      YmtApi.liveDetail({
        SellerModel: opt.SellerModel || {},
        ActivityModel: opt.ActivityModel || {}
      });
    },
    "2": function(opt) {
      //2:url链接
      YmtApi.openWin({ url: opt.Url });
    },
    "3": function(opt) {
      //3:商品
      YmtApi.openProductDetail({
        SellerName: opt.SellerName,
        param: {
          SellerModel: opt.SellerModel || {},
          ProductModel: opt.ProductModel || {}
        }
      });
    },
    "4": function(opt) {
      //4:买手
      var url = YmtApi.utils.addParam(communityUtil.urlConfig["seller"], {
        SellerId: opt.SellerId,
        SellerName: opt.SellerName,
        title: opt.title || ""
      });
      YmtApi.openWin({ url: url });
    },
    "5": function(opt) {
      //5:模块
      return;
    },
    "6": function(opt) {
      //6:直播模块
      return;
    },
    "7": function(opt) {
      //7:专题
      YmtApi.openWin({ url: opt.Url });
    },
    "8": function(opt) {
      //8:社区
      var tagOpt = {
        tagType: opt.ImageTagType,
        tagId: opt.TagId,
        name: opt.Name,
        des: opt.Des,
        picUrl: opt.PicUrl
      };
      communityUtil.locateTag(tagOpt);
    },
    "9": function(opt) {
      //9:专题笔记
      var url = YmtApi.utils.addParam(communityUtil.urlConfig["detail"], {
        NoteId: opt.NoteId,
        sharePic: opt.PicUrl,
        title: opt.Name || " "
      });
      YmtApi.openWin({ url: url, winType: 2 });
    }
  },

  //标签聚合页
  locateTag: function(opt) {
    //{tagId,tagType,name,des,picUrl}
    var tagType = opt.tagType,
      tagId = opt.tagId,
      name = opt.name,
      url = "//m.ymatou.com/diary/forBuyerApp/";
    tagId = tagId || name;
    //类型与子路径映射
    //0:价格，1:地区，2:品类，3:品牌，4:活动，5:推荐，6:自定义，7:后台编辑推荐
    var typeMap = {
      "1": "tags/local/" + tagId,
      "2": "tags/category/" + tagId,
      "3": "tags/brand/" + tagId,
      "4": "activity/details/" + tagId,
      "5": "tags/recommend",
      "6": "tags/custom/" + tagId,
      "7": "tags/custom/recommend/" + tagId
    };

    url = url + typeMap[tagType]; //拼接子路径
    url = YmtApi.utils.addParam(url, { title: opt.name || "洋码头" });
    if (tagType == 4) {
      opt.des = opt.des ? opt.des.substr(0, 50) : "";
      url = YmtApi.utils.addParam(url, {
        title: opt.name || "活动详情",
        ShareTitle: opt.name || "洋码头",
        ShareContent: opt.des || "",
        SharePicUrl: opt.picUrl || "",
        ShareLinkUrl:
          "//m.ymatou.com/diary/forBuyerApp/activity/details/" + tagId,
        shareFlag: 1,
        msgFlag: 1
      });
      YmtApi.openWin({ url: url, winType: 11 });
    } else {
      YmtApi.openWin({ url: url });
    }
  },

  locateBanner: function(opt) {
    var type = opt["Type"];
    this.urlMapping[type](opt);
  },

  listProdPicUrl: function(oldUrl) {
    if (!oldUrl) return oldUrl;
    if (
      oldUrl.indexOf("_n_") >= 0 //新图片规则
    )
      return oldUrl.replace("_o.", "_lb.");
    //兼容老C商品图片
    if (oldUrl.indexOf("/shangou/") >= 0)
      return oldUrl.replace("original", "listb").replace("_o.", "_lb.");
    //兼容老M商品图片
    if (oldUrl.indexOf("/product/") >= 0)
      return oldUrl.replace("original", "list").replace("_o.", "_l.");

    if (oldUrl.indexOf("original") >= 0)
      return oldUrl.replace("original", "listb").replace("_o.", "_lb.");
    return oldUrl.replace("_o.", "_lb.");
  },
  //图片缩放
  imgUrlFormat: function(format, imageUrl) {
    var url = (imageUrl || "").replace(/_[omls]\./g, format + ".");
    var results = url.match(/\/original\//);
    if (results && results.length > 0) {
      url = url
        .replace(/\/original\//, "/small/")
        .replace(/_[oml]\./g, "_s" + ".");
    }
    return url;
  },

  parseDate: function(str) {
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/gi, "");
    var results = null;

    //秒数 #9744242680
    results = str.match(/^ *(\d{10}) *$/);
    if (results && results.length > 0) return new Date(parseInt(str) * 1000);

    //毫秒数 #9744242682765
    results = str.match(/^ *(\d{13}) *$/);
    if (results && results.length > 0) return new Date(parseInt(str));

    //20110608
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);
    if (results && results.length > 3)
      return new Date(
        parseInt(results[1]),
        parseInt(results[2]) - 1,
        parseInt(results[3])
      );

    //20110608 1010
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);
    if (results && results.length > 5)
      return new Date(
        parseInt(results[1]),
        parseInt(results[2]) - 1,
        parseInt(results[3]),
        parseInt(results[4]),
        parseInt(results[5])
      );

    //2011-06-08
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/
    );
    if (results && results.length > 3)
      return new Date(
        parseInt(results[1]),
        parseInt(results[2]) - 1,
        parseInt(results[3])
      );

    //2011-06-08 10:10
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/
    );
    if (results && results.length > 5)
      return new Date(
        parseInt(results[1]),
        parseInt(results[2]) - 1,
        parseInt(results[3]),
        parseInt(results[4]),
        parseInt(results[5])
      );

    //2011/06\\08 10:10:10
    results = str.match(
      /^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/
    );
    if (results && results.length > 6)
      return new Date(
        parseInt(results[1]),
        parseInt(results[2]) - 1,
        parseInt(results[3]),
        parseInt(results[4]),
        parseInt(results[5]),
        parseInt(results[6])
      );

    return new Date(str);
  },

  //时间别名处理
  getTimeAlias: function(timeStr) {
    var dataStr = timeStr ? timeStr.split(" ")[0] : "";
    if (dataStr) {
      var timeDate = this.parseDate(timeStr),
        nowDate = new Date();
      var peroid = nowDate.getTime() - timeDate.getTime();
      var timeAlias = "";
      if (peroid <= 60 * 1000) {
        //1分钟内
        timeAlias = "刚刚";
      } else if (peroid <= 60 * 60 * 1000) {
        //1小时内
        timeAlias = parseInt(peroid / 60 / 1000) + "分钟前";
      } else if (peroid <= 24 * 60 * 60 * 1000) {
        //24小时内
        timeAlias = parseInt(peroid / 60 / 60 / 1000) + "小时前";
      } else {
        //超过24小时
        timeAlias = dataStr;
      }
      return timeAlias;
    }
    return "";
  },

  //获取imgurl上的宽高比
  getScale: function(url) {
    var scale = [];
    var scaleStr = url.match(/_\d+_\d+/g);
    if (scaleStr) {
      var scaleList = scaleStr.toString().split("_");
      scaleList.forEach(function(item) {
        item && scale.push(item);
      });
    } else {
      scale = [1, 1]; //默认1:1
    }
    return scale;
  },
  isSquare: function(url) {
    var scale = this.getScale(url);
    return scale && scale.length == 2 && scale[0] == scale[1];
  },
  getCompressSize: function(url) {
    var scale = this.getScale(url);
    //console.log(scale);
    var compressW = this.fallWidth,
      compressH = compressW * scale[1] / scale[0];
    return [compressW, compressH];
  },

  //进入商品页面
  openProductPage: function(productId, sellerId, sellerName) {
    var sellerModel = {
      //买手数据
      Logo: "",
      Seller: sellerName,
      SellerId: sellerId
    };
    var productModel = {
      //商品数据
      ProductId: productId
    };
    YmtApi.openProductDetail({
      SellerName: sellerName,
      param: {
        SellerModel: sellerModel,
        ProductModel: productModel
      }
    });
  },
  compareVersion: function(s1, s2) {
    var result;
    var vs1 = s1.replace("appVersion/", "").split(".");
    var vs2 = s2.replace("appVersion/", "").split(".");

    for (var i = 0; i < 3; i++) {
      if (parseInt(vs1[i]) != parseInt(vs2[i])) {
        if (vs1[i] == "undefined" || vs1[i] == null) vs1[i] = 0;
        if (vs2[i] == "undefined" || vs2[i] == null) vs2[i] = 0;

        if (parseInt(vs1[i]) > parseInt(vs2[i])) {
          result = true;
        } else {
          result = false;
        }
        break;
      }
    }

    return result;
  },

  //进入用户主页
  openUserPage: function(userInfo) {
    //{userName,userId,userType,userPic}
    if (userInfo) {
      var winCfg = this.getOpenWinConfig("user", userInfo);
      //买手主页新版本兼容
      if (userInfo["userType"] == 1) {
        if (
          (YmtApi.isIos &&
            this.compareVersion(YmtApi.appVersion, "appVersion/3.2.1")) ||
          (YmtApi.isAndroid &&
            this.compareVersion(YmtApi.appVersion, "appVersion/3.2.1"))
        ) {
          winCfg["winType"] = 4;
        }
      }
      YmtApi.openWin(winCfg);
    }
  },
  //进入笔记详情页
  openDetailPage: function(detailInfo) {
    if (detailInfo) {
      var winCfg = this.getOpenWinConfig("detail", detailInfo);
      YmtApi.openWin(winCfg);
    }
  },

  //获取openWin的配置信息
  getOpenWinConfig: function(type, info) {
    var typeRule = {
      detail: this.getDetailWinConfig,
      user: this.getUserWinConfig
    }; //detail:笔记详情，user:用户主页
    if (type) {
      var btnCfg = this.getBtnFlagConfig();
      var winCfg = typeRule[type] && typeRule[type].call(this, info);
      return $.extend({}, btnCfg, winCfg);
    }
  },
  //获取nav上的按钮的配置信息
  getBtnFlagConfig: function() {
    return {
      msgFlag: 1,
      shareFlag: 1,
      showWeiboFlag: 1
    };
  },
  //获取用户主页的配置信息及文案
  getUserWinConfig: function(userInfo) {
    var userName = userInfo["userName"] || "";
    var userId = userInfo["userId"];
    var userType = userInfo["userType"];
    var userPic = userInfo["userPic"] || "";
    var buyerUrl =
      window.location.protocol +
      YmtApi.utils.addParam(this.urlConfig["buyer"], { BuyerId: userId });
    var sellerUrl =
      window.location.protocol +
      YmtApi.utils.addParam(this.urlConfig["seller"], {
        SellerId: userId,
        SellerName: userName
      });
    //买家文案
    var buyer = {
      url: buyerUrl,
      title: "买家主页",
      ShareTitle: "看看" + userName + "的好货分享，败家心得，不吐不快",
      ShareContent: "",
      SharePicUrl: userPic,
      ShareLinkUrl: buyerUrl,
      sina: "看看" + userName + "的好货分享，败家心得，不吐不快 "
    };
    //买手文案
    var seller = {
      url: sellerUrl,
      title: "买手主页",
      ShareTitle: "我是洋码头认证买手" + userName,
      ShareContent: "愿做你发现世界的眼睛，全球好货尽收囊中",
      SharePicUrl: userPic,
      ShareLinkUrl: sellerUrl,
      sina: "我是买手" + userName + ",愿做你发现世界的眼睛 "
    };
    var cfg = {
      0: buyer,
      1: seller
    };
    return cfg[userType];
  },
  //获取笔记详情页的配置信息及文案
  getDetailWinConfig: function(detailInfo) {
    //{noteId, userType, userName, imgUrl, des}
    var noteId = detailInfo["noteId"];
    var noteType = detailInfo["noteType"];
    var userName = detailInfo["userName"];
    var userType = detailInfo["userType"]; //0:buyer, 1: seller
    var title = (detailInfo["noteTitle"] || "笔记详情").substring(0, 30);
    var des = (detailInfo["des"] || "我在洋码头发现了一篇美美的购物笔记").substring(0, 30);
    try {
      encodeURIComponent(des);
    } catch (e) {
      des = des.substring(0, des.length - 1);
    }
    var imgUrl = detailInfo["imgUrl"] || "";

    //IOS3.1.2版本后禁止了301,302重定向
    //此版本之后，笔记详情跳转至note站点
    //此版本之前，笔记详情跳转至diary站点
    // var siteName = (YmtApi.isIos && YmtApi.appVersion >= 'appVersion/3.1.2') ? 'detail' : 'diaryDetail';
    //2017-01-11不再做此兼容
    var siteName = "detail";
    var detailUrl = YmtApi.utils.addParam(this.urlConfig[siteName], {
      NoteId: noteId
    });
    var shareLinkUrl = window.location.protocol + detailUrl;
    //买家文案
    var buyer = {
      1: {
        //普通笔记
        ShareTitle: "看看" + userName + "的好货分享，败家心得，不吐不快",
        sina: "我在#洋码头#发现了好东西--" + des + "... ..."
      },
      2: {
        //专题笔记
        ShareTitle: title,
        sina: "我在#洋码头#分享了好东西--" + title + "... ..."
      },
      3: {
        //长图文
        ShareTitle: "看看" + userName + "的好文分享，败家心得，不吐不快",
        sina: "我在#洋码头#发现了精彩好文--" + des + "... ..."
      },
      4: {
        //视频
        ShareTitle: "看看" + userName + "的精彩小视频分享，败家心得，不吐不快",
        sina: "我在#洋码头#发现了精彩的小视频--" + des + "... ..."
      }
    };

    //买手文案
    var seller = {
      1: {
        //普通笔记
        ShareTitle: "我是买手" + userName + "，愿做你发现世界的眼",
        sina: "我在#洋码头#分享了好东西--" + des + "... ..."
      },
      3: {
        //长图文
        ShareTitle: "我是买手" + userName + "，用精彩好文带你发现世界",
        sina: "我在#洋码头#分享了精彩好文--" + des + "... ..."
      },
      4: {
        //视频
        ShareTitle: "我是买手" + userName + "，用好看好玩的小视频带你畅玩世界",
        sina: "我在#洋码头#分享了好看好玩的小视频--" + des + "... ..."
      }
    };

    var userCfg = {
      0: buyer,
      1: seller
    };

    var commCfg = {
      url: detailUrl,
      title: title,
      ShareContent: des,
      SharePicUrl: imgUrl,
      ShareLinkUrl: shareLinkUrl,
      winType: 2
    };

    return $.extend({}, commCfg, userCfg[userType][noteType]);
  },

  //获取URL参数
  getUrlParam: function() {
    var param = YmtApi.utils.getUrlObj();
    var sellerId = param["SellerId"] || param["sellerId"] || "";
    var cookieId =
      (YmtApi.isAndroid ? param["DeviceToken"] : param["DeviceId"]) || "";
    var yid = param["yid"] || "";
    //获取用户信息
    var authInfo = YmtApi.utils.getAuthInfo();
    var loginUserId = authInfo["UserId"] || "";
    var accessToken = authInfo["AccessToken"] || "";
    return $.extend({}, param, {
      sellerId: sellerId,
      cookieId: cookieId,
      yid: yid,
      loginUserId: loginUserId,
      accessToken: accessToken
    });
  },
  addUrlParam: function(qs) {
    let url = window.location.href;
    if (url) {
      url += url.match(/\?/) ? "&" : "?" + qs;
    }
  },

  //app风格的alert
  ymtAlert: function(text, opt) {
    var id = "ymt-alert";
    var $ymtAlert = $("#" + id);
    if (!($ymtAlert && $ymtAlert.length)) {
      $ymtAlert = $('<div id="' + id + '" class="ymt-alert-wrapper"></div>');
      $ymtAlert.html('<div class="ymt-alert"><p class="text"></p></div>');
      $("body").append($ymtAlert);
    }
    opt = opt || {};
    $ymtAlert.find(".text").html(text);
    if (opt.iconClass) {
      //opt.iconClass: icon-red icon-buyer-added icon-20
      $ymtAlert
        .find(".ymt-alert")
        .prepend('<i class="icon ' + opt.iconClass + '"></i>');
    }
    $ymtAlert.removeClass("hide");
    setTimeout(function() {
      $ymtAlert.find("i").remove();
      $ymtAlert.addClass("hide");
    }, opt.time || 3000);
  },

  //站点地址配置
  urlConfig: {
    buyer: "//m.ymatou.com/diary/forBuyerApp/buyerHome", //买家主页
    seller: "//m.ymatou.com/sellerhome/forBuyerApp/sellerHome", //买手主页
    newSeller: "//m.ymatou.com/seller", //新版买手主页
    detail: "//m.ymatou.com/note/detail", //note站点
    diaryDetail: "//m.ymatou.com/diary/forBuyerApp/notes/details", //老diary站点
    tuan: "//m.ymatou.com/tuan/detail.html" //砍价团详情页
  },

  //ymt 1像素空图片
  emptyImg:
    "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==",

  scrollEventStop: function() {
    YmtApi.titleBar({
      //隐藏titlebar
      visible: 0
    });
    YmtApi.scrollEvent({
      enable: false //禁止滚动
    });
  },
  scrollEventEnable: function() {
    YmtApi.titleBar({
      //显示titlebar
      visible: 1
    });
    YmtApi.scrollEvent({
      enable: true //禁止滚动
    });
  },
  parseLocator: function(url, args) {
    url = url === null || url === undefined ? "" : String(url);
    var query = {},
      list,
      str;
    if (url.indexOf("?") !== -1) {
      list = url.split("?")[1].split("&");
      for (var i = 0, len = list.length; i < len; i++) {
        str = list[i].split("=");
        str.push("");

        var key = str[0];
        if (args && args.indexOf("lower") > -1)
          key = String(str[0]).toLowerCase();
        else if (args && args.indexOf("upper") > -1)
          key = String(str[0]).toUpperCase();

        if (args && args.indexOf("group") > -1) {
          if (query[key]) query[key].push(str[1]);
          else query[key] = [str[1]];
        } else query[key] = str[1];
      }

      for (var i in query) {
        if (query[i] && query[i].length === 1) {
          query[i] = query[i][0];
        }
      }
    }
    return query;
  },
  createURL: function(url, params) {
    let myURL = "";
    let reg = /&$/gi;
    for (let key in params) {
      let link = "";
      if (typeof params[key] != "undefined") {
        link = key + "=" + params[key] + "&";
      }
      myURL += link;
    }

    myURL = myURL.replace(reg, "");
    myURL = url + "?" + myURL;
    return myURL.replace(" ", "");
  },
  getUrlObj: function() {
    let url = window.location.href;
    let urlobj = this.parseLocator(url, "lower");
    return urlobj;
  },
  getIframeWindow(obj) {
    //IE || w3c
    return obj.contentWindow || obj.contentDocument.parentWindow;
  },
  getCookie(name) {
    var arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
    else return null;
  },
  setCookie(name, value, expires, path, domain, secure) {
    expires = expires === undefined ? 100 * 360 * 24 * 60 * 60 * 1000 : (expires || 0);
    var expires_date = new Date((new Date()).getTime() + expires);
    document.cookie = name + '=' + escape(value) + ';expires=' + expires_date.toGMTString() +
      (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
  }
};

export default commonUtil;

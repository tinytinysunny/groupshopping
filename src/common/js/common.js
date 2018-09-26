import axios from 'axios';

var utils = {
	/**
	  * 封装axios，减少学习成本，参数基本跟jq ajax一致
	  * @param {String} type			请求的类型，默认post
	  * @param {String} url				请求地址
	  * @param {String} time			超时时间
	  * @param {Object} data			请求参数
	  * @param {String} dataType		预期服务器返回的数据类型，xml html json ...
	  * @param {Object} headers			自定义请求headers
	  * @param {Function} success		请求成功后，这里会有两个参数,服务器返回数据，返回状态，[data, res]
	  * @param {Function} error		发送请求前
	  * @param return
	*/
	ajax:function (opt){

		var opts = opt || {};

		if (!opts.url) {
			alert('请填写接口地址');
			return false;
		}

		axios({
			method: opts.type || 'post',
			url: opts.url,
			params: opts.data || {},
			headers: opts.headers || {
			  	'Content-Type':'application/x-www-form-urlencoded'
			},
			// `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
  			// 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
			baseURL:'http://t.lanchenglv.com/tp5demo/index.php/',
			timeout: opts.time || 10*1000,
			responseType: opts.dataType || 'json'
		}).then(function(res){

			if(res.status == 200 ){

				if(opts.success){
					opts.success(res.data,res);
				}

			}else{

				if (data.error) {
					opts.error(error);
				}else{
					console.log('好多人在访问呀，请重新试试[timeout]');
				}

			}


		}).catch(function (error){
			console.log(error);
			if (opts.error) {
				opts.error(error);
			}else{
				console.log('好多人在访问呀，请重新试试[timeout]');
			}
		});

	},

	/*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
    each: function (obj, fn) {
    	var That = this;
        if (obj) { //排除null, undefined
            var i = 0
            if (That.isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    if (fn(i, obj[i]) === false)
                        break
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                        break
                    }
                }
            }
        }
    },

	/**
	  * 获取url传过来的参数
	  * @param name 	获取的参数
	  * @param Url 		自定义获取参数的链接
	  * @param return
	*/
	getUrlQuery:function (name,Url){

	   //URL GET 获取值
　　   var reg = new RegExp("(^|\\?|&)"+ name +"=([^&]*)(\\s|&|$)", "i"),
             url = Url || location.href;
　　     if (reg.test(url))
　　     return unescape(RegExp.$2.replace(/\+/g, " "));
　　     return "";

	},

    /**  jsonp({
        *     url: "http://localhost:8080/ac/test.php",
        *     data: { q: 1 },
        *     callbackName: "foo",
        *     time:1,
        *     success: function (json) {
        *         // 此处放成功后执行的代码
        *         console.log(json.name)*
        *     },
        *     error: function(json){
        *         console.log(json.message);
        *     }
        });*/
    jsonp: function(options){
        options = options || {};
        options.callback = options.callback || "callback";
        if (!options.url || !options.callbackName) {
            throw new Error("参数不合法");
        }

        //创建 script 标签并加入到页面中
        var callbackName = (options.callbackName + Math.random()).replace(".", "");
        options.data[options.callback] = callbackName;

        var params = formatParams(options.data);

        var oHead = document.getElementsByTagName('head')[0];
        var oS = document.createElement('script');
        oHead.appendChild(oS);

        //创建jsonp回调函数
        // callbackName = callbackName.split("0")[0];
        window[callbackName] = function (json) {
            oHead.removeChild(oS);
            clearTimeout(oS.timer);
            window[callbackName] = null;
            options.success && options.success(json);
        };

        //发送请求
        oS.src = options.url + '?' + params;

        //超时处理
        if (options.time) {
            oS.timer = setTimeout(function () {
                window[callbackName] = null;
                oHead.removeChild(oS);
                options.error && options.error({ message: "超时" });
            }, options.time);
        }

        //格式化参数
        function formatParams(data) {
            var arr = [];
            for (var name in data) {
                arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
            }
            return arr.join('&');
        }
    },
		calSalePrice: function(val) {
				let valStr = String(parseFloat(val).toFixed(2))
				let numParts = valStr.split('.')
				let digits = numParts[1]
				let integerPart = numParts[0]

				function cut0(val){
					if(!val) return '';
					return val.lastIndexOf('0') == val.length -1 ?  cut0( val.substr(0,val.length-1)): val
				}

				// 把结尾的0都干掉
				let digitsWithout0 = cut0(digits)

				return integerPart + (digitsWithout0 ? `.${digitsWithout0}` : '')
		},
    goToProduct ({productId, sellerId, logo, seller,tradingSpecial}) {
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
                tradingSpecial:tradingSpecial,
              }
            }
        })
     },

     convert (oldUrl) {
        if (!oldUrl) return false;

        if(oldUrl.indexOf('_n_')>-1 || oldUrl.indexOf('shangou')>-1){
            return oldUrl.replace('_o.','_l.');
        }

        if(oldUrl.indexOf('/product/')>-1){
            return oldUrl.replace("original","list").replace("_o.","_l.");
        }

        if(oldUrl.indexOf('original')>-1){
            return oldUrl.replace("original", "listb").replace("_o.", "_lb.");
        }

        if(oldUrl.indexOf('lists')>-1){
            return oldUrl.replace("lists", "listb").replace("_ls.", "_lb.");
        }

        if(oldUrl.indexOf('/list')>-1){
            return oldUrl.replace("/list", "/listb").replace("_l.", "_lb.");
        }

        return oldUrl.replace("_o.","_lb.").replace("_ls.","_lb.").replace("_l.","_lb.");
      }
};

export default utils;

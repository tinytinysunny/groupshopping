//瀑布流
const waterfallUtil = {
	init: function (opt) {
		$(opt.selector).show();
		this.fallItem = '.fall-item';
		this.fallWidth = $(opt.selector).find(this.fallItem).width();
		this.selector = opt.selector;
		this.$fall1 = $(this.selector).find(this.fallItem).eq(0);
		this.$fall2 = $(this.selector).find(this.fallItem).eq(1);
	},
	getScale: function (url) {
		var scale = [];
		var scaleStr = url.match(/_\d*_\d*/g);
		if (scaleStr) {
			var scaleList = scaleStr.toString().split("_");
			scaleList.forEach(function (item) {
				item && scale.push(item);
			});
		} else {
			scale = [1, 1];//默认1:1
		}
		return scale;
	},
	isSquare: function (url) {
		var scale = this.getScale(url);
		return scale && scale.length == 2 && scale[0] == scale[1];
	},
	//获取等比压缩后的尺寸
	getCompressSize: function (url) {
		var scale = this.getScale(url);
		//console.log(scale);
		var compressW = this.fallWidth, compressH = compressW * scale[1] / scale[0];
		return [compressW, compressH];
	},
	//渲染：比较瀑布流两列的高低，始终将节点插入低的那一列上去
	render: function (itemHtml) {
		var fall1Height = this.$fall1.height(), fall2Height = this.$fall2.height();
		fall1Height <= fall2Height ? this.$fall1.append(itemHtml) : this.$fall2.append(itemHtml);
	},
	//清空瀑布流
	empty: function () {
		this.$fall1.empty();
		this.$fall2.empty();
	}
};

const noteListUtil = {
	//笔记列表初始化
	init: function (opt) {
		this.initLazyLoad(opt);
	},
	//lazyload初始化
	initLazyLoad: function (opt) {
		//笔记列表
		var urlParam = YmtApi.utils.getUrlObj();
		var cookieId = YmtApi.isAndroid ? urlParam['DeviceToken'] : urlParam['DeviceId'];
		this.noteLazy = new LazyLoadContent({
			url: opt.url,
			offsetBottom: 800,
			scrollEnable: opt.scrollEnable,
			params: opt.param || {
				pageSize: 10,
				AccessToken: urlParam.AccessToken || '',
				UserID: urlParam.UserId || '',
				Cookieid: cookieId || '',
				yid: urlParam['yid'] || ''
			},
			dealData: function (result) {
				opt.dealData && opt.dealData.call(this, result);
				var notes = opt.getNotes && opt.getNotes(result['Data']);
				if (!notes || !notes.length) {
					return null;
				}
				waterfallUtil.init(opt);//瀑布流初始化
				var data = { "noteList": notes };
				data["noteList"].forEach(function (note, i) {
					opt.convert && opt.convert(note, i);//转换成标准数据
					//内容
					var noteInfo = note['noteData']['noteInfo'];
					var pic = noteInfo['pic'] || '';
					var isSquare = waterfallUtil.isSquare(pic);//是否正方形
					var version = isSquare ? '_l' : '_s';//图片缩略图的版本,为了兼容老版本没有_s的缩略图，故如果为正方形，还是使用_l
					noteInfo['pic'] = commonUtil.imgUrlFormat(version, pic);//图片
					noteInfo['imgCompressSize'] = waterfallUtil.getCompressSize(pic);//瀑布图片等比压缩

					//用户
					var userInfo = note['noteData']["userInfo"];
					var logoUrl = userInfo["logo"];
					logoUrl = commonUtil.imgUrlFormat("_m", logoUrl);
					userInfo['logo_m'] = logoUrl;//小尺寸logo

					//埋点
					note['noteData']['moduleName'] = note['noteData']['moduleName'] || "note_list";

				});
				return data;
			},
			afterRenderDom: function (data) {
				var self = this;
				data['noteList'].forEach(function (note, i) {
					var noteHtml = self.doTemplate('note-list-tpl', { 'note': note });
					waterfallUtil.render(noteHtml);
				});
			},
			renderEnd: function (data) {
				window.CLazyLoad.flush();
				console.log("renderEnd");
				console.log(data);
			},
			loadStart: function () {
				console.log("loadStart");
				$('.loading-line').css('display', 'block');
			},
			loadEnd: function () {
				$('.loading-line').css('display', 'none');
				window._dc_ && _dc_('exec', 'load_more_fn', { 'module_name': 'note_list', 'module_page': this.index + 1 });
			},
			loadOver: function () {
				$('.loading-line').css('display', 'none');
				$('.load-over').show();
				console.log("loadOver");
			}
		});

		// 加载
		template.config("openTag", '<%');
		template.config("closeTag", '%>');
		//ymt 1像素空图片
		template.helper('$emptyImg', function () {
			return commonUtil.emptyImg;
		});
		this.noteLazy.loadPage();
	}
};


export default noteListUtil;




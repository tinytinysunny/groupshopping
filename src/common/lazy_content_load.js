
var LazyLoadContent= function(options) {

    var config = {

        //每页个数
        pageSize: 10,

        //预加载高度
        offsetBottom: 400,

        url: '',
        datas:[],

        //模板ID
        templId: null,

        //容器选择器
        container: '',

        //参数
        params: null,


        //render function
        render: null,

        overshow: null,

        loadOver: function () {

            //$("#pageLabels").find('.over').show();

        },

        scrollEnable: true

    };

    //唯一标志
    this._UUID = LazyLoadContent.getUUID();

    //当前页数
    this.index = 0;

    //ajax开关
    this.onOff = true;

    //是否监听
    this.isListenScroll = false;




    var me = this;

    this._scrollHandle = function () {
            var isSee = me.isBottom();
            var isThat = LazyLoadContent.scrollUUID === me._UUID;
            if (isSee && isThat) {
                me.loadNextPage();
            }
    };

    if(options['index']){
        this.index = options['index'];
    }

    this.opts = $.extend(config, options);

    this.overshow = this.opts.overshow;

}

LazyLoadContent.getUUID = (function () {
    var UUID = 1;
    return function () {
        return UUID++;
    };
})();

//正在监听滚动的对象ID
LazyLoadContent.scrollUUID = 0;

//初始化
LazyLoadContent.prototype.init = function () {
};

//实例化对象数
LazyLoadContent.prototype._newCount = 0;

//加载页面
LazyLoadContent.prototype.loadPage = function (index, isReFill) {
    debugger;
    var me = this,
        opts = me.opts,
        params = {},
        isSee = false;

    if(opts.scrollEnable){
        me.listenScroll();
    }
    

    //最底部元素可见，开关开启而且还有下拉
    me.onOff = false;

    if (opts.params && typeof opts.params == 'object') {
        for (var p in opts.params) {
            params[p] = typeof opts.params[p] == 'function' ? opts.params[p]() : opts.params[p];
        }
    }

    // var ajaxObj = $.extend({
    //     Page: index || me.index,
    //     pageSize: opts.pageSize
    // }, params);

    var PageIndexKey = opts['PageIndexKey'] || 'Page';
    var obj = {};
    me.index = index || me.index;
    obj[PageIndexKey] = me.index;
    //obj['pageSize'] = opts.pageSize;//买手主页无pageSize
    var ajaxObj = $.extend(obj, params);    


    opts.loadStart && opts.loadStart.call(this);
    $.get(opts.url, ajaxObj, function (result) {

        opts.loadEnd && opts.loadEnd.call(me,result);
        var data = opts.dealData ? opts.dealData.call(me,result) : result;//处理数据
        debugger;
        var list = null;

        if (!data) {
            opts.loadOver.call(me);
            me.onOff = false;
            return false;
        }

        try{
            
            
            me.renderDom(data, isReFill);
        }catch(e){
            //alert(e);
            console.log(e);
        }
        me.onOff = true;
    }, "json");


};



//渲染数据
LazyLoadContent.prototype.renderDom = function (data, isReFill) {
    debugger;
    var opt = this.opts,
        el, html;

    opt.renderStart && opt.renderStart.call(this);

    if (opt.render) {
        html = this.opts.render(data);
        el = $(html);
        isReFill ? $(opt.container).html(html) : $(opt.container).append(el);
        if (typeof opt.renderToDom == 'function') {
            opt.renderToDom(el);
        }
    }
    else if(opt.templId){
        var me = this,
            templ = me.opts.templ;
        //art-template
        html = template(me.opts.templId, data);
        isReFill ? $(opt.container).html(html) : $(opt.container).append(html);
    }else{
        isReFill ? opt.datas=data : opt.datas.push(data);
    }

    opt.afterRenderDom && opt.afterRenderDom.call(this, data);

    opt.renderEnd && opt.renderEnd.call(this, data);

};

LazyLoadContent.prototype.doTemplate = function(templateId, data){
    return template(templateId, data);
};


LazyLoadContent.prototype.stop = function () {
    this.onOff = false;
};

LazyLoadContent.prototype.start = function (index, isReFill) {
    this.onOff = true;
    this.index = index ? index : this.index;
    this.loadPage(this.index, isReFill);
};

//加载下一页
LazyLoadContent.prototype.loadNextPage = function () {
    var me = this;
    var opt = this.opts;
    if (me.onOff) {
        //页数加1
        //me.index++;
        me.index +=opt.limit;
        me.loadPage();
    }

};

//判断是否到底
LazyLoadContent.prototype.isBottom = function () {
    var me = this,
        offsetBottom = me.opts.offsetBottom;
    var sh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
        st = Math.max(document.documentElement.scrollTop, document.body.scrollTop),
        h = $(window).height();

    //console.log(sh - h - st < offsetBottom);
    return sh - h - st < offsetBottom;
};

//监听滚动事件
LazyLoadContent.prototype.listenScroll = function () {
    var me = this;

    LazyLoadContent.scrollUUID = me._UUID;
    //如果没有监听
    if (!me.isListenScroll) {
        $(window).bind('scroll', me._scrollHandle);
        me.isListenScroll = true;
    }

};

//放弃监听
LazyLoadContent.prototype.clearScroll = function () {
    $(window).unbind('scroll', this._scrollHandle);
    this.isListenScroll = false;
};

export default LazyLoadContent;
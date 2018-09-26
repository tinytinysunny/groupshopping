//inView组件
var InView = function(opt){
    InView._DEFAULT = {
        scroll: false,//是否绑定scroll事件(默认为false)
        moduleSelector: '.module',//模块选择器
        moduleId: 'module-id',//模块data属性的key
        aheadSize: 0,//提前量
        viewportHeight: window.innerHeight//视口高度
    };
    this.opt = $.extend({}, InView._DEFAULT, opt);
    //console.log(this.opt);
    this.moduleCache = {};//模块数据缓存
    this.moduleIndex = 1;

    //初始化事件
    this.initEvent();
}

InView.prototype = {
    //刷新模块数据缓存
    refresh: function(){
        var self = this;
        $(this.opt.moduleSelector).each(function(i, item){
            var $module = $(item);
            var id = self.getId($module);
            if($module){
                var rangeBegin = $module.offset().top;
                var rangeEnd =  rangeBegin + $module.height();
                var range = [rangeBegin, rangeEnd];
                var mc = self.moduleCache[id] || (self.moduleCache[id] = {});
                mc['range'] = range;
            }
        });
        //console.log('当前缓存数据为：');
        //console.log(JSON.stringify(self.moduleCache));
    },

    //获取模块唯一标示
    getId: function($module){
        var id = $module.data(this.opt.moduleId);
        if(!id){
            id = this.moduleIndex;
            $module.data(this.opt.moduleId, id);
            this.moduleIndex ++;
        }
        return id;
    },

    //将模块剔除
    omit: function(id){
        this.moduleCache[id]['omited'] = true;
    },

    //滑动事件处理
    scrollHandler: function(id){
        this.opt.inView && this.opt.inView(id);
    },

    //遍历所有模块，判断其是否在当前窗口范围内(wRange:当前窗口范围)
    checkInView: function(callback, wRange){
        var self = this;
        if(!wRange){//计算窗口范围
            var windowBegin = window.scrollY - this.opt.aheadSize, windowEnd = window.scrollY + this.opt.viewportHeight + this.opt.aheadSize;
            wRange = [windowBegin, windowEnd];//窗口范围
        }
        $.each(this.moduleCache, function(id, moduleItem){
            if(moduleItem['omited']){//是否被剔除
                return;
            }
            var mRange = moduleItem['range'];//模块区域
            if(self.isInView(mRange, wRange)){
                callback && callback(id);//inview
            }
            // if(
            //     (mRange[0] >= wRange[0] && mRange[0] <= wRange[1]) || //上边在视口内
            //     (mRange[1] >= wRange[0] && mRange[1] <= wRange[1]) || //下边在视口内
            //     (mRange[0] <= wRange[0] && mRange[1] >= wRange[1]) //整个模块大于视口
            // ){//inview
            //     callback && callback(id);
            // }
        });
    },

    //判断某一范围是否在另一个范围内
    isInView: function(mRange, wRange){
        if(
            (mRange[0] >= wRange[0] && mRange[0] <= wRange[1]) || //上边在视口内
            (mRange[1] >= wRange[0] && mRange[1] <= wRange[1]) || //下边在视口内
            (mRange[0] <= wRange[0] && mRange[1] >= wRange[1]) //整个模块大于视口
        ){//inview
            return true;
        }
    },

    //事件初始化
    initEvent: function(){
        var self = this;
        if(this.opt.scroll){
            //window的scroll事件
            $(window).scroll(function(){
                requestAnimationFrame(function(){
                    self.inView.checkInView(self.scrollHandler);
                });
            });
        }
    }
};


window.YmtInView = InView;
export default InView;

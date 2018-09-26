//曝光组件
var Exposure = function(opt){
    this.opt = $.extend({}, Exposure._DEFAULT, opt);
    //console.log(this.opt);
    this.exposureData = {};//曝光数据
}

Exposure._DEFAULT = {
    delay: 300,//滑动延迟
    mixin: {//插件管理
        inView: function(){
            if(InView && typeof InView === 'function'){
                return new InView();
            }else{
                //console.error('初始化失败,Exposure缺少InView组件');
            }
        }
    }
};

Exposure.prototype = {
    init: function(){
        if(this._inited){
            return;
        }
        this._inited = true;
        this.initMixin();//初始化mixin
        this.initEvent();//初始化事件

        //test
        if(this.test){
            this.test.showTips(this.inView.opt.moduleSelector, this.inView.opt.moduleId);//显示模块tips
        }
    },

    //mixin管理器
    initMixin: function(){
        var self = this;
        this.mixin = this.opt.mixin;
        $.each(this.mixin, function(k, v){
            if(v && typeof v === 'function'){
                v = v();
            }
            if(self[k]){
                self['_' + k + '_'] = self[k];
            }
            self[k] = v;
        });
    },

    //inview的封装
    checkInView: function(){
        var self = this;
        if(!this._inited){
            this.init();
        }
        this.inView.refresh();//刷新缓存
        this.inView.checkInView(function(id){
            self.doExposure(id);
        });
    },

    checkElementInView: function($dom){
        var self = this;
        var isElement = $dom && $dom.length && (Object.prototype.toString.call($dom.get(0)).indexOf('Element') > -1)
        if(isElement){
            var offset = $dom.offset();
            var m1 = offset['top'], m2 = m1 + offset['height'];
            var mRange = [m1, m2];//模块范围
            var w1 = window.scrollY, w2 = w1 + window.innerHeight;
            var wRange = [w1, w2];//窗口范围
            if(this.inView.isInView(mRange, wRange)){
                self.doExposure($dom);
            }
        }
    },

    //曝光处理
    doExposure: function(id){
        var $dom = id;
        if(typeof id === 'string'){
            $dom = this.getModule(id);
        }
        if($dom && $dom.length && $dom.offset().height > 0){
            // console.log('检测到' + id + '号模块被曝光');
            if(!this.exposureData[id]){
                this.exposureData[id] = {count: 0};
            }
            this.exposureData[id]['count'] ++;

            this.opt.onExposure && this.opt.onExposure($dom);

            //test
            if(this.test){
                //test
                this.test.showTips(this.inView.opt.moduleSelector, this.inView.opt.moduleId);//显示模块tips
                this.test.updateExposureTips.call(this, id);
            }
        }
    },

    getModule: function(id){
        return $('[data-' + this.inView.opt.moduleId + '="' + id + '"]');
    },

    //滑动事件
    scrollHandler: function(){
        var self = this;
        if(this.interval){
            clearTimeout(this.interval);
        }
        this.interval = setTimeout(function(){//滑动结束事件
            self.interval = null;
            //console.info('..............检测曝光..............');
            self.checkInView();//检查当前视口中的模块
        }, self.opt.delay);
    },

    //绑定事件
    initEvent: function(){
        var self = this;
        //window的scroll事件
        $(window).scroll(function(){
            requestAnimationFrame(function(){
                self.scrollHandler();
            });
        });
    }
};

window.YmtExposure = Exposure;
export default Exposure;

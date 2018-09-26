//懒加载
var LazyLoad = function(opt){
    this.opt = $.extend({}, LazyLoad._DEFAULT, opt);
    //console.log(this.opt);
};

LazyLoad._DEFAULT = {
    triggerSelector: 'body',//事件触发容器
    triggerName: 'moduleLoaded',//事件触发名称
    mixin: {//插件管理
        inView: function(){
            if(InView && typeof InView === 'function'){
                return new InView();
            }else{
                //console.error('初始化失败,LazyLoad缺少InView组件');
            }
        }
    }
};

LazyLoad.prototype = {
    init: function(){
        if(this._inited){
            return;
        }
        this.initMixin();//初始化mixin
        this.initEvent();//绑定事件

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
    checkInView: function(wRange){
        var self = this;
        if(!this._inited){
            this.init();
        }
        this.inView.refresh();//刷新缓存
        this.inView.checkInView(function(id){
            self.loadModule(id);
        }, wRange);
    },

    //加载模块
    loadModule: function(id){
        if(this.opt.load){
            //console.log(id + '号 模块开始加载...');
            this.opt.load(id);//判断为inview之后开始调用load事件
            this.inView.omit(id);//剔除此模块
        }else{
            //console.error('请检查load回调是否配置');
        }
    },

    //绑定事件
    initEvent: function(){
        var self = this;
        //window的scroll事件
        $(window).scroll(function(){
            requestAnimationFrame(function(){
                self.inView.checkInView(function(id){
                    self.loadModule(id);
                });
            });
        });

        //模块加载的回调
        $(this.opt.triggerSelector).on(this.opt.triggerName, function(event, data){
            if(data){
                var id = data['id'];
                //console.info(id + '号模块加载完毕-------');
                self.inView.refresh();//刷新
                if(self.test){
                    self.test.updateLazyTips(id);
                }
            }
        });
    }
};

window.YmtLazyLoad = LazyLoad;
export default LazyLoad;

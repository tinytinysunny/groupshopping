/**
 * Created by yangfei on 2015/12/1.
 */

    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz', 'ms'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
            window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    /**
     * @class 对话框类
     * @constructor
     */
    function Dialog(opts){
        opts = opts||{};
        this.el = $('<div class="dialog"></div>');
        this.body = $('<div class="dialog-body"></div>');
        this.footer = $('<div class="dialog-footer"></div>');
        this.btns = opts.btns || [{
                text: '确定',
                fn: function(){
                    this.hide();
                }
            },{
                text: '取消',
                fn: function(){
                    this.hide();
                }
            }];
        this.mask = window.mask;
        this.isHide = true;
        this.init();
    }

    /**
     * @name 渲染到dom
     * @returns {Dialog}
     */
    Dialog.prototype.render = function(){
        $('body').append(this.el);
        return this;
    };

    /**
     * @method 初始化dialog
     * @returns {Dialog}
     */
    Dialog.prototype.init = function(){
        this.el.append(this.body);
        this.el.append(this.footer);
        this.render();
        this.mask.render();
        $(this.mask.el).on('click', this.hide.bind(this));
        this.initBtn();
        return this;
    };

    /**
     *
     * @returns {Dialog}
     */
    Dialog.prototype.initBtn = function(){
        this.footer.html('');
        this.btns.forEach(function(btn){
            var btnEl = $('<span class="dialog-btn">'+btn.text+'</span>');
            btnEl.on('click', btn.fn.bind(this));
            this.footer.append(btnEl);
        }.bind(this));
        return this;
    };

    /**
     * @description 设置按钮
     * @returns {Dialog}
     */
    Dialog.prototype.setBtns = function(btns){
        this.btns = btns;
        return this.initBtn();
    };

    /**
     * @description 设置按钮
     * @returns {Dialog}
     */
    Dialog.prototype.setText = function(text){
        this.text = text||'';
        return this;
    };

    /**
     * @method 显示对话框
     * @returns {Dialog}
     */
    Dialog.prototype.show = function(){
        if (!this.isHide){
            return this;
        }
        this.isHide = false;
        this.el.show();
        this.mask.show();
        this.body.html(this.text);
        return this;
    };

    /**
     * @method 隐藏对话框
     * @returns {Dialog}
     */
    Dialog.prototype.hide = function(){
        if (this.isHide){
            return this;
        }
        this.isHide = true;
        this.el.hide();
        this.mask.hide();
        return this;
    };


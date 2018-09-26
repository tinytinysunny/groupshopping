/**
 * Created by yangfei on 2015/12/2.
 */


    var W = window;
    var CLazyLoad = {
        count: 0,// lazy image count
        scrollInterval:0,
        images : [],//save image
        query : document.getElementsByClassName('lazy'),//query img form HTML DOM
        /**
         * @method loadImage
         * @description load image
         * @param el
         * @param fn
         */
        loadImage : function(el, fn){
            //按宽高比计算图片高度，避免一部分的浏览器重绘
            var scale = el.dataset.scale;
            if(scale){
                //console.log('宽高比：' + scale);
                var ss = scale.split(',');
                if(ss && ss.length == 2){
                    var imgWidth = el.width;
                    el.height = imgWidth * ss[1] / ss[0];                    
                }
            }

            var img = new Image(), src = el.dataset.src;
            el.className = el.className.replace("lazy", "");

            img.onload = function(){
                if (!! el.parent){
                    el.parent.replaceChild(img, el);
                }else{
                    el.src = src;
                    el.style.opacity=1;
                }
                fn ? fn() : null;
            };
            img.onerror = function(){//当图片加载失败时,用空图代替
                img.onerror = null;//清空onerror事件，防止死循环
                src = img.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==";
            }
            img.src = src;

        },


        /**
         * @method loadImage
         * @description load image
         * @param el
         * @param fn
         */
        // loadImage : function(el, fn){
        //     var src = el.dataset.src;
        //     el.className = el.className.replace("lazy", "");
        //     el.style.opacity=1;
        //     el.style.backgroundImage = 'url(' + src + ')';
        //     el.style.backgroundSize = '100% auto';
        //     fn ? fn() : null;
        // },  

        /**
         * @method elementInViewport
         * @description get visual screen
         * @param el   element
         * @returns {boolean} return element whether is in visual rect
         */
        elementInViewport : function(el){
            var rect = el.getBoundingClientRect();
            return (rect.top >= Math.max(el.offsetHeight, el.clientHeight) * -1 && rect.top < (W.innerHeight || document.documentElement.clientHeight)+this.scrollInterval);
            //return (rect.top >= Math.max(el.offsetHeight, el.clientHeight) * -1 && rect.top < (W.innerHeight || document.documentElement.clientHeight));
        },
        /**
         * @method processScroll
         * @description process scroll event
         */
        processScroll : function(){
            var me = CLazyLoad;
            this.count = me.images.length;
            if(this.count < 1){
                return;
            }
            var tempImgArray = me.images.concat(), len = tempImgArray && tempImgArray.length, deleteCount = 0;
            for(var i = 0; i < len; i++){
                if (tempImgArray[i] && me.elementInViewport(tempImgArray[i])) {
                    me.loadImage(tempImgArray[i], function () {});
                    me.images.splice(i + deleteCount, 1);
                    --this.count;
                    --deleteCount;
                }
            }
        },
        flush: function(){
            var me = CLazyLoad;
            me.images = Array.prototype.slice.call(me.query);
            me.processScroll();
        },
        /**
         * @method init
         * @description initialize lazy load
         */
        init : function(params){
            params = params||{};
            this.scrollInterval = params.scrollInterval||0;
            var me = CLazyLoad;
            this.count = me.query.length;
            // Array.prototype.slice.call is not callable under our lovely IE8
            me.images = Array.prototype.slice.call(me.query);
            //for (i = 0; i < count; i++) {
            //    me.images.push(me.query[i]);
            //};
            me.processScroll();
            W.addEventListener('scroll', function () {
                // setTimeout(function(){
                    me.interval =  requestAnimationFrame(me.processScroll);
                // },1500);
                
            });
        }
    };
    W.CLazyLoad = CLazyLoad;

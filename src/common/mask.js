/**
 * Created by yangfei on 2015/12/1.
 */

 var mask = {
    el: document.createElement('div'),
    isHide: true,
    render: function(){
        this.el.id = 'diary-mask';
        this.el.className = 'mask';
        var body = document.getElementsByTagName('body')[0];
        if (document.getElementById('diary-mask')){
            return  this;
        }
        body.appendChild(this.el);
    },
    show: function(){
        if (!this.isHide){
            return this;
        }
        this.isHide = false;
        this.el.style.display = 'block';
        return this;
    },
    hide: function(){
        if (this.isHide){
            return this;
        }
        this.isHide = true;
        this.el.style.display = 'none';
        return this;
    }
};

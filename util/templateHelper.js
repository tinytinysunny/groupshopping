var stats = require('./stats.json');

module.exports={
    encodeUri:function (name) {
        return encodeURI(name);
    },
	compare: function (left, operator, right, options) {
        if (arguments.length < 3) {
            throw new Error('Handlerbars Helper "compare" needs 2 parameters');
        }
        var operators = {
            '==': function (l, r) {
                return l == r;
            },
            '===': function (l, r) {
                return l === r;
            },
            '====': function (l, r) {
                return l === r;
            },
            '!=': function (l, r) {
                return l != r;
            },
            '!==': function (l, r) {
                return l !== r;
            },
            '<': function (l, r) {
                return l < r;
            },
            '>': function (l, r) {
                return l > r;
            },
            '<=': function (l, r) {
                return l <= r;
            },
            '>=': function (l, r) {
                return l >= r;
            },
            'typeof': function (l, r) {
                return typeof l == r;
            }
        };

        if (!operators[operator]) {
            throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
        }

        var result = operators[operator](left, right);
    
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    unDash:function(productId){
    	return productId.replace(/-/g,'');
    },
    convertListUrl:function(oldUrl){
        if(oldUrl==undefined || oldUrl == ""){
          return oldUrl;
        }

        if(oldUrl.indexOf('_n_')>-1){
          return oldUrl.replace("_o.","_l.");
        }

        if(oldUrl.indexOf("/shangou/")>-1){
          return oldUrl.replace("original","lists").replace("_o.","_ls.");
        }

        if(oldUrl.indexOf("/product/")>-1){
          return oldUrl.replace("original","list").replace("_o.","_l.");
        } 

        if(oldUrl.indexOf("/listb/")>-1){
        return oldUrl.replace("listb","lists").replace("_o.","_ls.");
        } 

        if(oldUrl.indexOf("/list/")>-1){
          return oldUrl.replace("list","lists").replace("_o.","_ls.");
        } 

        return oldUrl.replace("_o.","_ls.").replace("_lb","_ls.").replace("_l.","_ls.");
    }
}
function _ajax(params) {
    var params = params || {};
    if(typeof params.config === 'undefined') throw new Error('set "config" before request');
    $.ajax(params.config)
    .done(function(data) {
        if(typeof params.doneCB === 'function') {
            params.doneCB(data);
        }
    })
    .fail(function(jqXHR, textStatus, err) {
        if(typeof params.failCB === 'function') {
            params.failCB(jqXHR, textStatus, err);
            return;
        }
        // alert('操作失败，请稍候重试。');
        new Error(err);
    })
    .always(function(dataOrJqXHR, textStatus, jaXHROrErr) {
        if(typeof params.alwaysCB === 'function') {
            params.alwaysCB(dataOrJqXHR, textStatus, jaXHROrErr)
        }
    });
}
module.exports = _ajax;
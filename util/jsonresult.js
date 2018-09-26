function JsonResult(obj) {

    obj = obj || {};

    return {
        Success: obj.Success || true,
        Bcode: obj.Bcode || 0,
        Code: obj.Code || 0,
        Msg: obj.Msg || '',
        Data: obj.Data || []
    }
}
module.exports = JsonResult;
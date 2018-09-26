export default function wxAppRouter (targetUrl,curUrl){
  // 小程序跳转商品详情页
  if(targetUrl.indexOf('item/page/index') >-1) {
    let compts = targetUrl.match(/item\/page\/index\/(.*)/)
    let productId = compts.length > 1 && compts[1]
    if (productId) {
      return `../item/item?productId=${productId}`
    }
	}

  if(targetUrl.indexOf('tuan/list') >-1) {
		return '../list/list'
	}

	if(targetUrl.indexOf('tuan/detail') >-1) {
		if(curUrl.indexOf('tuan/detail')>-1) {
			return false
		}
		return '../detail/detail'
	}

	if(targetUrl.indexOf('tuan/group') >-1) {
		return '../group/group'
	}

	if(targetUrl.indexOf('tuan/mylist') >-1) {
		// if(curUrl.indexOf('tuan/list')>-1) {
		return false
		// }
		// return '../mylist/mylist'
	}

	if(targetUrl.indexOf('tuan/nextlist') >-1) {
		return '../nextlist/nextlist'
	}

	if(targetUrl.indexOf('tuan/rule') >-1) {
		return '../rule/rule'
	}
	if(targetUrl.indexOf('order/page/index') >-1) {
		return '../order/order'
	}
	if(targetUrl.indexOf('order/page/result') >-1) {
		return '../result/result'
	}
	if(targetUrl.indexOf('item/page/list') >-1) {
		return '../evaluation/evaluation'
	}

	return false
 }

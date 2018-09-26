export function wxAppRouter(targetUrl,curUrl){ 
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

	if(targetUrl.indexOf('item/page/index') >-1) {
		return '../item/item'
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
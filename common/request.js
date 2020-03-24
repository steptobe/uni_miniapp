/**
 * 封装的promise
 * 参数： requestObj 请求成功回调
 */
const apiUrl = 'https://tenantdev.anhuaauto.com/api'; //开发环境
// const apiUrl = 'https://tenanttest.anhuaauto.com/api';//测试环境
// const apiUrl = 'https://tenant.anhuaauto.com/api'; //生产

const header = function(isForm) {
	return {
		"Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json"
	}
};

const tokenHeader = function(isForm) {
	return uni.getStorageSync('token') ? Object.assign(header(isForm), {
		"token": `${uni.getStorageSync('token')}`
	}) : header(isForm);
};
const promiseRequest = function(requestObj, header = {}) {
	// console.log(9999, requestObj.data)
	let that = this;
	return new Promise((resolve, reject) => {
		//网络请求
		wx.request({
			url: apiUrl + requestObj.url,
			method: requestObj.method || 'get',
			header: header ? Object.assign(header, tokenHeader(requestObj.isForm)) : tokenHeader(requestObj.isForm),
			data: JSON.stringify(requestObj.data),
			success: function(res) { //返回取得的数据
				let promiseQueue = getApp().globalData.promiseQueue;
				if (res.data.code == 200) {
					if (requestObj.resolve) { //如果是promise队列中的请求。
						requestObj.resolve(res.data);
						let promiseQueueItem = promiseQueue.shift();
						if (getApp().globalData.exeQueue) { //如果队列可执行则循环队列，保持队列只被循环一次。
							getApp().globalData.exeQueue = false; //防止被多次循环。
							while (promiseQueueItem) {
								promiseRequest(promiseQueueItem);
								promiseQueueItem = promiseQueue.shift();
								getApp().globalData.promiseQueue = promiseQueue;
							}
							if (!promiseQueueItem) {
								getApp().globalData.exeQueue = true;
								getApp().globalData.needBeginLogin = true;
							}
						}
					} else {
						resolve(res.data);
					}
				} else if (res.data.code == 401) { //token失效，重新调用login换取token
					requestObj.resolve = resolve;
					promiseQueue.push(requestObj); //请求失败了，把该请求放到promise队列，等待更新token后重新调用。
					if (!getApp().globalData.needBeginLogin) { //如果不需要重新登录
						return;
					}
					//防止重复调用login
					getApp().globalData.needBeginLogin = false;
					login(() => { //获取完token以后执行回调
						//重新登陆以后调用一次队列中的promise；并设置队列为可循环状态。
						let promiseQueueItem = promiseQueue.shift();
						if (promiseQueueItem) {
							getApp().globalData.exeQueue = true;
							promiseRequest(promiseQueueItem);
							getApp().globalData.promiseQueue = promiseQueue;
						}
					}, true)
				} else {
					wx.hideLoading()
					uni.showToast({
						icon: 'none',
						title: res.data.msg
					});
					reject(res.data);
				}
			},
			error: function(e) {
				wx.hideLoading()
				reject(e);
			}
		})
	});
};
/**
 * 登录校验，获取token
 * successCb 获取用户信息成功回调
 */
const login = function(successCb) {
	let that = this;
	wx.login({
		success: function(res) {
			console.log('code:',res.code)
			let requestObj = {
				url: `/crm-anhua/wxapi/carMember/login?code=${res.code}&appId=wx4dba286177d297a3&tenantId=000001`,
				method: 'get'
			}
			promiseRequest(requestObj).then(res => {
				if (res.code == 200) { // 成功获取useInfo保存起来。
					uni.setStorageSync('token', res.data.token)
					uni.setStorageSync('openid', res.data.openid)
					successCb && successCb()
				} else {
					wx.hideLoading()
					wx.showModal({
						title: '提示',
						content: res.msg || '网络错误！',
						showCancel: false
					})
				}

			}).catch((errMsg) => {
				wx.hideLoading()
				console.log(errMsg); //错误提示信息
			});
			wx.hideLoading()
		}
	})
}
export default promiseRequest

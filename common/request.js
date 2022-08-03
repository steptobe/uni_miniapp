/**
 * 封装的promise
 * 参数： requestObj 请求成功回调
 */

 import apiUrl from './baseUrl.js'
 import { dateFormat } from '@/utils/util.js'
 import stringify from '@/utils/json.js'
 import store from '@/store/index'
 import md5 from 'md5'
 
 const  globalData  = getApp().globalData
 
 const whiteUrl = ['/crm-anhua/wxapi/carMember/login']
 
 function waitTokenChange(obj) {
   if (whiteUrl.find((url) => obj.url.includes(url))) {
	 return true
   }
 
   if (globalData.isLogging) {
	 // 如果正在更换token，则返回Promise等待更换完token再执行后续接口
	 return new Promise((res) => globalData.promiseQueue.push(res))
   }
 
   return true
 }
 
 // 登陆后执行请求队列
 export function exeReqeustQueue() {
   globalData.isLogging = false
   globalData.promiseQueue.forEach((cb) => cb())
 }
 
 const wxLog = wx.getRealtimeLogManager()
 
 const headerObj = { ahDeviceId: '' }
 uni.getSystemInfo({
   success: (result) => {
	 headerObj.ahDeviceId = `${result.brand};${result.model};${result.system};${result.platform};${result.SDKVersion}`
   }
 })
 
 const header = function (isForm) {
   return {
	 ...headerObj,
	 'Content-Type': isForm
	   ? 'application/x-www-form-urlencoded'
	   : 'application/json'
   }
 }
 // 打签名
 const setSignRequest = function (requestObj) {
   const now = dateFormat(new Date(), 'yyyyMMddhhmmss')
   const secret = 'AnHua@MEMBERMINIAPP?2020!70c3b167DFHERH5fac67@AH!'
   let isSign = isSignRequest(requestObj.url)
   if (!isSign) {
	 return {}
   }
 
   let newData = stringify(requestObj.data, function (a, b) {
	 return a.key < b.key ? -1 : 1 //
   })
 
   let sign = md5(secret + now + newData)
   let str = JSON.stringify({ sign: sign, time: now })
   return isSign ? { head: str } : {}
 }
 
 // 
 const isSignRequest = function (requestUrl) {
   return [
   ].includes(requestUrl)
 }
 
 const tokenHeader = function (requestObj) {
   return uni.getStorageSync('token')
	 ? Object.assign(
		 header(requestObj.isForm),
		 {
		   token: `${uni.getStorageSync('token')}`,
		   sessionId: `${uni.getStorageSync('openid')}`
		 },
		 setSignRequest(requestObj)
	   )
	 : header(requestObj.isForm)
 }
 
 const promiseRequest = async function (requestObj, header = {}) {
   await waitTokenChange(requestObj)
 
   return new Promise((resolve, reject) => {
	 //网络请求
	 const requestData = {
	   url: apiUrl + requestObj.url,
	   method: requestObj.method || 'get',
	   header: Object.assign(header, tokenHeader(requestObj)),
	   data: requestObj.data,
	   success: function (res) {
		 if (typeof res.data !== 'object') {
		   uni.showToast({
			 icon: 'none',
			 title: res.data
		   })
		   reject(res.data)
		   return
		 }
 
		 //返回取得的数据
		 if (res.data.code == 200) {
		   resolve(res.data)
		 } else if (res.data.code == 401) {
		   if (!globalData.isLogging) {
			 store.dispatch('login')
		   }
 
		   return promiseRequest(requestObj, header)
		 } else if (res.data.code == 10204) {
		   uni.showToast({
			 icon: 'none',
			 title: res.data.msg
		   })
		   reject(res.data)
		   // 去授权
		   setTimeout(() => {
			 uni.navigateTo({
			   url: '/pagesB/authorization/authorization'
			 })
		   }, 2000)
		 } else if (res.data.code == 400 && res.data.msg == '门店不存在') {
		   uni.redirectTo({
			 url: '/pages/store/store'
		   })
		   reject(res.data)
		 } else {
		   uni.showToast({
			 icon: 'none',
			 title: res.data.msg
		   })
		   reject(res.data)
		 }
	   },
	   fail: function (e) {
		 console.log(e)
		 wx.hideLoading()
		 wxLog.error('request error', e.errMsg)
		 reject(e)
	   }
	 }
	 wxLog.info('request', requestData)
	 uni.request(requestData)
   })
 }
 export default promiseRequest
 
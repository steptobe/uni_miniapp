<script>
	import request from './common/request.js'
	export default {
		globalData: {
			exeQueue: true,
			promiseQueue: [],
			needBeginLogin: true
		},
		onLaunch: function() {
			console.log('App Launch')
			if (uni.getStorageSync('token')) {
				console.log('check valid time')
				uni.checkSession({
					fail() {
						uni.login({
						  provider: 'weixin',
						  success:  function (res) {
							  
						  }
						});
					},
					success() {
						console.log('is valid')
					}
				})
			} else {
				console.log('has no token')
				uni.login({
				  provider: 'weixin',
				  success:  function (res) {
					 
				  }
				});
			}
			this.$store.dispatch('authorizeStatus');
		},
		onShow: function() {
			console.log('App Show')
			this.$store.dispatch('authorizeStatus');
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import "colorui/main.css";
	@import "colorui/icon.css";
	/*每个页面公共css */
	@import "./common/app.css";
</style>

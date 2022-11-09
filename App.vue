<script>
	export default {
		onLaunch: function() {
			// uni.hideTabBar({
			// 	success: function(res){
			// 		console.log(res);
			// 	},fail(res) {
			// 		console.log(res);
			// 	}
			// });
			this.globalData.sysinfo = uni.getSystemInfoSync();
			// console.log('App Launch')
			this.globalData.statusBarHeight = this.globalData.sysinfo.statusBarHeight;
			this.globalData.navHeight = this.globalData.sysinfo.statusBarHeight;
			this.globalData.config.menu = [
				{
					"icon":"icon-favorites-fill",
					"txt": "首页",
					"active": 1,
					"link": "/pages/index/index"
				},{
					"icon":"icon-bussiness-man-fill",
					"txt":"我的",
					"link": "/pages/user/user"
				}
			];
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData:{
			appname: 'dome fish',
			deviceid: null,
			sysinfo: {},
			statusBarHeight:0,// 状态导航栏高度
			navHeight: 0,// 总体高度
			navigationBarHeight: 0,// 导航栏高度(标题栏高度)
			config: {},
			getMenu: function(){
				return this.config['menu'];
			}
		}
	}
</script>

<style lang="scss">
	// /*每个页面公共css */
	// @import '@/uni_modules/uni-scss/index.scss';
	// /* #ifndef APP-NVUE */
	// @import '@/static/customicons.css';
	// // 设置整个项目的背景色
	// page {
	// 	background-color: #f5f5f5;
	// }

	// /* #endif */
	// .example-info {
	// 	font-size: 14px;
	// 	color: #333;
	// 	padding: 10px;
	// }
	@import url("~@/static/css/default.css");
	@import url("~@/static/css/googlefont.css");
	@import url("~@/static/css/iconfont.css");
</style>

<template>
	<view>
		<tabBar></tabBar>
		<view @click="logout">退出</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			logout: function(){
				this.req.logout();
				// uni.switchTab({
				// 	url:"../home/home"
				// });
			}
		},
		onLoad() {
			uni.hideTabBar();
		}
	}
</script>

<style>

</style>

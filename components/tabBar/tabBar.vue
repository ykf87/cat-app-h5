<template>
	<view class="tabBar flex v c" :style="'background:' + bg + ';height: '+height+'px;'">
		<view v-for="(item, index) in list" :key="index" :class="'flex1' + (item.active == 1 ? ' active' : '')" @click="switchs(index)">
			<view :class="'iconfont ' + item.icon"></view>
			<view class="txt">{{ item.txt }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"tabBar",
		data() {
			return {
				idx: 0
			};
		},
		props: { //此处定义传入的参数
			bg: {
				type: String,
				default:"rgba(255,255,255,0.4)"
			},
			bs:{
				type:String,
				default:"0 -10px 35px #cccccc"
			},
			br:{
				type:String,
				default:"15px 15px 0 0"
			},
			height:{
				type:String,
				default:"40"
			},
			list: {
				type: Array,
				default: () => getApp().globalData.getMenu()
			}
		},
		methods:{
			switchs: function(index){
				var that 	= this;
				var tabs 	= this.list;
				for(var i in tabs){
					if(i == index){
						this.list[i]['active'] = 1;
					}else{
						this.list[i]['active'] = 0;
					}
				}
				uni.switchTab({
					url:this.list[index].link,
					fail(res) {
						console.log('no', res);
					},
					success(res) {
						that.idx = index;
					}
				})
			}
		}
	}
	
</script>

<style>
.tabBar{
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 99;
	width: 100vw;
	overflow: visible;
	/* border-top: solid 1px #e0e0e0; */
}
.tabBar > .flex1 > .iconfont{
	font-size: 40rpx;
}
.tabBar > .flex1 > .txt{
	font-size: 20rpx;
}
.tabBar .active > *{
	color: red;
	font-weight: bold;
}
</style>

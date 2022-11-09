<template>
	<view>
		<view class="mores flex c v" v-if="status > 0">
			<text class="iconfont icon-loading loading" v-if="status == 1"></text>
			<text>{{text}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name:"more",
		data() {
			return {
				
			};
		},
		props:{
			status: {
				type:Number,
				default:0
			},
			text:{
				type:String,
				default:"加载中..."
			},
		}
	}
</script>

<style>
.mores{
	margin-top: 10rpx;
}
</style>

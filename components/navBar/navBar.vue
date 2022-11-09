<template>
	<view>
		<view class="navBar" :style="'height:'+(height)+'px;'"></view>
		<view class="jnbar flex v" :style="'height:' + (jn > 0 ? jn + 'px' : (backs ? '30px' : '0px')) + ';background-color:'+(bgc ? bgc : 'transparent')+';color:' + color">
			<view v-if="backs" @click="backto();" class="back-btn flex v">
				<text class="iconfont icon-back"></text>
			</view>
			<view class="flex1 flex v c text" v-if="text">{{text}}</view>
		</view>
	</view>
</template>
<script>
export default {
	name:"navBar",
	data() {
		return {
			
		};
	},
	props: {
		height:{
			type: Number,
			default: getApp().globalData.statusBarHeight
		},
		jn:{
			type:Number,
			default:getApp().globalData.navigationBarHeight
		},
		backs:{
			type:String,
			default:""
		},
		text:{
			type:String
		},
		bgc:{
			type:String
		},
		color: {
			type:String,
			default: '#aaaaaa'
		}
	},
	methods:{
		backto: function(){
			uni.navigateBack()
		}
	}
}
</script>

<style>
.navBar{
	width: 100%;
	/* display: inline-block; */
}
.back-btn{
	padding: 20rpx 15rpx;
	position: relative;
	z-index: 9;
}
.back-btn > .iconfont{
	font-size: 30rpx;
}
.jnbar{
	position: relative;
	font-size: 24rpx;
	/* padding-top: 16rpx; */
}
.jnbar .text{
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	text-align: center;
	font-size: 30rpx;
}
</style>

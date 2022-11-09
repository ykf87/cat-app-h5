<template>
	<view class="content">
		<view class="flex main" style="flex-direction: column;">
			<navBar></navBar>
			<view class="flex v toper">
				<view class="iconfont icon-arrow-left" style="margin:10px 0;font-size: 40rpx;font-weight:blod;" @click="back"></view>
				<view class="flex1">
					<view class="iconfont icon-scanning" style="float: right;margin:10px 0;font-size: 35rpx;font-weight:blod;" @click="scanlogin"></view>
				</view>
			</view>

			<form class="form" style="width: 70%;margin: 0 auto;margin-top: 150px;">
				<view class="row">
					<input class="uni-input" type="number" name="phone" placeholder="填写手机号" maxlength="11" focus="true" @input="phoneinput" :value="phone" />
				</view>
				<view class="row">
					<input class="uni-input" password="true" name="password" placeholder="输入密码" @input="pwdinput" />
				</view>
				<view class="submit" @click="login">登录</view>
			</form>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				phone: '',
				password: ''
			}
		},
		onLoad() {
			var phone 	= this.storage.get('phone');
			if(phone){
				this.phone 	= this.aes.decrypt(phone);
			}
		},
		methods: {
			back: function(){
				uni.navigateBack();
			},
			scanlogin: function(){
				
			},
			login: function(){
				if(!this.phone){
					uni.showModal({
						title:'请填写电话'
					});
					return false;
				}
				if(!this.password){
					uni.showModal({
						title:'请填写密码'
					});
					return false;
				}
				var that = this;
				this.req.post('login', {'phone': this.phone, 'password': this.password}, function(res){
					if(res.code != 200){
						uni.showToast({
							title:res.msg,
							icon:"error"
						});
						return false;
					}
					that.storage.set('user', res.data.user);
					setTimeout(function(){
						that.back();
					},300);
				});
			},
			phoneinput: function(event){
				var val 	= event.target.value;
				if(val){
					this.storage.set('phone', this.aes.encrypt(val, false, false, true));
				}else{
					this.storage.del('phone');
				}
				this.phone 	= val;
			},
			pwdinput: function(event){
				this.password = event.target.value;
			}
		}
	}
</script>

<style>
.toper{
	color: #777;
}
.submit{
	text-align: center;
	margin-top: 50px;
	padding: 10px 0;
	background-color: darkseagreen;
	color: #f0f0f0;
	border-radius: 5px;
	box-shadow: 6px 5px 5px #ccc;
	font-size: 28rpx;
}
.content{
	background-color: #f0f0f0;
	min-height: 100vh;
}
.cccolor{
	color: cornflowerblue;
}
.main{
	width: 96%;
	margin: 0 auto;
}
.row{
	border: solid 1px #ddd;
	padding: 8px 13px 6px;
	background-color: #fff;
	margin-top: 20px;
}
.row input{
	height: 24px;
	line-height: 24px;
	font-size: 14px;
	padding: 0;
	flex: 1;
}

.logo{
	margin-top: 200rpx;
	font-family: Oswald;
	font-weight: bold;
	font-size: 60rpx;
}
.sayhi{
	color: #21225c;
	font-family: Fjalla One;
	margin-top: 110rpx;
	font-size: 36rpx
}
.tips{
	margin-top: 16rpx;
	color: #666666;
	font-size: 32rpx;
	text-decoration: 10px;
	margin-bottom: 70rpx;
}

.forms{
	margin-top: 170rpx;
}
.pl{
	font-family: "Markazi Text";
	font-size: 30rpx;
}
.iipt{
	border-bottom: solid 1px #f0f0f0;
	margin-top: 30rpx;
	padding: 6rpx 12rpx 0;
	font-size: 36rpx;
}
.acbt{
	margin-left: 12rpx;
}
.btns{
	margin-top: 20rpx;
}
.btn{
	max-width: 200rpx;
	text-align: center;
	padding: 14rpx 0rpx 9rpx;
	background-color: rgba(227,217,252,.8);
	border-radius: 20rpx;
}

.tps > *{
	display: inline-block;
}
</style>

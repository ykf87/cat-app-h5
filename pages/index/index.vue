<template>
	<view class="main">
		<navBar></navBar>
		<view>
			<view class="ips flex v">
				<view class="flex1 flex v">
					<picker @change="bindPickerChange" :value="index" :range="types">
						<view class="uni-input" style="font-size: 20rpx;">{{types[index]}}</view>
					</picker>
				</view>
				<view class="iconfont icon-map"></view>
				<view>{{ ip }}</view>
				<view>({{ country }})</view>
				<view v-if="!lockip" class="iconfont icon-unlock-fill" style="color: #666;margin-left: 4rpx;" @click="lockipf"></view>
				<view v-else class="iconfont icon-mima" style="color: #666;margin-left: 4rpx;" @click="unlockip"></view>
			</view>
			<view class="flex v" style="margin: 5px 15px;">
				<view class="flex flex1 v">
					<text>悬浮窗:</text>
					<switch color="#FFCC33" :checked="this.floaty" @change="changefloaty" style="transform:scale(0.7)" /><!-- disabled -->
				</view>
				<view class="flex flex v">
					<text>权限:</text>
					<switch color="#FFCC33" :checked="this.permission" @change="changePermission" style="transform:scale(0.7)" />
				</view>
			</view>
			<view class="flex" style="margin: 0 10%;">
				<view v-if="numeric>0" class="flex1 numeric active">{{ numeric }}</view>
				<view class="flex1 numeric" v-else>0</view>
			</view>
			
			<!-- <view class="connect-btn">{{btnTxt}}</view> -->
			<view :class="'connect-btn ' + btnStatus[btnStatu]['class']" @click="btnFunc">
				{{ btnStatus[btnStatu]['txt'] }}
			</view>
			<view style="margin: 15px;" class="flex v">
				<view class="flex1"></view>
				<view v-if="conntime" class="flex v">
					<view>连接时间:</view>
					<view> {{conntime}}</view>
				</view>
			</view>
		</view>
		<tabBar></tabBar>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				href: 'https://uniapp.dcloud.io/component/README?id=uniui',
				permission: false,
				floaty: false,
				isfff: false,//是否有加载onload
				reconntime: 10000,
				reconnadd: 10000,				
				numeric: 0,//本机编号
				ip: null,//本机ip
				country: null,//ip所属国家
				iso: null,//ip所属国家iso
				index: 0,//选中的连接方式
				types: [//服务端连接方式
					'直  连 (反应快,网络要求高)',
					'轮  询 (反应慢.网络要求低)'
				],
				lockip: null,//ip锁定
				server: null,//服务器连接句柄
				conntime: '',//服务器连接时间
				brektime: '',//服务器断开时间
				brktimes: 0,//断线次数
				btnStatus: {
					locked: {remark: '当前ip和锁定ip不一致,请解锁 IP',txt: '请先解锁 IP', class: 'btn-ip-locked'},
					needlogin: {remark: '需要登录', txt: '请先登录', class: 'btn-notlogin', func: 'login'},
					waitconn: {remark: '等待手动连接服务器', txt: '连接服务器', class: 'btn-noconn', func: 'handstart'},
					connecting: {remark: '正在连接的状态', txt: '连接中...', class: 'btn-conning'},
					connected: {remark: '已连接状态,此时可以断开连接', txt: '断开连接', class: 'btn-success', func: 'handstop'}
				},
				btnStatu: 'waitconn',
				btnTxt: '开始连接',//连接按钮文本
				connected: false,//是否连接过,控制是否自动连接
			}
		},
		created() {
			window.callback = this.bridgecall;
		},
		onShow() {
			var that = this;
			this.robot.invoke('permission',{},function(res){
				that.permission = res == true ? true : false;
			});

			if(this.isfff == false){
				if(!this.req.islogin()){
					this.btnStatu = 'needlogin';
					if(this.server){
						this.stopd();
					}
					return false;
				}
				if(!this.server){
					this.btnStatu = 'waitconn';
				}else{
					this.btnStatu = 'connected';
				}
				var connectindex = this.storage.get('connectindex');
				if(connectindex){
					this.index 	= connectindex;
				}
				var connected = this.storage.get('connected');
				if(connected){
					this.connected 	= true;
				}

				if(this.checkLockIp() && !this.server){
					this.getapi();
				}
			}
			this.isfff = false;
		},
		onLoad() {
			var that = this;
			this.req.robot = this.robot;
			this.robot.invoke('info',{}, function(res){
				if(res){
					getApp().globalData.deviceid 	= res.deviceid;
					that.storage.set('token', res.token);
					that.storage.set('deviceid', res.deviceid);
				}
			});
			this.isfff = true;
			uni.hideTabBar();
			// this.req.logout();
			var that = this;

			var connectindex = this.storage.get('connectindex');
			if(connectindex){
				this.index 	= connectindex;
			}
			var connected = this.storage.get('connected');
			if(connected){
				this.connected 	= true;
			}

			//ws://192.168.0.154:11113/ws
			this.getResion();
		},
		methods: {
			bridgecall: function(msg){
				this.robot.callback(msg);
			},
			getResion: function(){
				var that = this;
				if(!this.country || !this.ip || !this.iso){
					this.api.getResion(function(res){
						that.country = res.data.country;
						that.ip = res.data.ip;
						that.iso = res.data.iso;
					
						if(that.lockip && that.lockip != res.data.ip){
							uni.showToast({
								title:'请先解锁',
								icon:'error'
							});
							that.btnStatu = 'locked';
							return;
						}
						if(that.checkLockIp()){
							that.getapi();
						}
					});
				}
			},
			checkLockIp: function(){
				var islockip = this.storage.get('lockip');
				if(islockip){
					this.lockip = islockip;
					if(this.lockip != this.ip){
						console.log(this.lockip, this.ip);
						uni.showToast({
							title:'请先解锁',
							icon:'error'
						});
						this.btnStatu = 'locked';
						return false;
					}
				}
				return true;
			},
			handstop: function(){
				this.storage.del('connected');
				this.connected = false;
				this.stopd();
			},
			handstart: function(){
				this.storage.set('connected', 1);
				this.connected = 1;
				this.getapi();
			},
			btnFunc: function(){
				var ffc = this.btnStatus[this.btnStatu];
				if(ffc['func']){
					var strfunc = 'this.' + ffc['func'] + '()';
					eval(strfunc);
				}
			},
			stopd: function(){
				console.log('停止成功!');
				if(this.server){
					this.server.stop();
				}
				this.numeric = 0;
				this.server = null;
				this.conntime = null;
				if(!this.req.islogin()){
					this.btnStatu 	= 'needlogin';
				}else{
					this.btnStatu = 'waitconn';
				}
			},
			getIdsandTxts: function(){
				var tkconfigs = null;//this.storage.get('tkbaseconf');
				if(!tkconfigs){
					var that = this;
					this.api.tkconf(function(res){
						if(res.code == 200){
							that.storage.set('tkbaseconf', res.data);
							that.robot.invoke('tkconf', {data: res.data});
							// uni.showToast({
							// 	title:JSON.stringify(res.data)
							// })
						}
					});
				}else{
					this.robot.invoke('tkconf', {data: tkconfigs});
				}
			},
			afterConn: function(){
				//获取设备对应的语言和id
				this.getIdsandTxts();

				this._msg.robot = this.robot;
				this.reconntime = 10000;
				//检查无障碍权限
				// this.robot.invoke('permission',{},()=>{});
				console.log('链接成功!');
				this.btnStatu = 'connected';
				this.conntime = new Date().Format("yyyy-MM-dd hh:mm:ss");//parseInt((new Date().getTime())/1000);
				// this.server.send('aaaaazzzzz');
				var user 		= this.storage.get('user');
				// console.log(user);
				if(user){
					this.numeric 	= user['num'];
				}
				
				this.server.send('{"type":"logsuccss"}');//连接后查询历史任务
				
				this._msg.server = this.server;
				this._msg.runqueue();//执行队列
				// this.server.send('{"type":"sign", "data": "werwer"}');
			},
			domessage: function(msg){
				if(!msg){
					return;
				}
				if(msg == 'ping'){
					if(this.server){
						this.server.send('pong');
					}
				}else if(msg == 'pong'){
					this.server.pongtime = parseInt((new Date().getTime())/1000);
					return;
				}
				try{
					console.log(msg);
					if(typeof(msg) == 'string'){
						msg = JSON.parse(msg)
					}
				}catch(e){
					console.log(e);
					return false;
				}
				
				console.log(msg, '------');
				if(msg.code == 401){
					this.stopd()
					return;
				}else if(msg.code != 200){
					var errmsg = msg.msg ? msg.msg : '错误';
					uni.showToast({
						title:errmsg,
						icon:"error"
					});
					return false;
				}
				
				
				// this.getResion();
				if(!this.checkLockIp()){
					console.log('IP地址检查失败,请确保网络正常');
					this._msg.report(-3, msg.data);
					uni.showToast({
						title:'IP地址检查失败,请确保网络正常',
						icon:"error"
					});
					return;
				}


				if(typeof(msg.data[0]) != 'undefined'){
					for(var i in msg.data){
						this._msg.start(msg.data[i]);
					}
				}else{
					if(typeof(msg.data['type']) != 'undefined'){
						if(msg.data.type == 'logout'){
							this.req.logout();
							return;
						}
					}
					this._msg.start(msg.data);
				}
			},
			login: function(){
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			getapi: function(callback){
				if(!this.req.islogin()){
					this.btnStatu = 'needlogin';
					if(this.server){
						this.stopd();
					}
					return false;
				}
				if(!this.permission){
					uni.showToast({
						title:'请先开启权限!'
					});
					return false;
				}

				if(this.connected == false){
					return;
				}
				if(this.server){
					return;
				}
				console.log('开始链接-----------');
				this.btnStatu = 'connecting';
				var that			= this;
				if(this.index == 0){
					var reconnTimes 	= 10;
					this.ws.connect('ws://'+this.req.addr+':11113/ws', function(wsobj){
						that.server = wsobj;
						callback && callback();
						that.afterConn();
					}, function(){//断线重连
						uni.showToast({
							title:'ws连接失败',
							icon:'error'
						});
						that.stopd();
						that.brktimes++;

						if(that.connected == 1){
							setTimeout(function(){
								that.getapi();
							}, that.reconntime);
							that.reconntime += that.reconnadd;
						}
					}, this.domessage, function(){
						that.stopd();
						if(that.connected == 1){
							setTimeout(function(){
								that.getapi();
							}, that.reconntime);
							that.reconntime += that.reconnadd;
						}
					});
				}else if(this.index == 1){
					this.api.connect('', function(obj){
						that.server = obj;
						callback && callback();
						that.afterConn();
					}, function(){
						uni.showToast({
							title:'轮询连接失败',
							icon:'error'
						});

						setTimeout(function(){
							that.getapi();
						}, that.reconntime);
						that.reconntime += that.reconnadd;
					}, this.domessage);
				}
			},
			bindPickerChange: function(e){
				if(this.index != e.detail.value){
					if(this.server){
						// this.server.stop(this.stopd);
						this.stopd();
					}
				}
				this.index = e.detail.value;
				this.storage.set('connectindex', this.index);
				this.getapi(function(){
					uni.showToast({
						title:'连接方式切换成功!'
					});
				});
			},
			lockipf: function(){
				if(this.ip){
					this.storage.set('lockip', this.ip);
					uni.showToast({
						title:'IP 锁定成功'
					});
					this.lockip = this.ip;
				}else{
					uni.showToast({
						title:'未获取到ip',
						icon:'error'
					})
				}
			},
			unlockip: function(){
				this.storage.del('lockip');
				uni.showToast({
					title:'解锁成功'
				});
				this.lockip = null;
				this.getapi();
			},
			changefloaty: function(e){
				var that = this;
				if(e.detail.value){
					this.robot.invoke('floaty',{open:true},function(res){
						that.floaty = res;
					});
				}else{
					this.robot.invoke('floaty',{open:false},function(res){
						that.floaty = res;
					});
				}
			},
			changePermission: function(e){
				var that = this;
				if(e.detail.value){
					this.robot.invoke('permission',{open:true},function(res){
						that.permission = res;
					});
				}else{
					this.robot.invoke('permission',{open:false},function(res){
						that.permission = res;
					});
				}
			}
		}
	}
Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
}
</script>

<style>
.main{
	/* background-color: darkseagreen; */
	min-height: 100vh;
	width: 100vw;
	overflow-x: hidden;
}
.ips{
	margin: 4% 5% 0;
	font-size: 20rpx;
}
.numeric{
	font-size: 400rpx;
	color: darkgrey;
	text-align: center;
	background-image: linear-gradient(45deg, #93a5cf 0%, #e4efe9 100%);
	-webkit-background-clip: text;
	color: transparent;
}
.numeric.active{
	background-image: linear-gradient(-20deg, #d558c8 0%, #24d292 100%);
}
.connect-btn{
	width: 80%;
	margin: 0px auto;
	text-align: center;
	padding: 20rpx 0;
	background-color: teal;
	color: white;
	border-radius: 6px;
	font-weight: bold;
}
.btn-ip-locked{
	background-color: darkgrey;
}
.btn-notlogin{
	background-color: steelblue;
}
.btn-noconn{
	background-color: cadetblue;
	background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	color: black;
}
.btn-conning{
	background-color: silver;
	background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
}
.btn-success{
	/* background-color: darkslategrey; */
	background-image: linear-gradient(to right, #00dbde 0%, #fc00ff 100%);
}
</style>

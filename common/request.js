import storage from "@/common/storage.js";
import CryptoJS from 'crypto-js';
var cache = storage.storage;
var Infos = uni.getSystemInfoSync();
var DOMAINADDR 	= '192.168.31.128';
var way = null;
const aes = {
	key: 'dr+3MA2gDtrxykEw',
	iv: '73LCuEWWWaD14WkS',
	encrypt: function(word, keystr, ivstr, noturlecode){
		if(!keystr){
			keystr = this.key;
		}
		if(!ivstr){
			ivstr = this.iv;
		}
	    var key  = CryptoJS.enc.Utf8.parse(keystr);
		var iv   = CryptoJS.enc.Utf8.parse(ivstr);
	    // var srcs = CryptoJS.enc.Utf8.parse(word);
	    var encrypted = CryptoJS.AES.encrypt(word, key, {
			iv:iv,
			mode:CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7});
		if(noturlecode == true){
			return encrypted.toString();
		}
	    return this.urlencode(encrypted.toString());
	},
	decrypt: function(word, keystr, ivstr){
		if(!keystr){
			keystr = this.key;
		}
		if(!ivstr){
			ivstr = this.iv;
		}
	    var key  = CryptoJS.enc.Utf8.parse(keystr);//
		var iv   = CryptoJS.enc.Utf8.parse(ivstr);
		// const restoreBase64 = word.replace(/\-/g,'+').replace(/_/g,'/');
		var restoreBase64=word.replace(/[\r\n]/g,'');
	
	    var decrypt = CryptoJS.AES.decrypt(restoreBase64, key, {
			iv:iv,
			mode:CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7});
	    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
	},
	urlencode: function(str) {  
	    str = (str + '').toString();   
	    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').  
	    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');  
	},
	clientInfo(encode, merge){
		var info = {
			"request": parseInt((new Date().getTime())/1000),
			"platform":Infos['platform'],
			"brand":Infos['brand'] ? Infos['brand'] : 'none',
			"model":Infos['model'],
			"id":cache.get('deviceid'),//Infos['deviceId'],
			"os":Infos['system']
		}
		if(merge){
			info = Object.assign({}, info, merge);
		}
		if(encode){
			return this.encrypt(JSON.stringify(info))
		}
		return info;
	}
}

const ws = {
	isconn: false,
	msgQueue: [],
	heart: null,
	pongtime: 0,
	connect: function(url, callback, errback, messback, serverclose){
		if(this.isconn == true){
			callback && callback(this);
			return;
		}
		var sign = aes.clientInfo(true);
		uni.connectSocket({
			url: url + '/' + sign + '?token=' + cache.get('_token'),
			header:{
				'sign': sign
			}
		});
		var that = this;
		uni.onSocketOpen(function (res) {
			that.isconn = true;
			for(var i in that.msgQueue){
				that.send(that.msgQueue[i]);
			}
			way = that;
			callback && callback(that);
			if(that.heart){
				clearInterval(that.heart);
			}
			that.heart = setInterval(function(){
				console.log('-------ping');
				var now = parseInt((new Date().getTime())/1000);
				if((now - this.pongtime) > 30000){
					uni.showToast({
						title:"网络超时",
						icon:"error"
					});
					that.stop(errback);
				}
				that.send('ping');
			}, 30000);
		});
		uni.onSocketError(function (res) {
			that.isconn = false;
			if(that.heart){
				clearInterval(that.heart);
			}
			console.log('断线了-------------');
			way = null;
			errback && errback();
		});
		uni.onSocketClose(function (res) {
			that.isconn = false;
			if(that.heart){
				clearInterval(that.heart);
			}
			way = null;
			// errback && errback();
			console.log('连接关闭');
			serverclose && serverclose();
		});
		uni.onSocketMessage(function (res) {
			if(res.data == 'ping' || res.data == 'pong'){
				return;
			}
			if(messback){
				if(typeof(res.data) == 'string'){
					try{
						res.data = JSON.parse(res.data);
					}catch(e){
						console.log(e);
						return
					}
				}
				messback({code: 200, data:res.data, msg: ''});
			}else{
				console.log('收到服务器内容：' + res.data);
			}
		});
	},
	stop: function(callback){
		uni.closeSocket();
		way = null;
		console.log('ws关闭');
		callback && callback();
	},
	send: function(msg, callback){
		if (this.isconn) {
			uni.sendSocketMessage({
				data: msg,
				success() {
					callback && callback()
				}
			});
		} else {
			this.msgQueue.push(msg);
		}
	}
}

const request = {
	robot: null,
	addr: DOMAINADDR,
	domain: 'http://192.168.31.128:17868/api/',
	loginuri: '/pages/login/login',
	info: null,
	keys: {//用户信息相关的存储key
		'token': '_token',
		'user': '_user',
		'lang': '_lang'
	},
	post(uri, data, callback, loading, header, errback){//发起post网络请求
		console.log(this.domain + uri);
		var headers = this.header(header);
		// console.log(headers);
		if(loading != false){
			uni.showLoading({
				title: 'loading...',
				mask: true
			});
		}
		var that = this;
		uni.request({
			url:this.domain + uri,
			method:"POST",
			dataType:"json",
			data: data,
			header: headers,
			success(res){
				that.success(res, callback)
			},fail(res){
				console.log(res);
				that.error(res, errback);
			}
		});
	},
	get(uri, callback, loading, header, errback){//发起get网络请求
		console.log(this.domain + uri);
		var headers = this.header(header);
		if(loading != false){
			uni.showLoading({
				title: 'loading...',
				mask: true
			});
		}
		var that = this;
		uni.request({
			url:this.domain + uri,
			method:"GET",
			dataType:"json",
			header: headers,
			success(res){
				that.success(res, callback)
			},fail(res){
				console.log(res);
				that.error(res, errback);
			}
		});
	},
	header(uh){//网络请求头部header数据封装
		var header = {
			'Content-Type': 'application/json',
			// 'user-agent': 'aaaaaa',
			'version': '100'
		};
		var lang = Infos['language'];//sys.get(this.keys['lang']);
		var token = cache.get(this.keys['token']);
		header['lang'] = lang ? lang : Infos.language;
		if(token){
			header['token'] = token;
		}
		header['allower']	= aes.clientInfo(true);
		return uh != 'undefined' ? Object.assign({}, header, uh) : header;
	},
	success(res, callback){//网络请求成功调用方法
		uni.hideLoading();
		switch(res.statusCode){
			case 200:
				var resp = res.data;
				if(resp.code == 401){
					uni.navigateTo({
						url:this.loginuri
					});
					return;
				}
				try{
					var token = resp.data.token;
					if(token){
						// console.log(token);
						if(this.robot){
							this.robot.invoke('token', {token: token});
						}
						cache.set(this.keys['token'], token, 604800);//token存储7天
					}
				}catch(e){}
				// console.log(resp);
				callback && callback(resp);
				break;
			case 401:
				uni.navigateTo({
					url:this.loginuri
				});
				break;
			case 404:
				console.log(res);
				break;
			case 403:
				uni.showToast({
					title: res.data,
					icon: "error"
				});
				break;
			default:
				callback && callback(resp);
				console.log(res);
		}
	},
	error(err, callback){//网络请求错误调用方法
		uni.hideLoading();
		this.msg("Error");
		callback && callback(err);
	},
	msg(str, ...args){//提示信息弹窗显示
		if(!str){
			return;
		}
		uni.showToast({
			title: str,
			icon:"error",
			duration:3000
		});
	},
	clearCache(){//清空除登录信息外的缓存
		var datas = {};
		for(var i in this.keys){
			datas[this.keys[i]] = {'v': cache.get(this.keys[i]), 't': cache.ttl(this.keys[i])};
		}
		uni.clearStorageSync();
		for(var j in datas){
			cache.set(j, datas[j]['v'], datas[j]['t']);
		}
	},
	getToken(){
		return cache.get(this.keys['token']);
	},
	islogin(){//判断是否登录
		return cache.get(this.keys['token']) ? true : false;
	},
	afterlogin(){//登录完成后的一些操作
		// uni.navigateBack();
		var that = this;
		this.get('user', function(res){
			if(res.code == 200){
				cache.set(that.keys['user'], res.data, 604800);
				uni.redirectTo({
					url:"/pages/user/user",
					fail: function(err){
						console.log(err);
					}
				})
			}
		}, true);
	},
	resetUserInfo(k, v){
		var user = cache.get(this.keys['user']);
		if(!user){
			user = {}
		}
		user[k] = v
		cache.set(this.keys['user'], user, 604800);
	},
	logout(){//退出登录
		if(way){
			var that = this;
			way.stop(function(){
				uni.removeStorageSync(that.keys['user']);
				uni.removeStorageSync(that.keys['token']);
			});
		}else{
			uni.removeStorageSync(this.keys['user']);
			uni.removeStorageSync(this.keys['token']);
		}
	},
	gotologin(){
		uni.navigateTo({
			url:"../login/login"
		})
	}
}

const api = {
	timer: null,
	isconn: false,
	pongtime: 0,
	end: 'report',
	messback: null,
	connect: function(uri, callback, errback, messback){
		this.messback = messback;
		var that = this;
		request.post('test', {}, function(res){
			if(res.code == 200){
				that.isconn = true;
				way = that;
				callback && callback(that);
				if(that.timer){
					clearInterval(that.timer);
				}
				that.timer = setInterval(function(){
					that.send({"type":"gettask"});
				}, 30000);
			}else{
				way = null;
				that.isconn = false;
				errback && errback();
			}
		}, false, null, function(res){
			way = null;
			that.isconn = false;
			errback && errback(res);
		});
	},
	login: function(){
		request.post('login', {});
	},
	getResion: function(callback){
		request.post('resion', {}, callback);
	},
	stop: function(callback){
		console.log('退出api');
		way = null;
		if(this.timer){
			clearInterval(this.timer);
		}
		if(this.isconn == true){
			request.post(this.end, {type: 'stop'}, function(){
				callback && callback();
			}, true, null, function(){
				callback && callback();
			});
		}
		this.isconn = false;
	},
	send: function(msg, callback){
		if(typeof(msg) == 'string'){
			msg 	= JSON.parse(msg);
		}
		console.log(msg);
		var that = this;
		if(this.isconn == true){
			request.post(this.end, msg, function(res){
				callback && callback(res);
				that.messback && that.messback(res);
			}, false);
		}
	},
	tkconf: function(callback){
		request.post('tkconf', {}, callback);
	}
}

export default{
	request,
	aes,
	ws,
	api
}
const storage = {
	get: function(key, callback){//callback 在不存在的情况下调用方法
		var val = uni.getStorageSync(key);
		if(val && typeof(val['val']) != 'undefined' && typeof(val['exp']) != 'undefined'){
			var now = Date.parse(new Date()) / 1000;
			if(val['exp'] <= now){
				uni.removeStorageSync(key)
			}else{
				return val['val'];
			}
		}
		callback && callback(key);
		return null;
	},
	set: function(key, val, timeout){
		if(!key){
			return null;
		}
		if(!timeout || timeout < 1){
			timeout = 86400 * 365*10;//一年
		}
		var sval = {val: val, exp:  (Date.parse(new Date()) / 1000) + timeout};
		return uni.setStorageSync(key, sval)
	},
	del: function(key){
		uni.removeStorageSync(key);
	},
	ttl: function(key){
		var val = uni.getStorageSync(key);
		if(val && typeof(val['val']) != 'undefined' && typeof(val['exp']) != 'undefined'){
			var now = Date.parse(new Date()) / 1000;
			return val['exp'] - now;
		}
		return 0;
	}
}

export default{
	storage
}
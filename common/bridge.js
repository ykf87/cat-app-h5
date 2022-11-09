window.Android = function() {
    let h5CallbackIndex = 1;
	let getJsBridgeFrame = () => {
		let ifid = 'jsBridgeFrame' + h5CallbackIndex;
		let bridgeFrame = document.getElementById(ifid);
		/** 判断是否存在，即使页面被删除了改frame，也可以动态增加 */
		if (!bridgeFrame) {
			bridgeFrame = document.createElement('iframe');
			bridgeFrame.id = ifid
			bridgeFrame.style = "display: none";
			document.body.append(bridgeFrame);
		}
		return bridgeFrame;
	};
    /** H5回调者维护 */
    const h5Callbackers = {};
    /** 注册回调函数 */
    let setCallback = (callback) => {
        let callId = h5CallbackIndex++;
        h5Callbackers[callId] = {"callback": callback};
        return callId;
    };
    /** 获取回调函数, 只能获取一次 */
    let getCallback = (callId) => {
        let callback = h5Callbackers[callId];
        if (callback) {
            delete h5Callbackers[callId];
        }
        return callback;
    };

    let invoke = (cmd, params, callback) => {
        let callId = null;
        try {
            let paramsStr = JSON.stringify(params);
            console.debug(`JavaScript请求调用安卓端: cmd=${cmd}, params=${paramsStr}`);
            callId = setCallback(callback);
            let jsBridgeFrame = getJsBridgeFrame();
			jsBridgeFrame.src = `jsbridge://${cmd}/${callId}/${encodeURIComponent(paramsStr)}`;
        } catch (e) {
            if (callId) {
                getCallback(callId);
            }
            console.trace(e);
        }
    };
    let callback = (data) => {
        /** data 格式为 {callId: Number, params: JSON} */
        let callId = data.callId;
        let params = data.params;            
        let callbackFun = getCallback(callId);
        console.debug(`安卓端回调JavaScript: callId=${callId}, params=${JSON.stringify(params)}, callback=${callbackFun}`);
        if (callbackFun) {
            callbackFun.callback(params);
        }
		
		
		let ifid = 'jsBridgeFrame' + callId;
		let bridgeFrame = document.getElementById(ifid);
		if (bridgeFrame) {
			bridgeFrame.src = 'about:blank';
			try{ 
				bridgeFrame.contentWindow.document.write(''); 
				bridgeFrame.contentWindow.document.clear(); 
			}catch(e){} 
			//把iframe从页面移除 
			bridgeFrame.parentNode.removeChild(bridgeFrame);
		}
    };
    window.dispatchEvent(new Event("bridgeinit"));
    return {invoke: invoke, callback: callback};
}();
const bridge = window.Android;
export default{
	bridge
}
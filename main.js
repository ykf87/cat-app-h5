import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

import storage from "@/common/storage.js"
Vue.prototype.storage = storage.storage;
import request from "@/common/request.js"
Vue.prototype.req = request.request;
// import ws from "@/common/ws.js"
Vue.prototype.ws = request.ws;
// import api from "@/common/api/api.js"
Vue.prototype.api = request.api;
Vue.prototype.aes = request.aes;

import bridge from "@/common/bridge.js"
Vue.prototype.robot = bridge.bridge;
window.Android = bridge.bridge;

import message from "@/common/message.js"
Vue.prototype._msg = message.msg;


const app = new Vue({
    ...App
})
app.$mount()
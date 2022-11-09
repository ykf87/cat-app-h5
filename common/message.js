const msg = {
	robot: null,
	server: null,
	queue: [],
	hangup: function(data){//挂起任务
		uni.showToast({
			title:'任务被挂起!',
			icon:"none"
		});
		//this.report(2);//上报任务被挂起
	},
	runqueue: function(){//执行队列任务
		//循环取队列,需要先将队列任务移出队列，再调用start方法执行
	},
	report: function(status, data){//上报任务状态或结果,status为任务状态,data为执行结果
		
	},
	start: function(data){//接收任务
		if(!data){
			return false;
		}
		if(typeof(data) == 'string'){
			data = JSON.parse(data); 	
		}
		if(typeof(data['type']) == 'undefined'){
			return;
		}
		uni.showToast({
			title:'收到任务',
			icon:"none"
		});
		if(typeof(data['data']) == 'string'){
			data['data'] = JSON.parse(data['data']);
		}
		if(!this.server){
			this.hangup(data);
			return;
		}
		//this.report(1);//上报任务开始执行
		data.data['path'] = 'tiktok';
		console.log(data.data);
		var res = this.robot.invoke(data['type'], data.data, function(res){
			alert(JSON.stringify(res));
		});
		this.report(1,res);
	}
}

export default{
	msg
}
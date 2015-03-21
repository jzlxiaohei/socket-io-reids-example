#socket.io-nodejs-redis笔记

------
###模型：

1. socket.io 包括server端和client端（一般是浏览器）

	server和client 建立链接后，以事件机制为核心，进行通信。对于一个已建立的链接，服务器和客户端可以认为是`对等`的。`建立链接后`，从代码上，看不出哪个是server端哪个是client端
	
		socket.emit(eventName1,data);
		socket.on(eventName2,function(data){})
		
2. redis的`pub/sub`机制,详见[文档](http://redis.io/topics/pubsub)

	有两个模式,对于不同的命令，一个是精确匹配，执行了`subscribe livenews` 的客户端只有`publish livenews xxx` 时，才会收到；一个是模式匹配，每个模式以 * 作为匹配符，`psubscribe livenews*`,那么当`publish` livenews.update,livenews.add都是能收到的。
	简单的试了一下，模式匹配的一下统计信息没发通过redis的命名很好的得到。建议使用`精确模式`
	
3. 流程：

		启动时：
		node:
			1.通过node_redis的客户端，订阅(subscribe）redis的livenews(其他名字也可以)
			2.通过socket.io，监听各个浏览器的连接事件
			
		运行时：
		reids: 通过各种方式（比如php客户端），向redis-server: publish livenews my-message
		
		node的redis 客户端收到订阅的内容，通过socket.io 给浏览器发送过去
		
		
4.代码
	
[传送门](https://github.com/jzlxiaohei/socket-io-reids-example/blob/master/index.js)

###测试

socket.io 的client端脚本有`forceNew:true`的参数，可以用来在一个页面，建立多个websocket链接，可以用了测试
	
	var sockets = []
	for(var i = 0;i<100;i++){
		var socket = io("/",{forceNew:true});
		socket.on("livenews",function(msg){console.log(msg)})
		sockets.push(socket)
	}
	//...other code ...


###容错

浏览器： 
	
	断线重连；
	重连多次后的降级；
	重连后可能错过了一些信息，如何判断，怎么补发
	
`待补充`


###其他：

1.编码问题，中文字符

2.socket.io有个adapter的概念，并且官方推荐使用[socket.io-redis](https://github.com/automattic/socket.io-redis),但是我觉得暂时没必要使用，`待讨论`


	



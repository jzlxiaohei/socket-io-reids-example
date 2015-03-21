var redis = require('redis');

/*
    webserver:有请求进来，就返回2个脚本，一个socket.io的client端脚本,一个默认链接

    注意forceNew:true,这样客户端每次都会重新建立链接而不是重用，这样可以编写测试脚本；生产环境不要用！！

*/
var app = require('http').createServer(function(req,res){
    var html = '<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>';
    html+='<script>var socket = io("/",{forceNew:true});socket.on("news",function(msg){console.log(msg)})</script>'
    res.end(html)
});

var io = require('socket.io')(app)

//等待有客户端链接进来
io.on('connection',function(socket){
    console.log('connected')

    socket.on('disconnect',function(){
        console.log('disconnected')
    })

    socket.on('client-message',function(data){
        //浏览器端，可以通过socket.emit('client-message','haha')
        // 把'haha'传到这里的data上
        console.log('get message from browser:'+data)
    })
})

//redis-client 监听message事件（redis的任意客户端publish 时，会向订阅了相应channel的其他客户端广播message事件）
var redisCli = redis.createClient({return_buffers:true});

redisCli.on('message',function(ch,msg){
    console.log(msg)
    io.emit('news',msg.toString())
})

//订阅socket.io频道
redisCli.subscribe('socket.io')

//启动服务，可以修改端口为3001等，多起一个实例，观看效果
app.listen(3000,'127.0.0.1')

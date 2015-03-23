var redis = require('redis');

/*
    webserver:有请求进来，就返回2个脚本，一个socket.io的client端脚本,一个默认链接

    注意forceNew:true,这样客户端每次都会重新建立链接而不是重用，这样可以编写测试脚本；生产环境不要用！！
*/
var app = require('http').createServer(function(req,res){
    console.log(req.url)
    var html = '<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>';
    if(req.url == '/calendar'){
        //html+='<script>var socket = io("/calendar",{forceNew:true});socket.on("news",function(msg){console.log(msg)})</script>'
        html+='<script>var socket = io.connect("http://localhost:3000/calendar");socket.on("news",function(msg){console.log(msg)})</script>'
    }else{
        html+='<script>var socket = io("/livenews",{forceNew:true,"reconnectionAttempts":3});socket.on("news",function(msg){console.log(msg)})</script>'
    }
    html+='<script>socket.on("reconnect_attempt",function(){console.log("recon attempt")})</script>'
    html+='<script>socket.on("disconnect",function(){console.log("disconnect")})</script>'
    html+='<script>socket.on("reconnect_error",function(){console.log("reconnect error")})</script>'
    html+='<script>socket.on("reconnect_failed",function(){console.log("reconnect failed")})</script>'
    res.end(html)
});

var io = require('socket.io')(app)

//等待有客户端链接进来
var livenews = io.of('/livenews')
    .on('connection',function(socket){
        console.log('livenews connected')
        socket.on('disconnect',function(){
            //console.log('disconnected')

            //watch
        })
    })

var calendar = io.of('/calendar').on('connection',function(socket){
    console.log('calender connected')
    socket.on('disconnect',function(){
        //console.log('disconnected')

        //watch
    })
})



//console.log(io.adapter());
//redis-client 监听message事件（redis的任意客户端publish 时，会向订阅了相应channel的其他客户端广播message事件）
var redisCli = redis.createClient({return_buffers:true});

redisCli.on('message',function(ch,msg){
    //console.log(msg)
    livenews.emit('news',msg.toString())
})

//订阅socket.io频道
redisCli.subscribe('socket.io')

redisCli.on('error',function(err){
    io.emit('error','has error')
    //console.log(err)
})
//启动服务，可以修改端口为3001等，多起一个实例，观看效果
app.listen(3000,'127.0.0.1')

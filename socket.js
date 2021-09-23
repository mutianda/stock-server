var express = require('express');
var app = express();
var server = app.listen(3003);
var io = require('socket.io').listen(server);

var webSocket = null
io.onlineUsers={}
io.sockets.on('connection', (socket) => {
    webSocket =socket
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.email;
        //检查在线列表，如果不在里面就加入
        io.onlineUsers[obj.email] = obj.id;
        //向所有客户端广播用户加入
        io.emit('login', 'welcome'+obj.email);
        console.log(obj.email+'加入了聊天室');
    });

    socket.on('message', message => {
        // 给客户端返回信息


    });
    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(io.onlineUsers.hasOwnProperty(socket.name)) {
            delete io.onlineUsers[socket.name];
            console.log(socket.name+'退出了聊天室');
        }
    });
});

function sendMessage(s,obj){
    const data = {
        ...obj,
        content:'hello'
    }
    io.emit('message', data);

}

module.exports=io;


var express = require('express');
var app = express();
var server = app.listen(3003);
var io = require('socket.io').listen(server);

var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
var webSocket = null
io.sockets.on('connection', (socket) => {
    webSocket =socket
    console.log('a user connected');
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;
        //检查在线列表，如果不在里面就加入
        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;
            //在线人数+1
            onlineCount++;
        }
        //向所有客户端广播用户加入
        io.emit('login', 'welcome'+obj.username);
        console.log(obj.username+'加入了聊天室');
    });
    socket.on('sentToS', message => {
        // 给客户端返回信息
        console.log(message)
        if(message =='hello'){
            io.send('hello too')
        }
        if(message=='你吃饭了吗'){
            io.send('吃过了')
        }
        if(message=='你叫什么名字'){
            io.send('我叫AI仿生物智能聊天师')
        }
        if(message =='hello'){
            io.send('hello too')
        }
        // io.emit('sendToC', message);
    });
    socket.on('message', message => {
        // 给客户端返回信息
        console.log(message)
        if(message =='hello'){
            io.send('hello too')
        }
        if(message=='你吃饭了吗'){
            io.send('吃过了')
        }
        if(message=='你叫什么名字'){
            io.send('我叫AI仿生物智能聊天师')
        }
        if(message =='hello'){
            io.send('hello too')
        }


    });
    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};
            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;
            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了聊天室');
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


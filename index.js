var conn=require("./mysql.js");
var fs  = require("fs");
var express = require('express');
var diBeiLi = require('./DiBeiLi.js')
var app = express();
const schedule = require('node-schedule');
var api = require('./api/api')
var socket = require("./socket.js");
var email = require('./api/email.js')

app.all('*', function(req, res, next) {             //设置跨域访问
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,X-Token,x-token,content-type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
const bodyParser = require('body-parser')

// json请求
app.use(bodyParser.json())
// 表单请求
app.use(bodyParser.urlencoded({extended: false}))
//配置服务端口
var server = app.listen(3002,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('listen at http://%s:%s',host,port)
})
function getTime() {
    let time = new Date()
    let y = time.getFullYear()
    let m = time.getMonth()+1>9?time.getMonth()+1:'0'+(time.getMonth()+1)
    let d = time.getDate()>9?time.getDate():'0'+time.getDate()
    let h = time.getHours()>9?time.getHours():'0'+time.getHours()
    let min = time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes()
    let s = time.getSeconds()>9?time.getSeconds():'0'+time.getSeconds()
    return {y,m,d,h,min,s}
}
function Result ({ code = 1, msg = '', data = '' }) {
    this.code = code;
    this.msg = msg;
    this.data = data;
}
module.exports = { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result}

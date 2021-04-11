var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs }  = require('./index')

var realTimePush = require('./modules/real-time/index.js')
require('./modules/common/index.js')
require('./modules/macd/index.js')
let login = true;
realTimePush()
// 每分钟的第30秒触发： '30 * * * * *'
//
// 每小时的1分30秒触发 ：'30 1 * * * *'
//
// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
//
// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
//
// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
//
// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
// 每个参数还可以传入数值范围:


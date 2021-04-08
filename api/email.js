
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '270947682@qq.com',
        pass: 'jaqhgkhkpmdfbjgi' //授权码,通过QQ获取

    }
});

module.exports=transporter

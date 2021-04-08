const http = require('http');

exports.get = function get(options){
    return new Promise((resolve,reject) => {

        let body = '';

        // 发出请求
        let req = http.request(options,(res) => {
            res.on('data',(data) => {// 监听数据
                body += data;

            }).on("end", () => {

                resolve(body);
            })
        });

        req.on("error",(e) => {
            console.log("HTTP ERROR >>",e)
            console.log("出错地址 >>",options)
            resolve('{}')
        });

        //记住，用request一定要end，如果不结束，程序会一直运行。
        req.end();
    });
}
exports.post =  function post(options,data) {
    // let options = {
    //     host: 'localhost',
    //     port: '7002',
    //     path: '/update',
    //     method: 'POST',
    //     headers:{
    //         "Content-Type": 'application/json',
    //         "Content-Length": data.length
    //     }
    // }

    return new Promise((resolve,reject) => {
        let body = '';
        let req = http.request(options,(res) => {
            res.on('data',(chuck) => {
                body += chuck;
            }).on('end', () => {
                resolve(JSON.parse(body))
            })
        });

        req.on('error',(e) => {
            reject(e)
            console.log("HTTP ERROR >>",options)
        });

        req.end();
    });

}

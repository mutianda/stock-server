var http = require('./http')
const time = new Date().getTime()

// 获取今天金额流入时间图
exports.getTodayMoneyKLine = (code)=>{

        let options = {
            host: 'http://push2.eastmoney.com',
            port: '',
            path:
            `http://push2.eastmoney.com/api/qt/stock/fflow/kline/get?lmt=0&klt=1&secid=${code}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63&ut=b2884a393a59ad64002292a3e90d46a5&cb=jQuery18304517040787755009_1589911572992&_=${time}`,
            method: 'GET',
            headers:{
                "Content-Type": 'application/json',
            }
        }
    return http.get(options.path)
}
// 获取今日所有股票涨幅
exports.getTodayRise = ()=>{

    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:
            `http://1.push2.eastmoney.com/api/qt/clist/get?cb=jQuery112405615909952215528_1589988388903&pn=1&pz=4000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:0+t:80,m:1+t:2,m:1+t:23&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152&_=${time}
`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}
// 根据t=30,5,15 ,60 分钟获取k线图
exports.getKLine = (code,t=101)=>{
    // http://99.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery11240714049099619908_1612674203498&secid=1.600584&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&klt=101&fqt=0&end=20500101&lmt=120&_=1612674203560
    // http://73.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112%204016380933432897637_1611585824587&secid=1.688037&ut=fa5fd1943c7b386f172d6893dbfb%20a10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf%2056%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&klt=101&fqt=0&end=20500101&lmt=120&_=1611585824%20665
    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:`http://99.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery11240714049099619908_1612674203498&secid=${code}&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&klt=${t}&fqt=0&end=20500101&lmt=120&_=1612674203560`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}
// 根据t=30,5,15 ,60 分钟获取k线图
exports.getShareDetail = (code,t=101)=>{
    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:`http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287,f292&secid=${code}&cb=jQuery1124003942208760573784_1617551277314&_=1617551277315
`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}

exports.getOneRecentLine = (code)=>{

    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:
            `http://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?lmt=0&klt=101&secid=${code}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65&ut=b2884a393a59ad64002292a3e90d46a5&cb=jQuery18301406819884565389_1590438562910&_=${time}
`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}

exports.getAllMoneyInfo = ()=>{

    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:
            `http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=4000&po=1&np=1&ut=b2884a393a59ad64002292a3e90d46a5&fltt=2&invt=2&fid0=f4001&fid=f184&fs=m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:7+f:!2,m:1+t:3+f:!2&stat=1&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124&rt=53035695&cb=jQuery18303592678106761895_1591070691750&_=
${time}
`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}
exports.getLhb = ()=>{

    let options = {
        host: 'http://push2.eastmoney.com',
        port: '',
        path:
            `http://data.eastmoney.com/DataCenter_V3/stock2016/jymx.ashx?pagesize=50&page=1&js=var%20SPoQylfq&param=&sortRule=-1&sortType=&gpfw=0&code=80131791&rt=26536148n
`,
        method: 'GET',
        headers:{
            "Content-Type": 'application/json',
        }
    }
    return http.get(options.path)
}
// http://83.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery11240057177188515603605_1607236779939&secid=0.002510&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&klt=101&fqt=0&end=20500101&lmt=1000000&_=1607236779967

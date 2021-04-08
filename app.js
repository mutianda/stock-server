var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs }  = require('./index')

var realTimePush = require('./modules/real-time/index.js')
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

    const getTodayRiseLx = ()=>{

        //每分钟的1-10秒都会触发，其它通配符依次类推
        schedule.scheduleJob('2  0/3 9-14 * * *', ()=>{
            let {m,d,h,min,s} = getTime()
            console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
            console.log('所有的今日信息')
            getTodayRise()
        })
    }
const getAllMoneyInfoLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('30  0/4 9-14 * * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的今日资金')
        conn('truncate money').then(res=>{
            getAllMoneyInfo()

        })

    })
}
// 获取所有股票今天的信息
// getTodayRiseLx()
// getAllMoneyInfoLx()
// 获取所有股票最近的信息
const getAllRecentLineLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('45 55 20  * * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的最近信息')
        conn('truncate recent').then(res=>{
            getAllRecentLine()

        })

    })
}

// 获取所有股票今天资金流入的信息

const getAllTodayMoneyKLineLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('4  1 19  * * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的今天资金流入')
        conn('truncate money_kline').then(res=>{
            getAllTodayMoneyKLine()

        })
    })
}

const getAllKLineLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 4 23    * * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')
        conn('truncate kline').then(res=>{
            getAllKLine()

        })
    })
}
// getAllTodayMoneyKLineLx()
// getAllRecentLineLx()
getAllKLineLx()


 function getAllShareCode() {
    const sql = "SELECT share_code FROM share"
    return new Promise((reslove,reject)=>{
        conn(sql).then( r => {
            if(r&&r.length>0){
                let arr = []
                r.forEach(item=>{
                    arr.push(item.share_code)
                })
                reslove(arr)
            }
        }).catch(e=>{
            reject(e,'eeeeee')
            }
        )
    })
}

async function getAllTodayMoneyKLine() {
    let res = await getAllShareCode()

    if(res.length){
        doTodayMoneyKLinePromise(0,res)
    }
}
function doTodayMoneyKLinePromise(n,list){
    let prom = []
    for(var i = 0;i<400;i++){
        let code = ''
        if(list[n+i]){
            let item = list[n+i]
            if(item[0]==6){
                code = '1.'+item
            }else {
                code = '0.'+item
            }
            prom.push(api.getTodayMoneyKLine(code))
        }
        // getTodayMoneyKLine(code)

    }
    if(prom.length){
        Promise.all(prom).then((resu)=>{
            console.log(resu.length);
            getTodayMoneyKLine(resu).then(res=>{
                if(n<list.length){
                    doTodayMoneyKLinePromise(n+800,list)
                }
            }).catch(e=>{
                console.log(e);
            })

        })
    }
}
function getTodayMoneyKLine(list){

    return new Promise((resolve,reject)=>{
        console.log('list'+list.length)
        let time = getTime()
        let sql2 = `INSERT INTO money_kline ( today_time , share_code, moneykl, share_name) VALUES `
        // moneykl,
        list.forEach((res,index)=>{
            if(res.length>400){

                let a = res.indexOf('(')
                let b =res.lastIndexOf(')')
                res = res.slice(a+1,b)

                const data =JSON.parse(res)
                let klines = JSON.stringify(data.data.klines)
                console.log('name'+data.data.name+'今日资金流入更新')
                const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
                if(index==0){
                    sql2+=`(${'\'' + today_time + '\''},${'\'' + data.data.code + '\''}, ${'\'' + klines + '\''},${'\'' + data.data.name + '\''} ) `


                }else {

                    sql2+=`, (${'\'' + today_time + '\''},${'\'' + data.data.code + '\''},${'\'' + klines + '\''},${'\'' + data.data.name + '\''} )`

                }
            }


        })

        conn(sql2).then(r2=>{
            resolve(r2)
            console.log(r2)

        }).catch(e=>{
                resolve(e)
                console.log(JSON.stringify(e).slice(0,400));
            }
        )

    })
}


async function getAllRecentLine() {
    let res = await getAllShareCode()
    let prom = []
    if(res.length){
        doAllRecentLinePromise(0,res)
    }
}
function doAllRecentLinePromise(n,list){
    let prom = []
    for(var i = 0;i<800;i++){
        let code = ''
        if(list[n+i]){
            let item = list[n+i]
            if(item[0]==6){
                code = '1.'+item
            }else {
                code = '0.'+item
            }
            prom.push(api.getOneRecentLine(code))
        }
        // getTodayMoneyKLine(code)

    }
    if(prom.length){
        Promise.all(prom).then((resu)=>{
            console.log(resu.length);
            getOneRecentLine(resu).then(res=>{
                if(n<list.length){
                    doAllRecentLinePromise(n+800,list)
                }
            })

        })
    }
}

function getOneRecentLine(list){

    return new Promise((resolve,reject)=>{
        console.log('list'+list.length)
        let time = getTime()
        let sql2 = `INSERT INTO recent ( today_time , share_code,  recent_list,share_name) VALUES `
        // moneykl,
        list.forEach((res,index)=>{
            if(res.length>400){
                let a = res.indexOf('(')
                let b =res.lastIndexOf(')')
                res = res.slice(a+1,b)
                const data =JSON.parse(res)
                let klines = JSON.stringify(data.data.klines)
                if(!data.data.klines){
                    console.log('没有近日信息更新'+res)
                }
                console.log('name'+data.data.name+'近日信息更新')
                const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
                if(index==0){
                    sql2+=`(${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + klines + '\''},${'\'' + data.data.name + '\''} )`


                }else {

                    sql2+=`, (${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + klines + '\''},${'\'' + data.data.name + '\''} )`

                }
            }
        })

        conn(sql2).then(r2=>{

            resolve(r2)
            console.log(r2)


        }).catch(e=>{
                resolve(e)
                console.log(JSON.stringify(e).slice(0,400));
            }
        )

    })

}



async function getAllKLine() {
    let res = await getAllShareCode()

    if(res.length){
        console.log('res')
        doAllKLinePromise(0,res)
    }
}
function doAllKLinePromise(n,list){
    let prom = []
    for(var i = 0;i<400;i++){
        let code = ''

        if(list[n+i]){
            let item = list[n+i]
            if(item[0]==6){
                code = '1.'+item
            }else {
                code = '0.'+item
            }
            prom.push(api.getKLine(code))
        }

        // getTodayMoneyKLine(code)
    }
    console.log('prom',prom.length)
    if(prom.length){
        Promise.all(prom).then((resu)=>{
            console.log(resu.length);
            getKLine(resu).then(res=>{
                if(n<list.length){
                    console.log('进行了n次',n)
                    doAllKLinePromise(n+400,list)
                }
            })

        })
    }
}
function getKLine(list){
    return new Promise((resolve,reject)=>{


        console.log('list'+list.length)
        let time = getTime()
        let sql2 = `INSERT INTO kline ( today_time , share_code,  kline,share_name) VALUES `
        // moneykl,
        list.forEach((res,index)=>{
            if(res.length>400){

                let a = res.indexOf('(')
                let b =res.lastIndexOf(')')
                res = res.slice(a+1,b)
                console.log('进行了一次')
                const data =JSON.parse(res)
                let klines = JSON.stringify(data.data.klines)
                console.log('name'+data.data.name+'k线更新')
                const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
                if(index==0){
                    sql2+=`(${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + klines + '\''},${'\'' + data.data.name + '\''} )`


                }else {

                    sql2+=`, (${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + klines + '\''},${'\'' + data.data.name + '\''} )`

                }
            }
        })

        conn(sql2).then(r2=>{
            resolve(r2)
            console.log(r2)

        }).catch(e=>{
                resolve(e)
                console.log(JSON.stringify(e).slice(0,400));
            }
        )

    })

}


function getAllMoneyInfo(){
    return new Promise((resolve ,reject)=>{


    api.getAllMoneyInfo().then(res=>{

        let a = res.indexOf('(')
        let b =res.lastIndexOf(')')
        res = res.slice(a+1,b)
        const data = {
            data:JSON.parse(res),
            code:1
        }
        let time = getTime()


        let sql2 = `INSERT INTO money ( today_time, share_code,  share_price ,zhuli_money,zhuli_pre,biggest_money,biggest_pre,bigger_money,bigger_pre,middle_money,middle_pre,little_money,little_pre)  VALUES `

        let shareList = JSON.parse(res).data.diff

        for(let i =0;i<shareList.length;i++){
            const item =shareList[i]
            const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
            if(i==0){
                sql2+=` (${'\''+today_time +'\''},${'\''+item.f12+'\''}, ${'\'' + item.f2 + '\''}, 
                ${Number(item.f62)||0}, ${Number(item.f184)||0},
                ${Number(item.f66)||0},${Number(item.f69)||0},
                ${Number(item.f72)||0},${Number(item.f75)||0},
                ${Number(item.f78)||0},${Number(item.f81)||0},
                ${Number(item.f84)||0},${Number(item.f87)||0}
                )`

            }else {
                sql2+=`,(${'\'' + today_time + '\''},${'\'' + item.f12 + '\''}, ${'\'' + item.f2 + '\''}, 
              ${Number(item.f62)||0}, ${Number(item.f184)||0},
                ${Number(item.f66)||0},${Number(item.f69)||0},
                ${Number(item.f72)||0},${Number(item.f75)||0},
                ${Number(item.f78)||0},${Number(item.f81)||0},
                ${Number(item.f84)||0},${Number(item.f87)||0}
                )`
            }


        }
        conn(sql2).then(r2=>{
            if(r2){
                resolve(r2)
                console.log('更新成功')
                console.log('今天所有股票流入资金加载完成')
            }

        })
    }).catch(e=>{
        reject(e)
    })
    })
}
function getTodayRise(){
    api.getTodayRise().then(res=>{

        let a = res.indexOf('(')
        let b =res.lastIndexOf(')')
        res = res.slice(a+1,b)
        const data = {
            data:JSON.parse(res),
            code:1
        }

        let shareList = JSON.parse(res).data.diff
        console.log('更新成功')
        for(let i =0;i<shareList.length;i++){
            const item =shareList[i]

            let sql = "SELECT * FROM share where share_code = "+item.f12
            conn(sql).then(r=>{


                let time = getTime()


                const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
                if(r&&r.length>0){
                    let sql1 = `UPDATE share SET share_price = ${'\'' + item.f2 + '\''} , today_time = ${'\'' + today_time + '\''} ,share_limit = ${Number(item.f3)||0 },chang_precent = ${Number(item.f8)||0  },share_qrr = ${ Number(item.f10)||0 },share_syl = ${ Number(item.f9)||0 } where share_code = ${'\'' + item.f12 + '\''}`
                    conn(sql1).then(r1=>{
                        if(r1){
                            if(i==shareList.length-1){
                                socket.emit('updateShare', {code:1});

                            }
                        }
                    })
                }else {
                    let sql2 = `INSERT INTO share ( today_time,share_name , share_code,  yearkl_id,daykl_id,moneykl_id ,share_price ,share_limit,chang_precent,share_qrr ,share_syl) 
                    VALUES (${'\'' + today_time + '\''},${'\''+item.f14+'\''},${'\''+item.f12+'\''},'0','0','0',${  '\''+item.f2+'\'' },${  Number(item.f3)||0 },${Number(item.f8)||0 },${Number(item.f10)||0 },${ Number(item.f9)||0 } )`
                    conn(sql2).then(r2=>{
                        if(r2){

                        }

                    })
                }

            })
        }

    }).catch(e=>{

    })
}

app.post('/register', (req, res) => {
    let { username,phone ,password,email,role,salary } = req.body
    let arr = [username , password, phone, role, salary, '1', email]
    let newarry = arr.map(citem => {
        return "'" + citem + "'"
    })
    let sql = "INSERT INTO user ( user_name , user_password , user_phone , role , salary , workStatus ,user_email ) VALUES ( "+newarry.toLocaleString() +")"

    conn.query(sql, (e, r) => {

        if(r&&r.insertId){
            res.json(new Result({ msg:'创建成功' }))

        }else {
            res.json(new Result({ msg:'创建失败',code:0 }))

        }

    })

// let sql = "INSERT INTO user ( '张员工','111111','15077877933','5','5000','1','1') VALUES  ( user_name , user_password , user_phone , ole , salary , workStatus ,user_email ) "


})
app.post('/makeTxt', (req, res) => {
    let { dbqd,qs ,tpzs,kaishi,jiasu } = req.body
    console.log('ssss---sss')
    fs.writeFile('./txt/dbqd.txt', '', function(){console.log('done')})
    fs.writeFile('./txt/qs.txt', '', function(){console.log('done')})

    fs.writeFile('./txt/tpzs.txt', '', function(){console.log('done')})
    fs.writeFile('./txt/kaishi.txt', '', function(){console.log('done')})
    fs.writeFile('./txt/jiasu.txt', '', function(){console.log('done')})
    dbqd.forEach(item=>{
        const str = (item[0]==6?'1':'0')+item
        fs.appendFileSync("./txt/dbqd.txt", str + "\n");
    })
    qs.forEach(item=>{
        const str = (item[0]==6?'1':'0')+item
        fs.appendFileSync("./txt/qs.txt", str + "\n");
    })
    tpzs.forEach(item=>{
        const str = (item[0]==6?'1':'0')+item
        fs.appendFileSync("./txt/tpzs.txt", str + "\n");
    })
    jiasu.forEach(item=>{
        const str = (item[0]==6?'1':'0')+item
        fs.appendFileSync("./txt/jiasu.txt", str + "\n");
    })
    kaishi.forEach(item=>{
        const str = (item[0]==6?'1':'0')+item
        fs.appendFileSync("./txt/kaishi.txt", str + "\n");
    })
    res.json(new Result({ data: 'success',code:1 }))
})

app.get('/login', (req, res) => {
    let { userphone ,password } = req.query
    console.log(userphone,password)
    let sql = "SELECT * FROM user where user_phone ="+userphone+" and user_password="+password
    conn(sql).then(r=>{
        if(r.length>0){
            r[0].token = 'token'
            r[0].password=''
            res.json(new Result({ data: r[0],code:1 }))
        }else {
            res.json(new Result({msg:'登录出错',code:0 }))
        }
    }).catch(e=>{
        res.json(new Result({msg:'登录出错',code:0 }))

    })
})

app.get('/getTodayMoneyKLine', (req, re) => {
    api.getTodayMoneyKLine('0.000564').then(res=>{

        let a = res.indexOf('(')
        let b =res.lastIndexOf(')')
        res = res.slice(a+1,b)
        const data = {
            data:JSON.parse(res),
            code:1
        }

        re.json(new Result(data))
    }).catch(e=>{
        re.json(new Result({ data: null,code:1 }))

    })
})


// 获取某只股票最近涨跌
app.get('/getOneRecentLine', (req, re) => {
    api.getOneRecentLine('0.000564').then(res=>{

        let a = res.indexOf('(')
        let b =res.lastIndexOf(')')
        res = res.slice(a+1,b)
        const data = {
            data:JSON.parse(res),
            code:1
        }

        re.json(new Result(data))
    }).catch(e=>{
        re.json(new Result({ data: null,code:1 }))

    })

})


app.post('/getTodayRise', (req, res) => {
    let {pageSize=15,currentPage=1,shareName='',shareCode='',shareLimit=0,shareChange=0,shareQrr=0} = req.body
    let sql = `select * from (share as a inner join money as b on a.share_code = b.share_code) inner join recent as c on c.share_code = a.share_code `
    let sql2 =`select COUNT(id) as total from share `
    if(shareName){
        sql+=`where a.share_name LIKE '%${shareName}%'  `
        sql2+=`where a.share_name LIKE '%${shareName}%'  `
    }else {
        sql+=`where a.share_name != '' `
        sql2+=`where a.share_name != '' `
    }
    if(shareCode){
        sql+=`and a.share_code LIKE '%${shareCode}%'`
        sql2+=`and share_code LIKE '%${shareCode}%'`
    }else {
        sql+=`and a.share_code !='' `
        sql2+=`and a.share_code !='' `
    }

    sql+=` order by a.share_limit ${shareLimit?'esc':'desc'},a.chang_precent ${shareChange?'esc':'desc'},a.share_qrr ${shareQrr?'esc':'desc'}   limit  ${(currentPage-1)*pageSize}, ${pageSize} `
    console.log(sql);

    conn(sql,[currentPage*pageSize-pageSize,currentPage*pageSize]).then(re=>{
         conn(sql2).then(r=>{
             let total = r[0].total
             let data ={
                 pageSize,
                 currentPage,
                 total,
                 list:re
             }
            res.json(new Result({data,msg:'查询成功'}))
        }).catch(e=>{
             let total = 4000
             let data ={
                 pageSize,
                 currentPage,
                 total,
                 list:re
             }
             res.json(new Result({data,msg:'查询成功'}))
         })
    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error'}))
    })
})
app.post('/getTodayMoney', (req, res) => {
    let {pageSize=15,currentPage=1,shareName='',shareCode='',shareZlpre=0,shareZlmoney=0,shareLittle=0} = req.body
    let sql = `select * from share as a inner join money as b on a.share_code = b.share_code `
    let sql2 =`select COUNT(id) as total from share `
    if(shareName){
        sql+=`where a.share_name LIKE '%${shareName}%'  `
        sql2+=`where a.share_name LIKE '%${shareName}%'  `
    }else {
        sql+=`where a.share_name != '' `
        sql2+=`where a.share_name != '' `
    }
    if(shareCode){
        sql+=`and a.share_code LIKE '%${shareCode}%'`
        sql2+=`and share_code LIKE '%${shareCode}%'`
    }else {
        sql+=`and a.share_code !='' `
        sql2+=`and a.share_code !='' `
    }

    sql+=` order by b.zhuli_money ${shareZlpre?'esc':'desc'},b.zhuli_money ${shareZlmoney?'esc':'desc'},b.little_pre ${shareLittle?'esc':'desc'}   limit  ${(currentPage-1)*pageSize}, ${pageSize} `
    console.log(sql);

    conn(sql,[currentPage*pageSize-pageSize,currentPage*pageSize]).then(re=>{
        conn(sql2).then(r=>{
            let total = r[0].total
            let data ={
                pageSize,
                currentPage,
                total,
                list:re
            }
            res.json(new Result({data,msg:'查询成功'}))
        }).catch(e=>{
            let total = 4000
            let data ={
                pageSize,
                currentPage,
                total,
                list:re
            }
            res.json(new Result({data,msg:'查询成功'}))
        })
    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error'}))
    })
})
app.get('/getKLine', (req, res) => {
    let {shareCode=''} = req.query
    let sql = `select * from kline where share_code = '${shareCode}' `
    console.log(sql);
    conn(sql).then(re=>{

        res.json(new Result({data:re,msg:'查询成功'}))
    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error'}))

    })
})
app.post('/getAllKLine', (req, res) => {
  let {type}  = req.body
    let sql = `select * from kline `
    console.log(sql);
    conn(sql).then(re=>{
        let Dbl = new diBeiLi(re,type)
        let all = Dbl.getKline()
        res.json(new Result({data:all,msg:'查询成功'}))
    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error'}))

    })
})

// ["2021-02-09,54.66,53.11,55.40,52.12,90405,482797616.00,6.09,-1.45,-0.78,13.82"]


app.get('/getRecent', (req, res) => {
    let {shareCode=''} = req.query
    let sql = `select * from recent where share_code = '${shareCode}' `
    console.log(sql);
    conn(sql).then(re=>{

        res.json(new Result({data:re,msg:'查询成功'}))
    }).catch(e=>{
        console.log(e);
        res.json(new Result({data:e,msg:'查询error'}))

    })
})
app.get('/getTodayMoney', (req, res) => {
    let {shareCode=''} = req.query
    let sql = `select * from money_kline where share_code = '${shareCode}' `
    console.log(sql);
    conn(sql).then(re=>{
        res.json(new Result({data:re,msg:'查询成功'}))
    }).catch(e=>{

        res.json(new Result({data:e,msg:'查询error'}))

    })
})
app.get('/setLike', (req, res) => {
    let {userId='',shareCode} = req.query
    let sql = `INSERT INTO user_like ( share_code ,user_id ) VALUES ( '${shareCode}','${userId}' ) `
    console.log(sql);
    conn(sql).then(re=>{
        res.json(new Result({data:re,msg:'关注成功'}))
    }).catch(e=>{

        res.json(new Result({data:e,msg:'关注失败'}))

    })
})
app.get('/cancelLike', (req, res) => {
    let {userId='',shareCode} = req.query
    let sql = `DELETE FROM user_like where share_code = '${shareCode}' and  user_id= '${userId}' ) `
    console.log(sql);
    conn(sql).then(re=>{
        res.json(new Result({data:re,msg:'取消成功'}))
    }).catch(e=>{
        res.json(new Result({data:e,msg:'取消失败'}))
    })
})
app.get('/getMyLike', (req, res) => {
    let {userId=''} = req.query

    let sql = `select * from  (user_like  inner join share  on user_like.share_code = share.share_code)  inner join money on money.share_code = user_like.share_code  and user_like.user_id = '${userId}' `
    console.log(sql);
    conn(sql).then(re=>{
        res.json(new Result({data:re,msg:'获取成功'}))
    }).catch(e=>{
        res.json(new Result({data:e,msg:'获取失败'}))
    })
})

function Result ({ code = 1, msg = '', data = '' }) {
    this.code = code;
    this.msg = msg;
    this.data = data;
}


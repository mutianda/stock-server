var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result,redis} = require("../../index.js");
const getTodayRiseLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('2  40 12 * * 6', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('所有的今日信息')
        getTodayRise()
    })
}
let stock = {

}
let stockCode = []
// 获取所有股票今天的信息
getTodayRiseLx()


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



const getAllKLineLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 18 20  *  * 1-6', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')
        conn('truncate kline').then(res=>{
            let sqlday = `INSERT INTO kline ( today_time , share_code,  kline,share_name) VALUES `
            getAllKLine(101,sqlday)
        })
    })
    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 18 23  *  * 1-6', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')

        conn('truncate kline_week').then(res=>{
            let sqlweek = `INSERT INTO kline_week ( today_time , share_code,  kline,share_name) VALUES `
            getAllKLine(102,sqlweek)
        })
    })
    // //每分钟的1-10秒都会触发，其它通配符依次类推
    // schedule.scheduleJob('23 14 23  *  * 1-6', ()=>{
    //     let {m,d,h,min,s} = getTime()
    //     console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
    //     console.log('所有的k线')
    //     conn('truncate kline_120m').then(res=>{
    //         let sql120m = `INSERT INTO kline_120m ( today_time , share_code,  kline,share_name) VALUES `
    //         getAllKLine(100,sql120m)
    //     })
    // })
    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 3 20  *  * 1-6', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')

        conn('truncate kline_30m').then(res=>{
            let sql30 = `INSERT INTO kline_30m ( today_time , share_code,  kline,share_name) VALUES `

            getAllKLine(30,sql30)
        })
    })
    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 58 19  *  * 1-6', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')
        conn('truncate kline_60m').then(res=>{
            let sql60 = `INSERT INTO kline_60m ( today_time , share_code,  kline,share_name) VALUES `
            getAllKLine(60,sql60)
        })
    })
}
// getAllTodayMoneyKLineLx()
// getAllRecentLineLx()
getAllKLineLx()
computeAll()

function getAllShareCode() {
    const sql = "SELECT share_code FROM share"
    return new Promise((reslove,reject)=>{
        if(stockCode.length){
            reslove(stockCode)
        }else{
            conn(sql).then( r => {
                if(r&&r.length>0){
                    let arr = []
                    r.forEach(item=>{
                        arr.push(item.share_code)
                    })
                    stockCode = arr
                    reslove(arr)
                }
            }).catch(e=>{
                    reject(e,'eeeeee')
                }
            )
        }
    })
}





async function getAllKLine(t,sql) {
    let res = await getAllShareCode()
    if(res.length){
        doAllKLinePromise(0,res,t,sql)
    }
}
function doAllKLinePromise(n,list,t,sql){
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
            prom.push(api.getKLine(code,t))
        }
        // getTodayMoneyKLine(code)
    }

    if(prom.length){
        Promise.all(prom).then((resu)=>{
            console.log(resu.length);
            getKLine(resu,sql).then(res=>{
                if(n<list.length){
                    console.log('进行了n次',n)
                    doAllKLinePromise(n+400,list,t,sql)
                }else {

                }
            })

        })
    }
}
function getKLine(list,sql){
    return new Promise((resolve,reject)=>{
        console.log('list'+list.length)
        let time = getTime()
        let sql2 =sql
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

app.post('/getAllKLine', async (req, res) => {
    let {type,pageSize=100,pageNum=1,}  = req.body

    const kline = JSON.parse(await redis.getKey('kline'))
    const kline_30m = JSON.parse(await redis.getKey('kline_30m'))
    const kline_week = JSON.parse(await redis.getKey('kline_week'))
    const kline_60m = JSON.parse(await redis.getKey('kline_60m'))
    if(kline){
        let arr = Object.values(kline)
        console.log(arr);
        let total= arr.length
        let list = arr.slice((pageNum-1)*pageSize,pageNum*pageSize)
        const r =  list.map(item=>{
            item['kweek'] = kline_week[item.code]
            item['k30m'] = kline_30m[item.code]
            item['k60'] = kline_60m[item.code]
            return item
        })
        res.json(new Result({data:{list:r,pageNum,pageSize,total},msg:'查询成功',}))
    }else {
        res.json(new Result({data:{list:[],pageNum,pageSize,total},msg:'查询成功',}))

    }

})


function computeAll(){
    const tables = ['kline','kline_week','kline_60m','kline_30m']
    console.log('all is start')
    const promise = []
    tables.forEach(item=>{
        promise.push(conn('select * from    '+' '+item))
    })
    Promise.all(promise).then(resList=>{
        console.log('all is get')
        resList.forEach(async (res,index)=>{
            console.log(res.length);
            if(res&&Array.isArray(res)){
                let Dbl = new diBeiLi(res,'all')
                let all = Dbl.getKline()
                obj = {}
                all.forEach(item=>{
                    obj[item.code] = item
                })
                await redis.setKey(tables[index],JSON.stringify(obj))
            }
            if(index==resList.length-1){
                console.log('all is complte')
            }
        })
    }).catch(e=>{
        console.log(e)
    })

}
app.post('/makeTxt', (req, res) => {
    let { dbqd,qs ,tpzs,kaishi,jiasu } = req.body

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

var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result,} = require("../../index.js");
const getTodayRiseLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('2  45 21 * * 7', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('所有的今日信息')
        getTodayRise()
    })
}
let stock = {

}
let stockCode = []
// 获取所有股票今天的信息
// getTodayRiseLx()


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
    schedule.scheduleJob('23 49 21  *  * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')
        conn('truncate kline').then(res=>{
            let sqlday = `INSERT INTO kline ( today_time , share_code,  kline,share_name,macd,dbl,chudbl,chaodbl,lianban,last,lianbanlength) VALUES `
            getAllKLine(101,sqlday)
        })
    })
    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 53 21  *  * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')

        conn('truncate kline_week').then(res=>{
            let sqlweek = `INSERT INTO kline_week ( today_time , share_code,  kline,share_name,macd,dbl,chudbl,chaodbl,lianban,last,lianbanlength) VALUES `
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
    schedule.scheduleJob('23 56 21  *  * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')

        conn('truncate kline_30m').then(res=>{
            let sql30 = `INSERT INTO kline_30m ( today_time , share_code,  kline,share_name,macd,dbl,chudbl,chaodbl,lianban,last,lianbanlength) VALUES `

            getAllKLine(30,sql30)
        })
    })
    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23  59 21 *  * *', ()=>{
        let {m,d,h,min,s} = getTime()
        console.log('更新:'+ m+'-'+d+'   '+h+':'+min+':'+s);
        console.log('所有的k线')
        conn('truncate kline_60m').then(res=>{
            let sql60 = `INSERT INTO kline_60m ( today_time , share_code,  kline,share_name,macd,dbl,chudbl,chaodbl,lianban,last,lianbanlength) VALUES `
            getAllKLine(60,sql60)
        })
    })
}
// getAllTodayMoneyKLineLx()
// getAllRecentLineLx()
getAllKLineLx()
// computeAll()

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
    for(var i = 0;i<200;i++){
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

            getKLine(resu,sql).then(res=>{
                if(n<list.length){
                    console.log('进行了n次',n)
                    doAllKLinePromise(n+200,list,t,sql)
                }else {

                }
            })

        })
    }
}
function getKLine(list,sql){
    return new Promise((resolve,reject)=>{

        let time = getTime()
        let sql2 =sql
        // moneykl,
        list.forEach((res,index)=>{
            if(res.length>400){

                let a = res.indexOf('(')
                let b =res.lastIndexOf(')')
                res = res.slice(a+1,b)

                const data =JSON.parse(res)

                let klines = JSON.stringify(data.data.klines)
                let dblObj = new diBeiLi([{share_name:data.data.name,share_code:data.data.code,kline:klines}])
                let macdList = dblObj.getKline()
                const { macd,dbl,chudbl,chaodbl,lianban,last,lianbanLength,kline} =macdList[0]
                const today_time = time.y+'-'+time.m+'-'+time.d+'  '+time.h+':'+time.min+':'+time.s
                if(index==0){
                    sql2+=`(${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + JSON.stringify(kline) + '\''},${'\'' + data.data.name + '\''} ,
                    ${'\'' + JSON.stringify(macd) + '\''},${'\'' + (dbl?1:0) + '\''},${'\'' + (chudbl?1:0) + '\''},${'\'' + (chaodbl?1:0 )+ '\''},${'\'' + JSON.stringify(lianban) + '\''},
                    ${'\'' + JSON.stringify(last) + '\''},${'\'' + lianbanLength + '\''})`


                }else {
                    sql2+=`, (${'\''+today_time +'\''},${'\''+data.data.code+'\''}, ${'\'' + JSON.stringify(kline) + '\''},${'\'' + data.data.name + '\''} ,
                    ${'\'' + JSON.stringify(macd) + '\''},${'\'' + (dbl?1:0) + '\''},${'\'' + (chudbl?1:0) + '\''},${'\'' + (chaodbl?1:0 )+ '\''},${'\'' + JSON.stringify(lianban) + '\''},
                    ${'\'' + JSON.stringify(last) + '\''},${'\'' + lianbanLength + '\''})`

                }
            }
        })

        conn(sql2).then(r2=>{
            resolve(r2)


        }).catch(e=>{
                resolve(e)

            }
        )

    })

}
app.post('/searchShare', (req, res) => {
    let {type='kline',keyword=''} = req.body
    let isNum = /^\d+$/.test(keyword);
    if(keyword=='') {
        res.json(new Result({data:[],msg:'查询成功',code:200}))
        return
    }
    let sql
    if(isNum){
        sql =  `select  share_code,share_name,today_time,id,dbl,chaodbl,chudbl,lianban,last,lianbanlength from ${type} where share_code LIKE '${keyword}%' `
    }else {
        sql =   `select share_code,share_name,today_time,id,dbl,chaodbl,chudbl,lianban,last,lianbanlength  from ${type} where  share_name LIKE '${keyword}%'`
    }
    // or share_name LIKE '%${keyword}%'
    conn(sql).then(re=>{

        if(re.length){
            const list = re.map(item=>{
                // item.kline = JSON.parse(item.kline)
                item.code = item.share_code
                item.name = item.share_name
                // item.macd = JSON.parse(item.macd)
                item.last = JSON.parse(item.last)
                item.lianban = type=='kline'?JSON.parse(item.lianban):[]
                return item
            })

            res.json(new Result({data:list,msg:'查询成功'}))
        }else {
            res.json(new Result({data:re,msg:'查询成功',code:500}))
        }

    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error',code:500}))

    })
})
app.post('/getKLine', (req, res) => {
    let {type='kline',shareCode=''} = req.body
    let sql = `select * from ${type} where share_code = '${shareCode}' `

    conn(sql).then(re=>{

        if(re.length){
            const list = re.map(item=>{
                item.kline = JSON.parse(item.kline)
                item.code = item.share_code
                item.name = item.share_name
                item.macd = JSON.parse(item.macd)
                item.last = JSON.parse(item.last)
                item.lianban = type=='kline'?JSON.parse(item.lianban):[]
                return item
            })

            res.json(new Result({data:list[0],msg:'查询成功'}))
        }else {
            res.json(new Result({data:re,msg:'查询成功',code:500}))
        }

    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询error',code:500}))

    })
})

app.post('/getAllKLine', async (req, res) => {
    let {type,pageSize=100,pageNum=1,}  = req.body
    let sql='select A.share_code,A.share_name,A.today_time,A.id,A.dbl,A.chaodbl,A.chudbl,A.lianban,A.last,A.lianbanlength, '+
        'B.dbl AS 60m_dbl,B.chudbl AS 60m_chudbl,B.chaodbl AS 60m_chaodbl,' +
        'C.dbl AS 30m_dbl,C.chudbl AS 30m_chudbl,C.chaodbl AS 30m_chaodbl,' +
        'D.dbl AS week_dbl,D.chudbl AS week_chudbl,D.chaodbl AS week_chaodbl ' +
        'from kline A '
        + ' LEFT JOIN kline_60m B ON B.share_code = A.share_code  '
        +    ' LEFT JOIN kline_30m C ON C.share_code = A.share_code  '
        +    ' LEFT JOIN kline_week D ON D.share_code = A.share_code  where 1>0 '
    let sql2 = 'select count(*) from kline  where 1>0 '

    if(type.indexOf('lianban-')>-1){
        const l = type.split('-')[1]
        sql += ' and A.lianbanlength > '+l
        sql2+=' and lianbanlength > '+l
    }
    if(type.indexOf('dbl')>-1){
        sql += ' and  A.dbl =1 '
        sql2 += ' and dbl =1 '
    }
    if(type=='chaodbl'){
        sql += ' and A.chaodbl =1 '
        sql2+=' and chaodbl =1 '
    }
    if(type=='chudbl'){
        sql += ' and A.chudbl =1 '
        sql2 += ' and chudbl =1 '
    }
    let countres = await getSqlRes(sql2)
    sql+= (' limit '+(pageNum-1)*pageSize+','+pageNum*pageSize)

    conn(sql).then(async r=>{

            let arr = r

            const list = arr.map(item=>{
                item.code = item.share_code
                item.name = item.share_name
                item.last = JSON.parse(item.last)
                item.lianban = JSON.parse(item.lianban)
                return item
            })
            let total = countres[0]['count(*)']
            res.json(new Result({data:{list,pageNum,pageSize,total},msg:'查询成功',}))

    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询失败',}))
    })

})
async function getSqlRes(sql) {
     return conn(sql)

}

function computeAll(){
    // const tables = ['kline','kline_week','kline_60m','kline_30m']
    const tables = ['kline']


    const promise = []
    tables.forEach(item=>{
        promise.push(conn('select * from    '+' '+item))
    })
    Promise.all(promise).then(resList=>{

        let obj = {}
        resList.map((res,index)=>{


            if(res&&Array.isArray(res)){
                let Dbl = new diBeiLi(res,'all')
                let all = Dbl.getKline()
                const str = tables[index]
                all.forEach(item=>{
                    if(!obj[item.code]){
                        obj[item.code] = {}
                    }
                    obj[item.code][str] = item
                })

            }
        })
        // Object.keys(obj).map(async (res,index)=>{
        //     if(index<10){
        //         await redis.setKey(res,JSON.stringify(obj[res].code||{}))
        //     }
        // })
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

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
        console.log('所有的今日信息')
        getTodayRise()
    })
}

// 获取所有股票今天的信息
// getTodayRiseLx()



const getAllKLineLx = ()=>{

    //每分钟的1-10秒都会触发，其它通配符依次类推
    schedule.scheduleJob('23 50 10   * * *', ()=>{
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


function Result ({ code = 1, msg = '', data = '' }) {
    this.code = code;
    this.msg = msg;
    this.data = data;
}

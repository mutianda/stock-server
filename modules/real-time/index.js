var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result} = require("../../index.js");
// { getTime,conn ,schedule,app,api,socket,email}
var realTimeList=[]
var times =0
const realTimePush=()=>{
    schedule.scheduleJob('30  0/2 9-14 * * 1-5', ()=>{
        let {m,d,h,min,s} = getTime()
        realTimeList = []
        console.log('推送')
        getRealTime()

    })
    schedule.scheduleJob('30  13 22,8 * * 1-5', ()=>{
        getDblEmail()
    })
}
getDblEmail = ()=>{
    let sql='select A.*,' +
        'B.dbl AS 60m_dbl,B.chudbl AS 60m_chudbl,B.chaodbl AS 60m_chaodbl,' +
        'C.dbl AS 30m_dbl,C.chudbl AS 30m_chudbl,C.chaodbl AS 30m_chaodbl,' +
        'D.dbl AS week_dbl,D.chudbl AS week_chudbl,D.chaodbl AS week_chaodbl ' +
        'from kline A '
        + ' LEFT JOIN kline_60m B ON B.share_code = A.share_code  '
        +    ' LEFT JOIN kline_30m C ON C.share_code = A.share_code  '
        +    ' LEFT JOIN kline_week D ON D.share_code = A.share_code  '



    sql += ' where A.chaodbl =1 or A.chudbl =1  '
    sql+= (' limit 0 , 100')
    conn(sql).then(r=>{
        let arr = r
        const list = arr.map(item=>{
            item.kline = JSON.parse(item.kline)
            item.code = item.share_code
            item.name = item.share_name
            item.macd = JSON.parse(item.macd)
            item.last = JSON.parse(item.last)
            item.lianban = JSON.parse(item.lianban)
            return item
        })

        if(list.length){

                var mailOptions = {
                    from: '横断万股<270947682@qq.com>', // 发送者
                    sender:'股票分析',
                    to: 'qingyi.zongbu@qq.com', // 接受者,可以同时发送多个,以逗号隔开
                    subject: '底背分析', // 标题
                    //text: 'Hello world', // 文本
                    html: `<h2>底背离:</h2>
`
                };
                list.sort((a,b)=>b.last.risePrecent-a.last.risePrecent).sort((a,b)=>b.chudbl-a.chudbl).sort((a,b)=>b.chaodbl-a.chaodbl).forEach(it=>{
                    mailOptions.html+=`
                    <div style="margin: 5px 10px;border-bottom: .1px solid #eee;line-height: 20px;background: #fff">
                    <span style="font-size: 20px">${it.share_name}</span>
                    <span style="color: ${it.last.risePrecent > 0 ? 'red' : 'green'}">涨幅：${it.last.risePrecent}%</span>
                    <span style="color: ${it.last.risePrecent > 0 ? 'red' : 'green'}">最新价：${it.last.close}</span>
                    </br>
                    <span style="color:darkred }"> ${it.chudbl ? '初底背离--' : ''}</span>
                    <span style="color:#bb0d0d"> ${it.chaodbl ? '超底背离' : ''}</span>
                    </div>`
                })
                console.log(mailOptions);
                email.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('发送了')
                })
            }


    }).catch(e=>{
        res.json(new Result({data:e,msg:'查询失败',}))
    })
}
getRealTime = ()=>{
    const sql = "SELECT * FROM real_time"
    return new Promise((reslove,reject)=>{
        conn(sql).then( r => {
            if(r&&r.length>0){
                realTimeList = r
                const prom = []
                r.forEach(item=>{
                    let code = ''
                    if(item.share_code[0]==6){
                        code = '1.'+item.share_code
                    }else {
                        code = '0.'+item.share_code
                    }
                    prom.push(api.getShareDetail(code))
                })
                Promise.all(prom).then((resu)=>{
                    realTimeShare(resu)
                })
            }
        }).catch(e=>{
                reject(e,'eeeeee')
            }
        )
    })
}

function realTimeShare(resu){
    const arr = []
      resu.forEach(res=>{
          let a = res.indexOf('(')
          let b =res.lastIndexOf(')')
          res = res.slice(a+1,b)
          const {data} = JSON.parse(res)
          const share = realTimeList.find(item=>item.share_code==data.f57)
          if(share.price_rise&&share.price_rise<data.f43){
              arr.push({...data,...share,desc:'B',pushType:'up'})
          }
          if(share.price_down&&share.price_down>data.f43){
              arr.push({...data,...share,desc:'S',pushType:'down'})
          }
      })
    if(arr.length){
        console.log(arr,'arr');
        socket.emit('realTimeStock',arr)
        times++
        if(times>2){

         times=0
        var mailOptions = {
            from: '横断万股<270947682@qq.com>', // 发送者
            sender:'股票分析',
            to: 'qingyi.zongbu@qq.com', // 接受者,可以同时发送多个,以逗号隔开
            subject: '分析', // 标题
            //text: 'Hello world', // 文本
            html: `<h2>分析:</h2>
`
        };
        arr.sort((a,b)=>b.f170-a.f170).forEach(it=>{
            mailOptions.html+=`
<div style="margin: 5px 10px">
<span style="color: ${it.desc == 'B' ? 'red' : 'green'}">${it.desc == 'B' ? '买' : '卖'}</span>
<span>名称：${it.f58}</span><span style="color: ${it.f170 > 0 ? 'red' : 'green'}">
最新价：${it.f43}</span>
<span style="color: ${it.f170 > 0 ? 'red' : 'green'}">
涨幅：${it.f170}%</span>
<span style="color: blueviolet">突破价：${it.price_rise}</span>
<span style="color: #98f17f">跌破价：${it.price_down}</span>
</div>`
        })
        console.log(mailOptions);
        email.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('发送了')
        })
        }
    }

}

app.post('/addRealTimePush', (req, res) => {
    let { user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down } = req.body
    let arr = [ user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down]
    let newarry = arr.map(citem => {
        return "'" + citem + "'"
    })
    let sql = "REPLACE  INTO real_time ( user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down ) VALUES ( " +
        ""+newarry.toLocaleString() +")"

    conn(sql).then( r => {

        if(r&&r.insertId){
            res.json(new Result({ msg:'创建成功' }))

        }else {
            res.json(new Result({ msg:'创建失败',code:0 }))

        }

    }).catch(e=>{

    })
})
app.post('/editRealTimePush', (req, res) => {
    let { user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down } = req.body
    let arr = [ user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down]
    let newarry = arr.map(citem => {
        return "'" + citem + "'"
    })
    let sql = "REPLACE  INTO real_time ( user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down ) VALUES ( " +
            ""+newarry.toLocaleString() +")"


    conn(sql).then(r=>{
        if(r){
            res.json(new Result({ msg:'编辑成功' }))

        }else {
            res.json(new Result({ msg:'编辑失败',code:0 }))

        }
    })
})
app.post('/getRealTimePush', (req, res) => {
    let { pageSize=10,pageNum=1 } = req.body

    let sql =   `select * from real_time limit  ${(pageNum-1)*pageSize}, ${pageSize} `
    console.log(sql);
    conn(sql).then(r => {
        if(r){
            res.json(new Result({ msg:'创建成功',data:r }))

        }else {
            res.json(new Result({ msg:'创建失败',code:0 }))

        }

    }).catch(e=>{

        console.log(e);
    })
})
app.post('/removeRealTimePush', (req, res) => {
    let { share_code } = req.body

    let sql = `delete from real_time where share_code = ${share_code}`
    console.log(sql);
    conn(sql).then(r => {
        if(r){
            res.json(new Result({ msg:'删除成功' }))

        }else {
            res.json(new Result({ msg:'删除失败',code:0 }))

        }

    }).catch(e=>{

        console.log(e);
    })
})



module.exports = realTimePush

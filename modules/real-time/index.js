var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result} = require("../../index.js");
// { getTime,conn ,schedule,app,api,socket,email}
var realTimeList=[]
var times =0
const realTimePush=()=>{
    schedule.scheduleJob('30  0/2 0-14 * * *', ()=>{
        let {m,d,h,min,s} = getTime()
        realTimeList = []
        console.log('推送')
        getRealTime()

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
              arr.push({...data,...share,desc:'买入',pushType:'up'})
          }
          if(share.price_down&&share.price_down>data.f43){
              arr.push({...data,...share,desc:'卖出',pushType:'down'})
          }
      })
    if(arr.length){
        socket.emit('realTimeStock',arr)
        times++
        if(times>10){

         times=0
        var mailOptions = {
            from: '270947682@qq.com', // 发送者
            sender:'股票分析',
            to: 'qingyi.zongbu@qq.com', // 接受者,可以同时发送多个,以逗号隔开
            subject: '分析', // 标题
            //text: 'Hello world', // 文本
            html: `<h2>分析:</h2>
`
        };
        arr.forEach(it=>{
            mailOptions.html+=`<div><span>名称：${it.f58}</span><span style="color: ${it.f170>0?'red':'green'}">最新价：${it.f43}</span><span style="color: ${it.f170>0?'red':'green'}">涨幅：${it.f170}%</span></div>`
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
    let sql = "INSERT INTO real_time ( user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down ) VALUES ( " +
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
    let { user_id , share_code,share_name , price_rise , turn_hand , limit_up ,price_down ,id} = req.body

    let sql = `UPDATE real_time SET share_code = ${'\'' + share_code + '\''} , share_name = ${'\'' + share_name + '\''} ,price_rise = ${price_rise||0 },turn_hand = ${turn_hand||0  },price_down = ${price_down||0 },limit_up = ${ limit_up||0 } where id = ${id}`


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
    let { id } = req.body

    let sql = `delete from real_time where id = ${id}`
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

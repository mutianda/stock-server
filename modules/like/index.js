var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result,} = require("../../index.js");
app.post('/getLikeRealTime', (req, res) => {
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
app.post('/getLikeRealTime', (req, res) => {
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
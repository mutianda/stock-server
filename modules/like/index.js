var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result,} = require("../../index.js");

app.post('/getLikeRealTime', (req, res) => {
	let {email=''} = req.body
	let sql = `select * from share_like where user_email = '${email}' `

	conn(sql).then(re=>{
		if(re){
			const shareList = re
			const prom = []
			shareList.forEach(it=>{
				let code = ''
				const item = it.share_code
				if(item[0]==6){
					code = '1.'+item
				}else {
					code = '0.'+item
				}
				prom.push(api.getShareDetail(code))
			})
			Promise.all(prom).then((resu)=>{

				const data = realTimeShare(resu,shareList)
				res.json(new Result({data,msg:'查询成功',code:200}))
			}).catch(e=>{
				res.json(new Result({data:[],msg:'查询失败',code:500}))

			})
		}else {
			res.json(new Result({data:[],msg:'查询失败',code:500}))
		}

	}).catch(e=>{
		res.json(new Result({data:[],msg:'查询error',code:500}))

	})


})
function realTimeShare(resu,shareList){
	const arr = []
	resu.forEach(res=>{
		let a = res.indexOf('(')
		let b =res.lastIndexOf(')')
		res = res.slice(a+1,b)
		const {data} = JSON.parse(res)
		const share = shareList.find(item=>item.share_code==data.f57)
		arr.push({...data,
			name:data.f58,
			code:data.f57,
			share_code:data.f57,
			share_name: data.f58,
			...share,
			last:{
				high:data.f44,
				low:data.f45,
				open:data.f46,
				close:data.f43,
				time:(new Date()).getTime(),
				volumes:data.f47,
				turnover:data.f168,
				risePrecent:data.f170,
				money:data.f48,
			}
			})
	})
	return arr


}
app.post('/getLikeList', (req, res) => {
	let {email=''} = req.body
	let sql = `select * from share_like where user_email = '${email}' `

	conn(sql).then(re=>{
		if(re){
			res.json(new Result({data:re,msg:'查询成功',code:200}))
		}else {
			res.json(new Result({data:re,msg:'查询成功',code:500}))
		}
	}).catch(e=>{
		res.json(new Result({data:e,msg:'查询error',code:500}))

	})
})

app.post('/addLike', (req, res) => {
	let {email='',code='',name='',price='',time} = req.body
	let sql = `INSERT INTO share_like ( share_code , share_name , like_price , user_email , like_time  ) VALUES ( '${code}','${name}','${price}','${email}','${time}')`

	conn(sql).then(re=>{
		if(re){
			res.json(new Result({msg:'更新成功',code:200}))
		}else {
			res.json(new Result({data:re,msg:'error',code:500}))
		}

	}).catch(e=>{
		res.json(new Result({data:e,msg:'查询error',code:500}))

	})
})
app.post('/deleteLike', (req, res) => {
	let {id} = req.body
	let sql = `delete from share_like where id = ${id}`

	conn(sql).then(re=>{
		if(re){
			res.json(new Result({msg:'更新成功',code:200}))
		}else {
			res.json(new Result({data:re,msg:'error',code:500}))
		}

	}).catch(e=>{
		res.json(new Result({data:e,msg:'查询error',code:500}))

	})
})
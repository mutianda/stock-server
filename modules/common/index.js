var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result} = require("../../index.js");

app.post('/register', (req, res) => {
	let { username,phone ,password,email,role,salary } = req.body
	let arr = [username , password, phone, role, salary, '1', email]
	let newarry = arr.map(citem => {
		return "'" + citem + "'"
	})
	let sql = ''

	conn.query(sql, (e, r) => {

		if(r&&r.insertId){
			res.json(new Result({ msg:'创建成功' }))

		}else {
			res.json(new Result({ msg:'创建失败',code:0 }))

		}

	})
})
app.post('/login', (req, res) => {
	let { userName ,password } = req.body
	console.log(userName,password)
	if(!userName||!password){
		res.json(new Result({msg:'登录出错',code:0 }))
		return
	}
	let sql = "SELECT * FROM user where user_phone = "+userName+" or user_email = "+userName+" and user_password="+password
	conn(sql).then(r=>{
		if(r.length>0){
			r[0].token = 'token'
			r[0].password=''
			res.json(new Result({ data: r[0],code:200 }))
		}else {
			res.json(new Result({msg:'登录出错',code:500 }))
		}
	}).catch(e=>{
		res.json(new Result({msg:'登录出错',code:500 }))

	})
})
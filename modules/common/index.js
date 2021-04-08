var { conn ,schedule,app,api,socket,email,getTime,diBeiLi,fs,Result} = require("../../index.js");

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
const mysql = require('mysql')

const option = {
    host: '120.26.62.101',
    user: 'root',
    password: 'cgd',
    port: '3306',
    database: 'stock',
    connectTimeout: 5000, //连接超时
    multipleStatements: false //是否允许一个query中包含多条sql语句
}
// const conn = mysql.createConnection(option);
// module.exports=conn;
// 引入mysql

//创建数据库连接
let pool = mysql.createPool(option)

// 数据库操作
/**
 * @param {string} sql 查询数据库语句
 * @param {Array} data 查询数据库的数据
 */
let query = function(sql, data){
    return new Promise(function(resolve, reject){
        // getConnection 获取连接  回调函数中返回
        // err 连接是否失败
        // conncetion 获取连接的连接信息
        pool.getConnection(function(err, conncetion){
            if(!err) {
                // sql 查询的语句
                // data 查询过程中需要的数据
                // error  查询的错误信息
                // result 查询的结果
                conncetion.query(sql, data, function(error, result){
                    if(!error) {
                        // 将查询成功返回的数据 存入resolve中
                        resolve(result)
                    }else {
                        reject(error)
                    }
                    conncetion.release()
                })
            }else {
                console.log(err)
                reject(err)
            }
        })
    })
}

module.exports = query


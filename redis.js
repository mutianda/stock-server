// var redis = require('redis');
// var client = redis.createClient(6379, '120.26.62.101');
// client.auth(123456)
// client.on('connect', function () {
//     console.log("redis is ok " );
// })
// client.on("error", function (err) {
//     console.error("redis is Error " + err);
// });
//
// let setKey = (key,value) =>{
//     return new Promise((resolve, reject) => {
//         client.set(key,value,(err,replay)=>{
//             if(err){
//                 console.error("redis set is Error " + err);
//                 reject(err);
//             }else{
//                 resolve(replay);
//             }
//         })
//     })
// };
//
// let getKey = (key)=>{
//     return new Promise((resolve, reject) => {
//         client.get(key,(err,replay)=>{
//             if(err){
//                 console.error("redis get is Error " + err);
//                 reject(err);
//             }else{
//                 resolve(replay);
//             }
//         })
//     })
// };
//
// module.exports = {
//     setKey,getKey
// };


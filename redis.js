var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');


client.on('connect', function () {
})
client.on("error", function (err) {
    console.log("Error " + err);
});

let setKey = (key,value) =>{
    return new Promise((resolve, reject) => {
        client.set(key,value,(err,replay)=>{
            if(err){
                reject(err);
            }else{
                resolve(replay);
            }
        })
    })
};

let getKey = (key)=>{
    return new Promise((resolve, reject) => {
        client.get(key,(err,replay)=>{
            if(err){
                reject(err);
            }else{
                resolve(replay);
            }
        })
    })
};

module.exports = {
    setKey,getKey
};


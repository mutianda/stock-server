 class DiBEiLi {


       constructor(res,type='') {
        this.computeType = type
        this.allKline = res
        this.dblList = []
        this.macdList = []
        }

        getKline() {
            this.allKline.forEach(item=>{
                const lineList = JSON.parse(item.kline)
                this.computKline(lineList,item.share_name,item.share_code)
            })


            this.macdList =  this.macdList.map(item=>{
                let arr = []
                let l = []
                item.kline.forEach((it,index)=>{
                    if(index<item.kline.length-1){
                        if(it.risePrecent>9.6){
                            arr.push({time:it.time})
                        }else {
                            l = arr.length>l.length?[...arr]:l
                            arr = []
                        }
                    }
                })
               const dbl =  this.getDbl(item)
               item.lianban = l
                return {
                    ...item,
                    lianban:l,
                    lianbanLength:l.length,
                    ...dbl
                }

            })
            return this.macdList

        }
        computKline(kline,name,code){
            const input = kline.map(item=>{
                const k = item.split(',')
                const close =
                    {
                        open: k[1],
                        close: k[2],
                        low: k[4],
                        high: k[3],
                        time:k[0],
                        volumes:k[5],
                        turnover:k[10],
                        risePrecent:k[8],
                        money:k[6],
                    }
                return close
            })
            this.computeMacd(input,name,code)
        }
        computeMacd(data,name,code){
            var input ,macd;
            input = data
            var calcEMA,calcDIF,calcDEA,calcMACD;

            calcEMA=function(n,data,field){
                var i,l,ema,a;
                a=2/(n+1);
                if(field){
                    //二维数组
                    ema=[data[0][field]];
                    for(i=1,l=data.length;i<l;i++){
                        ema.push(a*data[i][field]+(1-a)*ema[i-1]);
                    }
                }else{
                    //普通一维数组
                    ema=[data[0]];
                    for(i=1,l=data.length;i<l;i++){
                        ema.push(a*data[i]+(1-a)*ema[i-1]);
                    }
                }
                return ema;
            };

            /*
             * 计算DIF快线，用于MACD
             * @param {number} short 快速EMA时间窗口
             * @param {number} long 慢速EMA时间窗口
             * @param {array} data 输入数据
             * @param {string} field 计算字段配置
             */
            calcDIF= function(short,long,data,field){
                var i,l,dif,emaShort,emaLong;
                dif=[];
                emaShort=calcEMA(short,data,field);
                emaLong=calcEMA(long,data,field);
                for(i=0,l=data.length;i<l;i++){
                    dif.push(emaShort[i]-emaLong[i]);
                }
                return dif;
            };

            /*
             * 计算DEA慢线，用于MACD
             * @param {number} mid 对dif的时间窗口
             * @param {array} dif 输入数据
             */
            calcDEA=function(mid,dif){
                return calcEMA(mid,dif);
            };

            /*
             * 计算MACD
             * @param {number} short 快速EMA时间窗口
             * @param {number} long 慢速EMA时间窗口
             * @param {number} mid dea时间窗口
             * @param {array} data 输入数据
             * @param {string} field 计算字段配置
             */
            calcMACD=function(short,long,mid,data,field){
                var i,l,dif,dea,macd,result;
                result={};
                macd=[];
                dif=calcDIF(short,long,data,field);
                dea=calcDEA(mid,dif);
                for(i=0,l=data.length;i<l;i++){
                    macd.push((dif[i]-dea[i])*2);
                }
                // result.dif=dif;
                // result.dea=dea;
                result.macd=macd;
                result.code=code;
                result.name=name
                result.kline =input
                result.last = input[input.length-1]
                return result;
            };

            macd=calcMACD(12,26,9,input,"close");
            this.macdList.push(macd)

        }
      getDbl(item){
          const dbl = this.computeDbl(item.macd)
          const noStAndKc = this.noStAndKc(item)
          const rise = this.beRised(item)
          const base = noStAndKc&&rise
          return  {
              chudbl:dbl.chudbl&&base,
              chaodbl: dbl.chaodbl&&base,
              dbl:dbl&&base
          }
        }
       beRised(item){
            const l = item.macd.length-1
            if(item.macd[l]>=item.macd[l-1]&&item.macd[l-1]>=item.macd[l-2]&&item.macd[l-1]>0){
                return true
            }else {
                return false
            }
        }
        noStAndKc(item){
            if(item.code[0]!=3&&!item.name.includes('st')&&!item.name.includes('ST')){
                return true
            }else {
                return  false
            }
        }
        computeDbl(macd){
            const dmacd = [...macd].reverse()
            const acd =[0]
            let flag = 1
            dmacd.forEach(item=>{
                if(item!=0){
                    if(item*flag>0){
                        acd[acd.length-1]+=item
                    }else {
                        acd[acd.length]=item
                    }
                    flag = item
                }
            })
            let chao = acd[1]*2>acd[3]||acd[1]>-2
            let chu = dmacd[3]<0
            const dbl = acd.length>3&&acd[0]>0&&acd[1]>acd[3]
            return {
                chudbl:dbl&&chu,
                chaodbl:dbl&&chao,
                dbl,
            }

        }

}
 //静态变量
 DiBEiLi.dblList =  []
 DiBEiLi.macdList =  []
 DiBEiLi.allKline =  []
 module.exports = DiBEiLi;

var express = require('express');
var swig = require('swig');
var path = require('path')
var app = express();
var port = 3399
var { conn ,Result,} = require("../../index.js");

//设置swig页面不缓存
swig.setDefaults({
	cache: false
})
//设置渲染文件的目录
app.set('views', path.join(__dirname, './views'));
//设置html模板渲染引擎
app.engine('html',swig.renderFile);
//设置渲染引擎为html
app.set('view engine','html');
app.set('view cache', false);
app.listen(port);

function splitData(rawData) {
	var categoryData = [];
	var values = [];
	var volumes = [];
	const turnOver = [];
	for (var i = 0; i < rawData.length; i++) {
		categoryData.push(rawData[i].splice(0, 1)[0]);
		values.push(rawData[i]);
		volumes.push([
			i,
			rawData[i][4],
			rawData[i][0] > rawData[i][1] ? 1 : -1
		]);
		turnOver.push([
			i,
			rawData[i][6],
			rawData[i][0] > rawData[i][1] ? 1 : -1
		]);
	}
	return {
		categoryData: categoryData,
		values: values,
		volumes: volumes,
		turnOver
	};
}

function  calculateMA(dayCount, data) {
	var result = [];
	for (var i = 0, len = data.values.length; i < len; i++) {
		if (i < dayCount) {
			result.push("-");
			continue;
		}
		var sum = 0;
		for (var j = 0; j < dayCount; j++) {
			sum += data.values[i - j][1];
		}
		result.push(+(sum / dayCount).toFixed(3));
	}
	return result;
}
function getData(item){
	const upColor = "#ec0000";
	const downColor = "#00da3c";
	let klines = item.kline.map(it => {
		const info = [
			it.time,
			it.open - 0,
			it.close - 0,
			it.low - 0,
			it.high - 0,
			it.volumes - 0,
			it.money - 0,
			it.turnover - 0,
			it.risePrecent - 0
		];
		return info;
	});
	const data = splitData(klines)
	const {code,name} = item
	const op1 ={
		animation: false,
		title: {
			text: name + code
		},
		legend: {
			bottom: 10,
			left: "center",
			data: ["当日信息", "5均线", "10均线", "20均线", "30均线"]
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			},
			formatter: params => {
				let dom = ``;
				dom += `<div>日期:${params[0].axisValue}</div>`;
				params.forEach((item, index) => {
					if (item.componentSubType == "candlestick") {
						dom += `<div style="text-align: left">开盘:${item.data[1]} </div>`;
						dom += `<div  style="text-align: left">收盘:${item.data[2]} </div>`;
						dom += `<div  style="text-align: left">最低:${item.data[3]} </div>`;
						dom += `<div  style="text-align: left">最高:${item.data[4]} </div>`;
						dom += `<div style="text-align: left; ${
							item.data[8] > 0 ? "color:red" : "color:green"
						}">成交量:${item.data[5]} </div>`;
						dom += `<div  style="text-align: left">成交额:${item.data[6]} </div>`;
						dom += `<div style="text-align: left; ${
							item.data[8] > 0 ? "color:red" : "color:green"
						}">换手率:${item.data[7]} %</div>`;
						dom += `<div style=" text-align: left;${
							item.data[8] > 0 ? "color:red" : "color:green"
						}">涨幅:${item.data[8]}% </div>`;
					}
				});
				return dom;
			},
			borderWidth: 1,
			borderColor: "#ccc",
			padding: 10,
			textStyle: {
				color: "#000"
			},
			position: function(pos, params, el, elRect, size) {
				var obj = { top: 10 };
				obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
				return obj;
			}
			// extraCssText: 'width: 170px'
		},
		axisPointer: {
			link: { xAxisIndex: "all" },
			label: {
				backgroundColor: "#777"
			}
		},
		toolbox: {
			feature: {
				dataZoom: {
					yAxisIndex: false
				},
				brush: {
					type: ["lineX", "clear"]
				}
			}
		},
		brush: {
			xAxisIndex: "all",
			brushLink: "all",
			outOfBrush: {
				colorAlpha: 0.1
			}
		},
		visualMap: {
			show: false,
			seriesIndex: 5,
			dimension: 2,
			pieces: [
				{
					value: 1,
					color: downColor
				},
				{
					value: -1,
					color: upColor
				}
			]
		},
		grid: [
			{
				left: "10%",
				right: "8%",
				height: "50%"
			},
			{
				left: "10%",
				right: "8%",
				top: "63%",
				height: "16%"
			}
		],
		xAxis: [
			{
				type: "category",
				data: data.categoryData,
				scale: true,
				boundaryGap: false,
				axisLine: { onZero: false },
				splitLine: { show: false },
				splitNumber: 20,
				min: "dataMin",
				max: "dataMax",
				axisPointer: {
					z: 100
				}
			},
			{
				type: "category",
				gridIndex: 1,
				data: data.categoryData,
				scale: true,
				boundaryGap: false,
				axisLine: { onZero: false },
				axisTick: { show: false },
				splitLine: { show: false },
				axisLabel: { show: false },
				splitNumber: 20,
				min: "dataMin",
				max: "dataMax"
			}
		],
		yAxis: [
			{
				scale: true,
				splitArea: {
					show: true
				}
			},
			{
				scale: true,
				gridIndex: 1,
				splitNumber: 2,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false }
			},
			{
				type: "value",
				name: "换手率",
				scale: true,
				interval: 5,
				axisLabel: {
					formatter: "{value} °%"
				}
			}
		],
		dataZoom: [
			{
				type: "inside",
				xAxisIndex: [0, 1],
				start: 0,
				end: 100
			},
			{
				show: true,
				xAxisIndex: [0, 1],
				type: "slider",
				top: "85%",
				start: 0,
				end: 100
			}
		],
		series: [
			{
				name: "当日信息",
				type: "candlestick",
				data: data.values,
				itemStyle: {
					color: upColor,
					color0: downColor,
					borderColor: null,
					borderColor0: null
				},
				tooltip: {
					formatter: params => {

						return "sss";
					}
				}
			},
			{
				name: "5均线",
				type: "line",
				data: calculateMA(5, data),
				smooth: true,
				symbolSize: 0, //拐点大小
				lineStyle: {
					opacity: 0.5
				}
			},
			{
				name: "10均线",
				type: "line",
				data: calculateMA(10, data),
				smooth: true,
				symbolSize: 0, //拐点大小
				lineStyle: {
					opacity: 0.5
				}
			},
			{
				name: "20均线",
				type: "line",
				data: calculateMA(20, data),
				smooth: true,
				symbolSize: 0, //拐点大小
				lineStyle: {
					opacity: 0.5
				}
			},
			{
				name: "30均线",
				type: "line",
				data: calculateMA(30, data),
				smooth: true,
				symbolSize: 0, //拐点大小
				lineStyle: {
					opacity: 0.5
				}
			},
			{
				name: "成交量",
				type: "bar",
				xAxisIndex: 1,
				yAxisIndex: 1,
				data: data.volumes
			},
			{
				name: "换手率",
				type: "line",
				lineStyle: {
					color: "#fff",
					width: 1,
					type: "solid"
				},
				smooth: false,
				symbolSize: 5, //拐点大小
				yAxisIndex: 2,
				data: data.turnOver
			}
		]
	}
	const op2 =   {
			xAxis: {
				type: "category",
				data: data.categoryData
			},

			yAxis: [
				{
					type: "value"
				}
			],
			series: [
				{
					name: "MACD",
					type: "bar",
					itemStyle: {
						normal: {
							//好，这里就是重头戏了，定义一个list，然后根据所以取得不同的值，这样就实现了，
							color: function(params) {
								return params.value > 0 ? "#C1232B" : "#20c107";
							},
							//以下为是否显示，显示位置和显示格式的设置了
							label: {
								show: false,
								position: "top",
								//                             formatter: '{c}'
								formatter: "{b}\n{c}"
							}
						}
					},
					data: item.macd
				},
			]
		}

	return {op1,op2}
}

//调用路由，进行页面渲染
app.get('/html',function(request,response){
	const {code} = request.query
	//调用渲染模板
	let sql = `select * from kline where share_code = '${code}' `
	conn(sql).then(re=>{
		const list = re.map(item=>{
			item.kline = JSON.parse(item.kline)
			item.code = item.share_code
			item.name = item.share_name
			item.macd = JSON.parse(item.macd)
			item.last = JSON.parse(item.last)
			item.lianban = JSON.parse(item.lianban)
			return item
		})

		if(list.length==1){
			const ops = getData(list[0])

			response.render('index.html',{
				//传参
				title:'首页1', content:JSON.stringify(ops)
			});
		}else {
			response.render('error.html',{
				//传参
				title:'错误', content:'暂无数据'
			});
		}


	}).catch(e=>{
		response.render('error.html',{
			//传参
			title:'错误', content:'暂无数据'
		});

	})


});

const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()

let chart

Page({
    data: {
        appName: app.globalData.appName,
        statusBarHeight: app.globalData.statusBarHeight,
        color: "#fafafa",//app.globalData.color,

        sequence: {},
        onInitChart (F2, config){
            chart = new F2.Chart(config)
            console.debug(`图表初始化完成...`)
            // 注意：需要把chart return 出来
            return chart
        }
    },
    onLoad (options) {
        let index = options.index == undefined ? 0: parseInt(options.index)
        util.debug(`查看${index}的详情...`)
        store.fromFile("daily.sequence.json", items=>{
            let sequence = items[parseInt(index)] || {name:"未知序列", data:[]}
            sequence.data || sequence.data.reverse()
            sequence.avg = util.avg(sequence.data, 'v')
            console.debug(sequence)
            this.setData({ sequence })

            setTimeout(this.drawChart, 1000)
        })
    },
    drawChart (){
        console.debug(`开始渲染...`)
        let values = []
        const data = this.data.sequence.data.map(d => {
            values.push(d.v)
            return {
                value: parseInt(d.v),
                date: d.k.split(" ")[0]
            }
        })
        // const data = [
        //     { genre: 'Sports', sold: 275 },
        //     { genre: 'Strategy', sold: 115 },
        //     { genre: 'Action', sold: 120 },
        //     { genre: 'Shooter', sold: 350 },
        //     { genre: 'Other', sold: 150 },
        // ]
        let max = Math.max(...values)*1.1
        let min = Math.min(...values)/1.2
        console.log(data, max, min)
        chart.source(data, {
            date: {
                type: 'timeCat',
                range: [ 0, 1 ],
                tickCount: 3
            },
            value: {
                max, min,
                tickCount: 4
            }
        })
        chart.line().position('date*value')
        chart.render();
    }
})
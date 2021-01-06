const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()

let chart

Page({
    data: {
        appName: app.globalData.appName,
        statusBarHeight: app.globalData.statusBarHeight,
        color: "#f1f2f3",//app.globalData.color,

        loading: true,

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
            if(sequence.data && sequence.data.reverse)
                sequence.data = sequence.data.reverse()
            sequence.avg = util.avg(sequence.data, 'v')
            console.debug(sequence)
            this.setData({ sequence })

            //延迟4秒左右再进行图表的绘制，避免 chart 还未初始化（不得不吐槽下 f2-wx 的这个设计，默认不正常延迟）
            setTimeout(this.drawChart, 3000 + parseInt(Math.random()*1000))
        })
    },
    drawChart (){
        let { sequence } = this.data
        let values = []
        const data = this.data.sequence.data.map(d => {
            values.push(d.v)
            return {
                value: parseInt(d.v),
                date: d.k.split(" ")[0]
            }
        })
        let max = parseInt(Math.max(...values)*1.1)
        let min = parseInt(Math.min(...values)/1.2)

        chart.source(data, {
            date: {
                type: 'timeCat',
                range: [ 0, 1 ],
                tickCount: data.length
            },
            value: {
                max, min,
                tickCount: 4
            }
        })

        chart.axis('date', {
            label: function label(text, index, total) {
                const textCfg = {}
                if (index === 0) {
                    textCfg.textAlign = 'left'
                } else if (index === total - 1) {
                    textCfg.textAlign = 'right'
                }
                return textCfg
            }
        })
        //显示平均线
        chart.guide().line({
            start: ['min', sequence.avg],
            end: ['max', sequence.avg],
            style: {
                stroke: '#d0502d',
                lineDash: [ 1, 3, 3 ], // 虚线的设置
                strokeOpacity: 0.6, // 辅助框的背景透明度
                lineWidth: 1,
                lineCap: 'round'
            }
        })
        chart.line().position('date*value').shape('smooth')//.color(app.globalData.color)
        chart.point().position('date*value').shape('smooth').style({
            stroke: '#fff',
            lineWidth: 1
        })

        this.setData({ loading: false })
        chart.render()
    }
})
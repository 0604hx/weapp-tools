const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()
const FILE = "daily.sequence.json"

let index = -1
let chart
let chartLoaded = false

let computeSpan = items=>{
    try{
        let timeSpan = new Date(items[0].k).getTime() - new Date(items[items.length-1].k).getTime()
        return (timeSpan/1000/3600/24).toFixed(1)+" 天"
    }
    catch(e){
        return "无"
    }
}

let updateCount = 0
let onUpdate = (reset=false)=>{
    if(reset == true)   
        updateCount = 0
    else
        updateCount ++
}

Page({
    data: {
        appName: app.globalData.appName,
        statusBarHeight: app.globalData.statusBarHeight,
        color: "#f1f2f3",//app.globalData.color,

        loading: true,

        sequence: {},
        avg:NaN,
        max:NaN,
        min:NaN,
        span:"",        //时间跨度
        onInitChart (F2, config){
            chart = new F2.Chart(config)
            console.debug(`F2-chart 创建成功...`)
            // 注意：需要把chart return 出来
            return chart
        },

        editShow: false,
        editIndex:-1,
        date:"",
        value:""
    },
    onLoad (options) {
        index = options.index == undefined ? 0: parseInt(options.index)
        chartLoaded = false
        store.fromFile(FILE, items=>this.refreshWithData(items[index] || {name:"未知序列", data:[]}))
    },
    onHide (){
        this.saveData()
    },
    onUnload (){
        this.saveData()
    },
    refreshWithData (sequence, reverse=true){
        if(reverse==true && sequence.data && sequence.data.reverse)
            sequence.data = sequence.data.reverse()
        let values = sequence.data.map(s=> s.v)

        let span = ""
        //计算时间跨度
        if(sequence.data.length>1){
            span = computeSpan(sequence.data)
        }
        
        this.setData({ 
            sequence, 
            span,
            editShow: false,
            avg: util.avg(values),
            max: Math.max(...values),
            min: Math.min(...values)
        })

        console.debug(`更新序列：`, this.data)
        /*
            延迟3秒左右再进行图表的绘制，避免 chart 还未初始化（不得不吐槽下 f2-wx 的这个设计，默认不正常延迟）
            
            另外一种更便利的做法：
                1、将 drawChart 函数赋值到全局变量（参考 chart 对象）
                2、F2-chart 初始化完成后，执行上述全局方法
         */
        if(chartLoaded)
            this.drawChart()
        else
            setTimeout(this.drawChart, 2000 + parseInt(Math.random()*1000))
    },
    drawChart (){
        let { max, min, avg } = this.data
        const data = this.data.sequence.data.map(d => {
            return {
                value: parseInt(d.v),
                date: d.k.split(" ")[0]
            }
        })
        if(chartLoaded) 
            chart.clear()
        
        chart.source(data, {
            date: {
                type: 'timeCat',
                range: [ 0, 1 ],
                tickCount: data.length
            },
            value: {
                max: parseInt(max*1.1), 
                min: parseInt(min/2),
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
            start: ['min', avg],
            end: ['max', avg],
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

        
        if(!chartLoaded){
            chartLoaded = true
        }
        this.setData({ loading: false })
        console.debug(`绘制图表...`)
        chart.render()
    },
    toEdit (e){
        if(e.type == 'close')   return this.setData({ editShow: false })

        let { editShow } = this.data
        if(editShow){
            let { sequence, editIndex, date, value } = this.data
            let { type } = e.target.dataset
            if(type == 'edit'){
                sequence.data[editIndex] = { k:date, v: value}
            }
            else if(type == 'delete'){
                sequence.data.splice(editIndex, 1)
            }
            else
                return util.warn(`无效操作`)

            this.refreshWithData(sequence, false)
            util.ok(`操作成功`)

            onUpdate()
        }
        else{
            let editIndex = e.target.dataset.index
            let item = this.data.sequence.data[editIndex]
            this.setData( {editIndex , editShow:true, date: item.k, value:item.v })
        }
    },
    /**
     * 持久化数据到文件
     */
    saveData (){
        if(updateCount <= 0)    return

        util.debug(`[SEQUENCE-DETAIL] 检测到有 ${updateCount} 处数据变动，即将持久化数据...`)
        store.fromFile(FILE, items=>{
            let { sequence } = this.data
            if(sequence.data.reverse)   sequence.data.reverse()

            items[index] = sequence
            store.toFile(FILE, items, res=>{
                onUpdate(true)
                util.debug(`时序数据保存成功`, res)
            })
        })
    }
})
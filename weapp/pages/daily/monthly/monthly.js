const util = require("../../../utils/util")
const app = getApp()

const HISTORY = "history"

const demoData = {
    "loan": [
        { 
            name:"万科城房贷", 
            begin:"2018-01-01",                 
            end:"2048-01-01",
            amount: 330000,      
            day:15, 
            value:1867
        },
        { 
            name:"天誉花园房贷", 
            begin:"2018-10-01",                 
            end:"2038-10-01",
            amount: 100000,      
            day:28, 
            value:745
        }
    ],
    "history": {
        "202012" : { 
            total: 9000, 
            items: [
                { name:"万科城房贷", day: 15, value: 1867, done: 14 },
                { name:"天誉花园房贷", day: 28, value: 745, done: 28 },
                { name:"兴业信用卡", day: 16, value: 2550, done: 15 }
            ]
        }
    }
}

/**
 * 构建日期字符串，格式为 YYYYMM
 * @param {*} step 
 */
let buildMonthDate = (step=0)=>{
    let d = new Date()
    d.setMonth(d.getMonth() + step)

    return `${d.getFullYear()}${util.formatNumber(d.getMonth())}`
}

Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        color: app.globalData.color, //#fcfcfc

        loading: true,
        items:[],
        monthTotal: 0,                    //本月共计
        monthRemain: 0,                 //本月剩余
        compareLast:0,                   //环比上个月

        menuShow: false,
    },
    onLoad (optinos) {
        this._onData(demoData)
    },
    _onData (d){
        //判断是否存在本月数据
        let month = buildMonthDate()
        if(!d.loan) d.loan = []
        let { history, loan } = d

        if(!history[month]){
            console.debug(`检测到本月无数据，即将自动创建...`)
            let monthData = { total: 0, items: []}
            loan.forEach(l=>{
                monthData.total += l.value
                monthData.items.push({ name: l.name, value: l.value, day: l.day, done: ""})
            })
            history[month] = monthData

            util.warn(`本月清单已创建`)
        }
        
        let monthD = history[month]
        let monthRemain = monthD.items.filter(i=> !i.done).map(t=> t.value).reduce((prev, next)=> prev+next)
        let compareLast = 0
        let lastMonth = buildMonthDate(-1)
        if(history[lastMonth]){
            //计算上个月的总金额
            lastMonth = monthD.total - history[lastMonth].total
        }
        this.setData({ items: monthD.items, monthTotal: monthD.total, monthRemain, compareLast })
    },
    toMenu (e){
        if(e.type=='close') return this.setData({ menuShow: false })
    }
})
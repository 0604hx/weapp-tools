const util = require("../../../utils/util")
const { md5 } = require("../../../utils/secret")
const app = getApp()

const LOAN_PAGE = '/pages/daily/monthly/loan'
let originData = {}          //原始数据
let originMd5 = ""

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
let buildMonthDate = (step=0, date)=>{
    let d = date? new Date(date): new Date()
    d.setMonth(d.getMonth() + step)

    return `${d.getFullYear()}${util.formatNumber(d.getMonth()+1)}`
}

Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        color: app.globalData.color, //#fcfcfc

        loanUrl: LOAN_PAGE,
        month: "",

        loading: true,
        items:[],
        monthTotal: 0,                    //本月共计
        monthRemain: 0,                 //本月剩余
        compareLast:0,                   //环比上个月

        menuShow: false,
        curMonth: new Date().getTime(),
    },
    onLoad (optinos) {
        console.debug(`onLoad....`, optinos)
        let month = buildMonthDate()
        originData = demoData
        originMd5 =  md5(originData)

        this.setData({ month })
        //如果没有贷款信息，则弹出对话框询问是否跳转到贷款管理页面
        if(!originData.loan || !originData.loan.length > 0){
            originData.loan = []
            util.confirm(`暂无贷款信息`, `系统检测到还没录入贷款信息，现在去录入吗？`, ()=> this.toLoan())
        }
        this._onData()
    },
    onShow (e){
        if(app.globalData.loans){
            console.debug(`检测到 app.globalData.loans 存在...`)
            if(md5(JSON.stringify(app.globalData.loans)) != md5(JSON.stringify(originData.loans))){
                console.debug(`检测到 loans 数据有变动...`)
                originData.loans = app.globalData.loans

                this._onData()
            }
            delete app.globalData.loans
            console.debug(originData)
        }
    },
    onHide (){
        this.saveData()
    },
    onUnload (){
        this.saveData()
    },
    _onData (){
        //判断是否存在本月数据
        let { month } = this.data
        let { history } = originData

        if(!history[month]){
            console.debug(`检测到本月无数据，即将自动创建...`)
            this._refreshMonth()
        }
        
        this._figureData(history, month)
    },
    _figureData (history, month){
        let monthD = history[month]
        let monthRemain = monthD.items.filter(i=> !i.done).map(t=> t.value).reduce((prev, next)=> prev+next)
        let compareLast = 0
        let lastMonth = buildMonthDate(-1, month)
        if(history[lastMonth]){
            //计算上个月的总金额
            lastMonth = monthD.total - history[lastMonth].total
        }

        this.setData({ items: monthD.items, monthTotal: monthD.total, monthRemain, compareLast })
    },
    /**
     * 刷新本月还款信息
     */
    refreshMonth (){
        util.confirm(`刷新还款信息`, `刷新后将覆盖现有的数据，确定吗？`, this._refreshMonth)
    },
    _refreshMonth (){
        let month = buildMonthDate()
        let { history, loan } = originData
        let monthData = { total: 0, items: []}
        loan.forEach(l=>{
            monthData.total += l.value
            monthData.items.push({ name: l.name, value: l.value, day: l.day, done: ""})
        })
        history[month] = monthData

        util.warn(`本月清单已创建`)

        this._figureData(history, month)
    },
    toMenu (e){
        if(e.type=='close') return this.setData({ menuShow: false })
        
        let data = { menuShow: true }
        this.setData(data)
    },
    /**
     * 跳转到贷款管理页面
     * 将贷款数据赋值到 app.globalData 中
     */
    toLoan (){
        app.globalData.loans = originData.loan
        app.jumpTo(LOAN_PAGE)
    },
    onMonthSelect (e){
        console.debug(`日期选择：`, e)
        let month = buildMonthDate(0, e.detail)
        this.setData({ curMonth: e.detail, month, menuShow: false })

        this._figureData(originData.history, month)
    },
    saveData (){
        if(md5(originData) != originMd5){
            console.debug(`数据变动...`)
        }
    }
})
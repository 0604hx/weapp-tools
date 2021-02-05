const util = require("../../../utils/util")
const store = require("../../../utils/store")
const { md5 } = require("../../../utils/secret")
const app = getApp()

const LOAN_PAGE = '/pages/daily/monthly/loan'
let originData = {loan:[], history:{}}          //原始数据
let originMd5 = ""
let visitLoan = false

/**
 * 构建日期字符串，格式为 YYYYMM
 * @param {*} step 
 */
let buildMonthDate = (step=0, date)=>{
    let d = date? new Date(date): new Date()
    d.setMonth(d.getMonth() + step)

    return `${d.getFullYear()}${util.formatNumber(d.getMonth()+1)}`
}
let buildItem = ()=>{
    return { name:"",value:0,day:1,done:"" }
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

        editShow:false,
        editIndex: -1,
        name:"",
        day:"",
        value:""
    },
    onLoad (optinos) {
        let month = buildMonthDate()
        this.setData({ month })

        store.fromFile("", items=>{
            if(!items.history)  items.history = {}

            originData = items
            originMd5 =  md5(items)

            this._onData()
        }, this._confirmToLoan)
    },
    onShow (e){
        if(app.globalData.loans){
            console.debug(`检测到 app.globalData.loans 存在...`)
            if(md5(JSON.stringify(app.globalData.loans)) != md5(JSON.stringify(originData.loans))){
                console.debug(`检测到 loans 数据有变动...`)
                // 运行时发现 app.globalData 中的数据可以双向绑定
                // originData.loan = app.globalData.loans

                this._onData()
            }
            delete app.globalData.loans
        }
        visitLoan = false
    },
    onHide (){
        this.saveData()
    },
    onUnload (){
        this.saveData()
    },
    _confirmToLoan (){
        util.confirm(`暂无贷款信息`, `系统检测到还没录入贷款信息，现在去录入吗？`, ()=> this.toLoan())
    },
    _onData (){
        //判断是否存在本月数据
        let { month } = this.data
        let { history, loan } = originData

        if(!history[month]){
            //如果没有贷款信息，则弹出对话框询问是否跳转到贷款管理页面
            if(!loan || !loan.length > 0){
                originData.loan = []
                this._confirmToLoan()
            }
            else{
                console.debug(`检测到本月无数据，即将自动创建...`)
                this._refreshMonth()
            }
        }
        else
            this._figureData(history, month)
    },
    _figureData (history, month){
        let monthD = history[month] || {items:[], total:0}
        let monthRemain = 0
        if(monthD.items.length)
            monthRemain = monthD.items.filter(i=> !i.done).map(t=> t.value).reduce((prev, next)=> prev+Number(next))
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
        let curMonth = buildMonthDate()
        let { month } = this.data
        if(month<curMonth)  return util.warn(`不能刷新历史月份的记录`)

        util.confirm(`刷新还款信息`, `刷新后将覆盖现有的数据，确定吗？`, ()=>{
            this.setData({ menuShow: false })
            this._refreshMonth(month)
        })
    },
    _refreshMonth (month){
        month = month || buildMonthDate()

        let { history, loan } = originData
        let monthData = { total: 0, items: []}
        loan.forEach(l=>{
            monthData.total += Number(l.value)
            monthData.items.push({ name: l.name, value: Number(l.value), day: Number(l.day), done: ""})
        })
        history[month] = monthData

        util.warn(`${month}清单已创建`)

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
        visitLoan = true
        app.globalData.loans = originData.loan
        
        app.jumpTo(LOAN_PAGE)
    },
    onMonthSelect (e){
        console.debug(`日期选择：`, e)
        let month = buildMonthDate(0, e.detail)
        this.setData({ curMonth: e.detail, month, menuShow: false })

        this._figureData(originData.history, month)
    },
    toAdd (e){
        let data = buildItem()
        data.editShow = true
        data.editIndex = -1
        this.setData( data )
    },
    toEdit (e){
        if(e.type == 'close')   return this.setData({ editShow: false })

        if(e.type == 'longpress'){
            let { index } = e.currentTarget.dataset
            let item = this.data.items[index]
            let data = Object.assign({ editIndex: index, editShow: true }, item)

            console.debug(`编辑index=${index}`, data)
            this.setData( data )
        }
        else{
            let { editIndex, items } = this.data
            let { type } = e.target.dataset
            //删除信息
            if(type == 'delete'){
                if(editIndex >= 0){
                    let name = items[editIndex].name
                    util.confirm(`删除还款信息`, `确定删除${name}这则还款信息吗？`, ()=> this.deleteDo(name))
                }
                else
                    util.warn(`请先保存还款信息`)
            }
            else if(type=='edit'){
                if(editIndex == -1){
                    items.push(buildItem())
                    editIndex = items.length - 1
                }

                util.copyTo(items[editIndex], this.data)
                this.setData({ items, editShow: false })
            }
        }
    },
    deleteDo (name){
        let { editIndex, items } = this.data
        items.splice(editIndex, 1)
        util.warn(`删除${name}`)
        
        this.setData({ items, editShow: false })
    },
    toDone (e){
        let { index } = e.target.dataset
        let item = this.data.items[index]
        item.done = item.done? "": new Date().getDate()

        let data = {}
        data[`items[${index}]`] = item
        this.setData( data )
        if(item.done)   
            util.ok(`${item.name}已还款`)
        else
            util.warn(`${item.name}未还款`)
    },
    saveData (){
        if(visitLoan)   return

        if(md5(originData) != originMd5){
            util.debug(`[MONTHLY] 检测到数据变动，即将持久化数据...`)

            store.toFile("", originData, res=> {
                util.debug(`每月还款记录保存成功`, res)
            })
        }
    }
})
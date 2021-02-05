const util = require("../../../utils/util")

const app = getApp()

let buildLoan = ()=>{
    let begin = util.getDate()
    return {
        name:"",
        value:0,
        begin,
        end: begin,
        amount:0,
        day:1
    }
}

Page({
    data: {
        items: [],
        activeList:[],
        tips:"长按可编辑数据",

        minDate: 0,
        maxDate: new Date("2099-01-01").getTime(),

        editShow: false,
        editIndex: -1,
        dateShow: false,
        dateKey: "",
        curDate:0,
    },
    onLoad (e){
        let data = buildLoan()
        data.items = app.globalData.loans || []
        this.setData( data )
    },
    onUnload (){
        console.debug("unLoad...", this.data.items, app.globalData.loans)
        app.globalData.loans = this.data.items
    },
    onChange (e){
        this.setData({ activeList: e.detail })
    },
    toAdd (e){
        let data = buildLoan()
        data.editShow = true
        data.editIndex = -1
        this.setData( data )
    },
    toEdit (e){
        console.debug(e)
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
                    util.confirm(`删除贷款信息`, `确定删除${name}吗？`, ()=> this.deleteDo(name))
                }
                else
                    util.warn(`这是新贷款信息哦`)
            }
            else if(type=='edit'){
                if(editIndex == -1){
                    items.push(buildLoan())
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
    onDate (e){
        let { key } = e.target.dataset
        if(e.type == 'click' && !this.data.dateShow){
            let curDate = new Date(this.data[key]).getTime()
            return this.setData({ dateShow: true, curDate, dateKey: key })
        }
        else if(e.type == 'cancel')  return this.setData({ dateShow: false })
        else if(e.type == 'confirm'){
            let data = { dateShow: false }
            data[this.data.dateKey] = util.getDate(new Date(e.detail))
            this.setData(data) 
        }

    }
})
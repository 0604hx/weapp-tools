const { copyTo } = require("../../../utils/util")
const util = require("../../../utils/util")

const app = getApp()

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

        //-------------------- START 贷款对象 --------------------
        name:"",
        value:0,
        begin:"",
        end:"",
        amount:0,
        day:1
        //-------------------- END 贷款对象 --------------------
    },
    onLoad (e){
        this.setData({ items: app.globalData.loans})
    },
    onChange (e){
        this.setData({ activeList: e.detail })
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
                let name = items[editIndex].name
                util.confirm(`删除贷款信息`, `确定删除${name}吗？`, this.deleteDo)
            }
            else if(type=='edit'){
                util.copyTo(items[editIndex], this.data)
                this.setData({ items, editShow: false })
            }
        }
    },
    deleteDo (){
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
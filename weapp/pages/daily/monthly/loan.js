const app = getApp()

Page({
    data: {
        items: [],
        activeList:[],
        tips:"长按可编辑数据",

        editShow: false,
        editIndex: -1,

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

    }
})
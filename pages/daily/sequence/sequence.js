const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()

let create = (name="")=>{
    return  {name, data:[] }
}
let createWithData = (name="")=>{
    return {name, data:[{k:"2021-01-03", v:"150"}, {k:"2021-01-04", v:"146"}]}
}
Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        
        items: [createWithData("体重"), create("身高")],

        name:"",
        editIndex: -1,
        addShow: false
    },
    onLoad (e){
        util.debug(`时序页面加载完成`)
        store.fromFile("", items=>{
            util.debug(`时序数据加载完成...`)
            this.setData({items})
        })
    },
    toDelete (e){
        let index = e.target.dataset.index
        let { items } = this.data
        let item = items[index]
        util.confirm(`删除数据项`, `确定删除数据项"${item.name}"吗（操作无法撤销）？`, ()=>{
            items.splice(index, 1)
            this.setData({items})
            util.ok(`删除成功`)
        })
    },
    toAdd (e){
        console.log(e)
        if(e.type == 'close')   return this.setData({ addShow: false })

        let { addShow, editIndex, items, name } = this.data

        if(addShow){
            if(!name)   return util.warn(`名称不能为空`)

            //编辑
            if(editIndex >= 0){
                items[editIndex].name = name
            }
            else
                items.push(create(name))
            this.setData({ items, addShow:false, name:"" })
            //更新数据
            util.debug(`编辑完成，即将持久化到文件...`)
            store.toFile("", items, res=> util.debug(`时序数据保存成功`, res))
        }
        else{
            editIndex = e.target.dataset.index
            if(editIndex == undefined)  editIndex = -1
            name = editIndex>=0? items[editIndex].name : ""

            console.debug(`数据项：`, editIndex, name)
            this.setData({ addShow : true, editIndex , name })
        }
    }
})
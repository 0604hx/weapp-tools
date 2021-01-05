const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()

let create = (name="")=>{
    return  {name, data:[] }
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
        statusBarHeight: app.globalData.statusBarHeight,
        
        items: [],

        name:"",
        editIndex: -1,
        addShow: false,
        inputUp
    },
    onLoad (e){
        store.fromFile("", items=>{
            this.setData({items})
            onUpdate(true)
        })
    },
    onHide (){
        if(updateCount > 0){
            util.debug(`检测到有 ${updateCount} 处数据变动，即将持久化数据...`)
            this.saveData()
        }
    },
    toDelete (e){
        let index = e.target.dataset.index
        let { items } = this.data
        let item = items[index]
        util.confirm(`删除数据项`, `确定删除数据项"${item.name}"吗（操作无法撤销）？`, ()=>{
            items.splice(index, 1)
            this.setData({items})
            util.ok(`删除成功`)
            onUpdate()
        })
    },
    toAdd (e){
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
            onUpdate()
        }
        else{
            editIndex = e.target.dataset.index
            if(editIndex == undefined)  editIndex = -1
            name = editIndex>=0? items[editIndex].name : ""

            console.debug(`数据项：`, editIndex, name)
            this.setData({ addShow : true, editIndex , name })
        }
    },
    toInput (){

    },
    /**
     * 持久化数据到文件
     */
    saveData (){
        store.toFile("", items, res=> {
            onUpdate(true)
            util.debug(`时序数据保存成功`, res)
        })
    }
})
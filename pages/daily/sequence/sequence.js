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
        inputShow: false,       //是否显示输入框
        value: ""
    },
    onLoad (e){
        store.fromFile("", items=>{
            this.setData({items})
            onUpdate(true)
        })
    },
    onHide (){
        console.debug(`onHide 触发...`)
        if(updateCount > 0){
            util.debug(`检测到有 ${updateCount} 处数据变动，即将持久化数据...`)
            this.saveData()
        }
    },
    onUnload (){
        console.debug(`onUnload 触发...`)
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

        let { addShow } = this.data

        if(addShow){
            let { editIndex, items, name } = this.data
            if(!name)   return util.warn(`名称不能为空`)
            //判断是否重复
            if(items.findIndex(t=> t.name==name) != editIndex)  return util.warn(`${name}已存在`)

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
            this._showDialog(e, { addShow: true })
        }
    },
    toInput (e){
        console.debug(e)
        if(e.type == 'close')   return this.setData({ inputShow: false })

        let { inputShow } = this.data
        if(inputShow){
            let { editIndex, items, value } = this.data
            if(!!value){
                let data = items[editIndex].data
                data.push({k: util.getDateTime(), v: value})

                let update = { inputShow: false }
                update[`items[${editIndex}].data`] = data
                this.setData(update)

                onUpdate()
            }
            else
                util.warn(`数据不能为空`)
        }
        else{
            this._showDialog(e, { inputShow: true })
        }

    },
    _showDialog (e, ps){
        let editIndex = e.target.dataset.index
        if(editIndex == undefined)  editIndex = -1
        let name = editIndex>=0? this.data.items[editIndex].name : ""

        this.setData(Object.assign(ps, {editIndex , name }))
    },
    /**
     * 持久化数据到文件
     */
    saveData (){
        store.toFile("", this.data.items, res=> {
            onUpdate(true)
            util.debug(`时序数据保存成功`, res)
        })
    }
})
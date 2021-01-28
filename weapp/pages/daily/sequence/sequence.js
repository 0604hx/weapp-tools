const util = require("../../../utils/util")
const store = require("../../../utils/store")

const app = getApp()

let create = (name="", key=0)=>{
    return  {name, key, data:[] }
}
let buildKey = key=>{
    if(key == 0|| key == undefined)    return util.getDateTime()
    
    let d = new Date()
    let yAndMonth = `${d.getFullYear()}-${util.formatNumber(d.getMonth()+1)}`
    return key == 1 ? `${yAndMonth}-${util.formatNumber(d.getDate())}` : key == 2 ? yAndMonth : `${d.getFullYear()}`
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
        color: app.globalData.color,
        statusBarHeight: app.globalData.statusBarHeight,
        
        items: [],

        name:"",
        key: 0,         //主键格式
        keys: ["默认", "年月日", "年月", "年"],

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
    // navigateBack 方式页面切换时只触发 onUnload 而不触发 onHide 故监听两个事件...
    onHide (){
        this.saveData()
    },
    onUnload (){
        this.saveData()
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
            let { editIndex, items, name, key } = this.data
            if(!name)   return util.warn(`名称不能为空`)
            //判断是否重复
            if(items.findIndex(t=> t.name==name) != editIndex)  return util.warn(`${name}已存在`)

            //编辑
            if(editIndex >= 0){
                items[editIndex].name = name
                items[editIndex].key = key
            }
            else
                items.push(create(name, key))
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
                data.push({k: buildKey(items[editIndex].key), v: value})

                let update = { inputShow: false }
                update[`items[${editIndex}].data`] = data
                this.setData(update)

                onUpdate()
            }
            else
                util.warn(`数据不能为空`)
        }
        else{
            this._showDialog(e, { inputShow: true, value:"" })
        }

    },
    onKeySelect (e){
        this.setData({key: parseInt(e.detail.value)})
    },
    _showDialog (e, ps){
        let editIndex = e.target.dataset.index
        if(editIndex == undefined)  editIndex = -1

        let { items } = this.data
        let name = editIndex>=0? items[editIndex].name : ""
        let key = editIndex>=0? items[editIndex].index : 0

        this.setData(Object.assign(ps, {editIndex , name, key }))
    },
    /**
     * 持久化数据到文件
     */
    saveData (){
        if(updateCount <= 0)    return
        util.debug(`[SEQUENCE] 检测到有 ${updateCount} 处数据变动，即将持久化数据...`)

        store.toFile("", this.data.items, res=> {
            onUpdate(true)
            util.debug(`时序数据保存成功`, res)
        })
    }
})
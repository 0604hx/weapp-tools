const store = require("../../../utils/store/index")
const util = require("../../../utils/util")
// 赋值到 wx 方便调试
// wx.store = store

let createPwd = ()=> {
    return {type: 0, site:"", name:"", mima:""}
}

const categories = [
    { value:0, color:"#07c160", text:"生活" },
    { value:1, color:"#1989fa", text:"工作" },
    { value:2, color:"#ff976a", text:"其他" }
]

const hideChars = {'site':"☆", mima:"▆", name:"☆"}    //▆ ▅ □ ☆

/**
 * 填充颜色（增加 color 字段到数组元素中）
 * @param {*} items 
 */
let fixColor = items=>{
    items.forEach(v=>{
        let category = categories.find(c=> c.value == v.type)
        if(!!category)
            v.color = category.color
    })
}

let loadData = cb=>{
    store.fromStorage("", items=>{
        fixColor(items)
        cb(items)
    })
}

Page({
    data: {
        //=========== 常量 ===========
        categories,
        //=========== 常量 ===========

        keyword:"",
        searchShow: false,

        pwdShow: false,
        working: false,
        
        index:undefined,    //当前编辑序号
        type:"",
        site:"",
        name:"",
        mima:"",
        items:[]
    },
    onLoad: function (options) {
        loadData(items=> this.setData({items}))
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
        this.setData({searchShow: true})
    },
    onSearch (e){
        if(!e || !e.detail) return this.setData({searchShow: false})
        console.debug(`搜索`, e.detail)
    },
    onTypeSelect (e){
        this.setData({type: parseInt(e.detail.value)})
    },
    toDetail (e){
        let { pwdShow } = this.data
        if(!!pwdShow)   return this.setData({pwdShow: false})

        //判断 index
        let index = e.target.dataset.index
        // index 为空则为新建密码
        let data = index == undefined? createPwd() : this.data.items[index]
        data.pwdShow = true
        data.index = index
        this.setData(data)
    },
    insertStar (e){
        let field = e.target.dataset.field
        let v = this.data[field]
        v+= hideChars[field] || "*"
        let update = {}
        update[field] = v
        this.setData(update)
    },
    _updateItemsAndHide (items){
        //同步到本地缓存
        store.toStorage("", items)
        this.setData({items, pwdShow: false})
    },
    /**
     * 保存密码，流程：
     * 1、保存到本地（store、文件）
     * 2、判断是否需要上传到云，若需要则执行云备份
     * 
     * 注意：
     *      目前暂不考虑内容安全检测
     */
    onSave (){
        let { index, site, name, mima, type, items } = this.data
        let item = { site, name, mima, type }
        if(index >= 0){
            items[index] = item
        }
        else
            items.push(item)

        this._updateItemsAndHide(items)
    },
    onRemove (){
        let { items, index } = this.data
        util.confirm(`删除密码`, `确定删除"${items[index].site}"的密码项吗？`, ()=>{
            items.splice(index, 1)

            this._updateItemsAndHide(items)
        })
    }
})
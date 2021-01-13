const store = require("../../../utils/store")
const util = require("../../../utils/util")
const { aes, md5 } = require("../../../utils/secret")

let createPwd = ()=> {
    return {type: 0, site:"", name:"", mima:""}
}

const categories = [
    { value:0, color:"#07c160", text:"生活" },
    { value:1, color:"#1989fa", text:"工作" },
    { value:2, color:"#ff976a", text:"其他" }
]
const tips = `账号/密码建议使用提示字符+隐秘符号（记忆辅助，点击输入框右侧星星可插入）的方式存储，如 ironman 记为 ir▆▆▆▆n`

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

/*
用于加解密数据的密钥，保存到临时文件中
考虑到可能持久化密钥，这里进行 md5 加密
*/
let aesKey = ""

let tmpItems = []

Page({
    data: {
        //=========== 常量 ===========
        categories,
        tips,
        //=========== 常量 ===========

        keyword:"",
        searchShow: false,

        pwdShow: false,
        working: false,
        
        editIndex:undefined,    //当前编辑序号
        type:"",
        site:"",
        name:"",
        mima:"",
        items:[],

        //=========== 数据加密 ===========
        lockShow:"",
        lockKey: "",
        needReload: false
    },
    onLoad: function (options) {
        this._loadData()
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
        this.setData({searchShow: true})
    },
    _loadData (){
        store.fromStorage("", data=>{
            let items = undefined
            //如果以 [ 开头就是明文
            if(util.isJSONArrayText(data)){
                items = JSON.parse(data)
            }else {
                let needToInputPwd = true
                if(aesKey){
                    //尝试解密
                    try{
                        let rawText = aes.decrypt(aesKey, data)
                        if(util.isJSONArrayText(rawText)){
                            items = JSON.parse(rawText)
                            needToInputPwd = false
                        }
                    }catch(decryptE){
                        console.error(`解密数据出错：`, decryptE.message)
                    }
                }

                if(needToInputPwd){
                    if(!this.data.lockShow){
                        //此处设置延迟执行，否则将出现 dialog 错误
                        setTimeout(this.toLock, 200)
                    }
                    this.setData({needReload: true})
                    return util.warn(`请输入查看密码`)
                }
            }
    
            if(Array.isArray(items)){
                if(this.data.keyword){
                    items = items.filter(v=> `${v.site}${v.name}`.indexOf(this.data.keyword)>-1)
                }
                fixColor(items)
                this.setData({ items })
            }
        })
    },
    onSearch (e){
        let { keyword } = this.data
        let needRefresh = false
        if(!e || !e.detail){
            needRefresh = !!keyword
            keyword = ""
            this.setData({searchShow: false})
        }
        else{
            needRefresh = keyword != e.detail
            keyword = e.detail
            console.debug(`搜索`, e.detail)
        }
        
        this.setData({ keyword })
        if(needRefresh)
            this._loadData()
    },
    onTypeSelect (e){
        this.setData({type: parseInt(e.detail.value)})
    },
    toDetail (e){
        let { pwdShow } = this.data
        if(!!pwdShow)   return this.setData({pwdShow: false})

        //判断 index
        let editIndex = e.target.dataset.index
        // index 为空则为新建密码
        let data = editIndex == undefined? createPwd() : this.data.items[editIndex]
        data.pwdShow = true
        //2021年1月9日 实测当 editIndex 为 undefined 时调用 setData 无法正常在视图层更新 editIndex 相关组件，故换为-1
        data.editIndex = editIndex==undefined? -1: editIndex
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
    _updateItemsAndHide (items, cb){
        if(items == undefined)
            items = this.data.items
        
        //同步到本地缓存
        this.setData({working: true})

        let data = JSON.stringify(items)
        console.log(aesKey, items)
        if(aesKey && items.length){
            //加密
            data = aes.encrypt(aesKey, data)
        }

        store.toStorage("", data, ()=>{
            this.setData({items, pwdShow: false, working: false})
            !cb || cb()
        })
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
        let { editIndex, site, name, mima, type, items } = this.data
        if(!( site && name))    return util.warn(`平台及登录账号不能为空`)

        let item = { site, name, mima, type }
        if(editIndex >= 0){
            items[editIndex] = item
        }
        else
            items.push(item)

        fixColor(items)
        this._updateItemsAndHide(items)
    },
    onRemove (){
        let { items, editIndex } = this.data
        util.confirm(`删除密码`, `确定删除"${items[editIndex].site}"的密码项吗？`, ()=>{
            items.splice(editIndex, 1)

            this._updateItemsAndHide(items)
        })
    },
    toLock (e){
        let { lockShow } = this.data
        if(lockShow)    return this.setData({ lockShow: false })

        this.setData({ lockShow: true })
    },
    /**
     * 输入密码后回调
     * 此时需要更新数据（如果有密码则先加密）
     * @param {*} e 
     */
    onLockPwdSet (e){
        let { needReload, lockKey } = this.data
        aesKey = !!lockKey? md5(lockKey): ""
        // 如果是需要重新加载数据
        if(needReload == true) return this._loadData()

        // 此时为加密数据
        this._updateItemsAndHide(undefined, ()=> util.ok(`数据加密成功，请妥善保管密码`))
    }
})
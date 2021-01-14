const util = require("../../utils/util")
const app = getApp()

let KEY = "NOTICES"

if(!app.getNoticeConfig){
    console.debug(`[NOTICE] 注册 APP 全局函数 getNoticeConfig、saveNoticeConfig...`)
    app.getNoticeConfig = function(key){
        this.noticeConfig = this.noticeConfig || (wx.getStorageSync(KEY) || {})
        return this.noticeConfig[key]
    }

    /**
     * @param {*} key 
     * @param {*} del       是否删除，当为 true 且 key 为空时则情况全部
     */
    app.saveNoticeConfig = function(key,del=false, storage=true){
        if(del==true){
            if(!!key)
                delete this.noticeConfig[key]
            else
                this.noticeConfig = {}
        }
        else
            this.noticeConfig[key] = 1
        wx.setStorage({
          data: this.noticeConfig,
          key: KEY,
          success: res=> console.debug(`[NOTICE] 记录同步成功...`)
        })
    }
}

let ONCE = "once"
let ALWAYS = "always"
let NONE = "none"

let isOnce = c=> c==ONCE

Component({
    properties: {
        uuid: {type:String, value:""},
        close:{type:String, value: ONCE},
        color:{type:Boolean, value: false},     //是否使用主题色（app.globalData.color）
    },
    data: {
        show: false,
        textColor: "#657180"
    },
    methods: {
        onClose (e){
            let { uuid, close } = this.data
            if(isOnce(close)){
                app.saveNoticeConfig(uuid)
            }
            this.setData({ show: false })
        }
    },
    lifetimes: {
        attached (){
            let { uuid, close, color } = this.data
            if(!uuid){
                uuid = util.buildUrlKey()
                this.data.uuid = uuid
            }
            console.debug(`[NOTICE] Notice组件创建，UUID=${uuid} 关闭策略=${close}`)
            let data = { show:app.getNoticeConfig(uuid) && isOnce(close)? false: true }
            if(color==true && app.globalData.color)
                data.textColor = app.globalData.color
            this.setData( data )
        }
    }
})

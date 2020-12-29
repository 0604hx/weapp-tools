const util = require("../../../utils/util")
const app = getApp()

let SETTING = "SETTING"

let defaultConfig = () => {
    return {
        //------------------------ 云存储 ------------------------
        //阿里云 OSS
        OSS_ALI_ID: "",
        OSS_ALI_SECRET: "",
        OSS_BACKUP_PASSWORD: true,
    }
}

/**
 * 从缓存中加载系统配置
 * @param {*} global   true 则更新到全部变量中
 */
let loadConfig = (global = false) => {
    let configs = Object.assign(defaultConfig(), wx.getStorageSync(SETTING) || {})
    if (global)
        getApp().globalData.config = configs
    return configs
}
let saveConfig = (settings, onOk) => {
    let data = defaultConfig()
    util.copyTo(data, settings)
    wx.setStorage({
        data,
        key: SETTING,
        success: () => {
            getApp().globalData.config = data
            onOk()
        },
        fail: e => util.modal("保存失败", `尝试保存配置信息时出错：${e.errMsg}`)
    })
}

Page({
    data: {
        color: app.globalData.color
    },
    onLoad (e){
        let settings = loadConfig()
        console.debug(`加载配置文件...`, settings)
        this.setData(settings)
    },
    //根据 data-key 更新属性
    onSwitchChange(e) {
        let key = e.target.dataset.key
        let data = {}
        data[key] = e.detail
        this.setData(data)
    },
    onSave() {
        console.debug(this.data)
        saveConfig(this.data, ()=> util.ok("保存成功"))
    }
})
const util = require("./util")

let SETTING = "SETTING"
let CONFIG_KEY = "configKey"

/**
 * 定义了需要备份或者还原的数据对象
 *  id                      数据编号（通常是跟页面 url 相关联）
 *  name                 中文名称
 *  type                   类型，0=Storage，1=本地文件
 *  CONFIG_KEY      配置中的字段名，默认不用填写（系统由 id 自动计算得到）
 */
let DATAS = [
    { id:"daily.password", name:"个人密码本", type:0 },
    { id:"daily.sequence", name:"时序数据", type: 1},
    { id:"daily.monthly", name:"分期还款笔记", type: 1},
]

let defaultConfig = () => {
    let config = {
        //------------------------ 云存储 ------------------------
        //阿里云 OSS
        OSS_ALI_REGION:"shenzhen",
        OSS_ALI_ID: "",
        OSS_ALI_SECRET: ""
    }
    // 构建自动备份相关项目，并设置 CONFIG_KEY
    DATAS.forEach(d=> {
        let key = `BACKUP_${d.id.replace(".", "_")}`
        if(!(CONFIG_KEY in d))
            d[CONFIG_KEY] = key
        config[key] = false
    })
    return config
}

module.exports = {
    isEnable (data){
        let key = typeof(data)=='string'? data: data[CONFIG_KEY]
        return getApp().globalData.config[key] == true
    },
    dateBeans (){
        return DATAS
    },
    /**
     * 从缓存中加载系统配置
     * @param {*} global   true 则更新到全部变量中
     */
    load (global = false) {
        let configs = Object.assign(defaultConfig(), wx.getStorageSync(SETTING) || {})
        if (global)
            getApp().globalData.config = configs
        return configs
    },
    save (settings, onOk) {
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
}
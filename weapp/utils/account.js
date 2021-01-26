const util = require("./util")

/**
 * 
 */
let STATE = "account.state"

module.exports = {
    /**
     * 登录后保存信息到云
     * @param {*} userInfo      wx.getUserInfo 得到的数据对象
     * @param {*} cb 
     */
    dealWithLogin (userInfo, cb){
        let state = wx.getStorageSync(STATE) || {expire: 0}
        let time = new Date().getTime()
        //判断是否过期
        if(state.expire < time){
            //构建用户信息
            let sys = wx.getSystemInfoSync()
            let info = Object.assign(
                { action:"login",  brand: sys.brand, model: sys.model, system: sys.system, lastOn: time },
                userInfo
            )
            let app = getApp()
            let cacheMinutes = app.globalData.isDev? 24*60: 60        //开发模式下为 24 小时
            app.callCloud(
                'account', 
                info,
                data=>{
                    data.expire = time + cacheMinutes*60*1000     //缓存半小时
                    wx.setStorage({
                      data,
                      key: STATE,
                      success: !cb || cb(data)
                    })
                }
            )
        }
        else{
            console.debug(`用户信息于 ${util.formatTimestamp(state.expire)} 过期，本次跳过...`)
            cb(state)
        }
    }
}
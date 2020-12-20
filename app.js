const util = require("./utils/util")

let cloudInited = false

App({
    onLaunch: function () {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                console.debug(`LOGIN SUCCESS`, res)
            }
        })
        // 获取用户信息，本工具集暂不需要用户登录
        // wx.getSetting({
        //     success: res => {
        //         if (res.authSetting['scope.userInfo']) {
        //             // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //             wx.getUserInfo({
        //                 success: res => {
        //                     console.debug(`scope.userInfo SUCCESS`, res)
        //                     // 可以将 res 发送给后台解码出 unionId
        //                     this.globalData.userInfo = res.userInfo

        //                     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //                     // 所以此处加入 callback 以防止这种情况
        //                     if (this.userInfoReadyCallback) {
        //                         this.userInfoReadyCallback(res)
        //                     }
        //                 }
        //             })
        //         }
        //     }
        // })
    },
    onShow (e){
        console.debug(`页面显示`, e)
    },
    globalData: {
        userInfo: null,
        git: "https://github.com/0604hx/weapp-tools",
        color: ""
    },

    copyGit (){
        wx.setClipboardData({
            data: this.globalData.git,
            success: res => util.ok("网址已复制")
        })
    },
    /**
     * 调用云函数
     * @param {*} name         云函数名称
     * @param {*} data          参数
     * @param {*} callBack 
     */
    callCloud  (name, data, callBack){
        if(!cloudInited) {
            wx.cloud.init()
            cloudInited = true
            console.debug(`初始化云开发环境...`)
        }
    
        console.debug(`开始执行云函数调用 name=${name} ...`)
        wx.cloud.callFunction({
            name,
            data,
            success: (res)=>{
                console.debug(`来自云函数${name}的调用结果：`, res.result)
                callBack(res.result)
            },
            fail: err=>{
                console.error("云函数调用失败", err.errCode, err.errMsg)
                console.log(err)
            }
        })
    }
})
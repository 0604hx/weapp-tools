const util = require("./utils/util")

let cloudInited = false

App({
    onLaunch: function () {
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
    globalData: {
        appName: "集成工具集",
        statusBarHeight:wx.getSystemInfoSync()['statusBarHeight'],
        userInfo: null,
        git: "https://github.com/0604hx/weapp-tools",
        color: "#FFC835"
    },

    /*
    ================================================================================
    START 定义全局方法
    ================================================================================
    */
    jumpTo(url, ps = {}) {
        let path = url.indexOf("/pages") == 0 ? url : `/pages/${url}`
        if (ps && typeof (ps) == 'object') {
            path += "?" + Object.keys(ps).map(k => `${k}=${ps[k]}`).join("&")
        }
        wx.navigateTo({
            url: path
        })
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
const util = require("./utils/util")
const account = require("./utils/account")
const configure = require("./utils/configure")

let cloudInited = false

let systemInfo = wx.getSystemInfoSync()

App({
    onLaunch: function () {
        this.globalData.config = configure.load()

        // 获取用户信息，本工具集暂不需要用户登录
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    /*
                        已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        用户对象如下
                        {
                        avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/.....",
                        city: "",
                        country: "",
                        gender: 1,
                        language: "zh_CN",
                        nickName: "昵称",
                        province: ""
                        }
                     */
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.afterLogin(res.userInfo)

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        },
                        fail: e=>console.debug(`获取用户信息失败:`, e)
                    })
                }
            }
        })
    },
    globalData: {
        appName: "集成工具集",
        statusBarHeight: systemInfo['statusBarHeight'],
        userInfo: null,
        git: "https://github.com/0604hx/weapp-tools",
        color: "#FFC835",       // 另外可选颜色：#F4D000
        account: {},
        systemInfo,
        isDev: systemInfo.brand == 'devtools'
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
    todo() {
        util.warn("功能开发中，敬请期待")
    },
    /**
     * 登录成功后调用
     * 1、userInfo 赋值到 globalData 中
     * 2、调用云函数记录登录信息
     * @param {*} userInfo 
     */
    afterLogin (userInfo){
        console.debug(`getUserInfo SUCCESS`, userInfo.nickName)
        this.globalData.userInfo = userInfo

        account.dealWithLogin(userInfo, d=> {
            //对一些日期进行格式化
            if("createOn" in d) d.createOn = util.formatTimestamp(d.createOn)
            this.globalData.account = d
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
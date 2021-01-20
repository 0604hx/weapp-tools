const util = require("./utils/util")
const account = require("./utils/account")
const configure = require("./utils/configure")
const md5 = require("./utils/plugins/md5.min")

let cloudInited = false
let systemInfo = wx.getSystemInfoSync()
let cloudLimit = {
    enable: true,           //是否开启
    latest: 0,                //最后调用时间
    interval: 3,              //相邻两个云函数调用间隔下限，单位秒
    history: {}               //调用历史，key 为函数名，value 为 md5 后的参数
}

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

        //将 util 赋值到 window 对象方便开发过程中调试
        if(this.globalData.isDev){
            wx.util = util
            wx.store = require('./utils/store')
            console.debug(`注册全局对象 util、store 到 wx ...`)
        }
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
            this.globalData.account = d
        })
    },
    initCloud (){
        if(!cloudInited) {
            wx.cloud.init()
            cloudInited = true
            console.debug(`初始化云开发环境...`)
        }
    },
    /**
     * 调用云函数
     * 
     * 2021-01-13   增加调用频率、重复的限制
     *  
     * @param {*} name         云函数名称
     * @param {*} data          参数
     * @param {*} onOk 
     * @param {*} onFail
     */
    callCloud  (name, data, onOk, onFail){
        if(cloudLimit.enable){
            let isLimit = 0
            let time = new Date().getTime() 
            if(time - cloudLimit.latest < cloudLimit.interval * 1000){
                isLimit = 1
            }
            cloudLimit.latest   = time + 1000
            if(isLimit>0){
                util.warn(isLimit = 1?"操作太密集，请休息下":"调用云函数的参数无变动")
                return
            }
        }
        this.initCloud()
        
        console.debug(`开始执行云函数调用 name=${name} ...`)
        wx.cloud.callFunction({
            name,
            data,
            success: (res)=>{
                console.debug(`来自云函数${name}的调用结果：`, res.result)
                onOk(res.result)
            },
            fail: err=>{
                console.error("云函数调用失败", err.errCode, err.errMsg)
                console.log(err)
                util.error(err.errMsg, `云函数调用失败`)
                !onFail || onFail(err)
            }
        })
    }
})
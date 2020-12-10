const util = require("../../utils/util")

//获取应用实例
const app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        gutter: 6,

        //工具合集
        tools:[
            {
                name:"日常工具", summary:"日常生活涉及的工具",
                items:[
                    { name:"胎儿体重测算", icon:"胎儿", url:"/pages/daily/fetusWeight/fetus-weight", tip:"New", dot: false},
                    { name:"HEIC转换", icon:"美术图片", onClick:"todo", dot: true},
                ]
            },
            {
                name:"其他", summary:"",
                items:[
                    { name:"意见反馈", icon:"反馈", onClick:"todo", dot: true},
                    { name:"查看源码", icon:"github", onClick:"github", dot: true},
                    { name:"关于我们", icon:"关于", url:"/pages/about/about"}
                ]
            }
        ]
    },
    onLoad: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },
    getUserInfo: function (e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },

    github: app.copyGit,
    todo() {
        util.warn("功能开发中，敬请期待")
    },
    //处理版本更新，热启动时调用
    doWithUpdate() {
        let updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(res=>{
            if(res.hasUpdate){
                console.debug(`检测到新版本...`)
                updateManager.onUpdateReady(()=>{
                    util.modal("版本更新提示", `检测到小程序发布了新版本，是否立即体验？`, ()=> updateManager.applyUpdate())
                })
            }
        })
    }
})
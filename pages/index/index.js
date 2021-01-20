const util = require("../../utils/util")

//获取应用实例
const app = getApp()

Page({
    data: {
        appName: app.globalData.appName,
        statusBarHeight: app.globalData.statusBarHeight,
        color: app.globalData.color,

        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        gutter: 6,

        //工具合集
        tools:[
            {
                name:"日常工具", summary:"日常生活涉及的工具",
                items:[
                    { name:"胎儿体重测算", icon:"胎儿", url:"/pages/daily/fetusWeight/fetus-weight"},
                    { name:"密码本", icon:"密码", url:"/pages/daily/password/password", dot: true},
                    { name:"时序数据", icon:"时序数据库", url:"/pages/daily/sequence/sequence", tip:"New"},
                    { name:"支付截图工具", icon:"微信支付", url:"/pages/daily/screenMaker/maker", tip:"New"}
                    // { name:"HEIC转换", icon:"美术图片", onClick:"todo", dot: true},
                ]
            },
            {
                name:"职场工具", summary:"办公类",
                items:[
                    { name:"IP归属查询", icon:"IP", url:"/pages/business/ip/ip", tip:"New"},
                    { name:"图片转PDF", icon:"PDF", tip:"New", url:"/pages/business/img2pdf/pdf"},
                ]
            },
            {
                name:"其他", summary:"",
                items:[
                    { name:"意见反馈", icon:"反馈", url:"/pages/other/issue/issue", dot: true},
                    { name:"查看源码", icon:"github", onClick:"github"},
                    { name:"关于我们", icon:"关于", url:"/pages/other/about/about"}
                ]
            }
        ]
    },
    setUserInfo (userInfo){
        this.setData({userInfo, hasUserInfo: true})
    },
    loadUserInfo (){
        if (app.globalData.userInfo) {
            this.setUserInfo(app.globalData.userInfo)
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setUserInfo(res.userInfo)
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    console.log(`登录成功`, res.userInfo)
                    app.globalData.userInfo = res.userInfo
                    this.setUserInfo(res.userInfo)
                }
            })
        }
    },
    onLoad: function () {
        this.loadUserInfo()  
    },
    onShareAppMessage (e){
        return {
            title: app.globalData.appName
        }
    },

    github: app.copyGit,
    todo: app.todo,
    toSetting (){
        app.jumpTo("setting/setting")
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
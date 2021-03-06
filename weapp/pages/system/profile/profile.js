const util = require("../../../utils/util")

const app = getApp()

let getVersion = ()=>{
    let miniP = wx.getAccountInfoSync().miniProgram
    return miniP.version || miniP.envVersion || "未知版本"
}

Page({
    data: {
        // ============= 用户授权信息 =============
        userInfo: {},
        account: {},
        hasUserInfo: false,
        // ============= 用户授权信息 =============
        
        color: app.globalData.color,
        version: getVersion()
    },
    onLoad (){
        app.userInfoReadyCallback = this.onUserInfoLoaded
        if(app.globalData.userInfo && app.globalData.userInfo.nickName)
            this.onUserInfoLoaded(app.globalData)
    },
    todo: app.todo,
    getUserInfo: function (e) {
        console.log(e)
        let { detail } = e
        if(detail.userInfo){
            this.onUserInfoLoaded(detail)
            
            app.afterLogin(detail.userInfo)
        }else if(detail.errMsg && detail.errMsg.indexOf("auth deny")){
            util.warn(`用户拒绝授权`)
        }
    },
    onUserInfoLoaded (res){
        this.setData({
            userInfo    : res.userInfo,
            hasUserInfo : true,
            account     : res.account
        })
        if(!res.account || !res.account.openId){
            //当检测到 account 属性无效时，延迟执行（等待 app.js 中的 afterLogin 函数执行成功）
            setTimeout(()=> this.setData({ account : app.globalData.account }), 3000)
        }
    }
})
const app = getApp()

let getVersion = ()=>{
    let miniP = wx.getAccountInfoSync().miniProgram
    return miniP.version || miniP.envVersion || "未知版本"
}

Page({
    data: {
        // ============= 用户授权信息 =============
        userInfo: {},
        hasUserInfo: false,
        // ============= 用户授权信息 =============
        
        color: app.globalData.color,
        version: getVersion()
    },
    todo: app.todo,
    getUserInfo: function (e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
})
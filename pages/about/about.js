let app = getApp()

Page({
    data: {
        git:  app.globalData.git,
        app
    },

    github: app.copyGit
})
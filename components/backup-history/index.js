const configure = require("../../utils/configure")

Component({
    data: {
        histories: {}
    },
    methods: {
        refresh() {
            wx.getStorage({
                key: 'BACKUP',
                success: res => {
                    this.setData({
                        histories: configure.dateBeans().map(d => {
                            let newO = Object.assign({}, d)
                            newO.history = res.data[d.id]
                            return newO
                        })
                    })
                    console.debug(this.data.histories)
                }
            })
        }
    }
})
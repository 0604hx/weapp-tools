const util = require("../../utils/util")

Page({
    data: {
        title: "",
        detail: "",
        working: false
    },
    onSave (){
        let {title, detail} = this.data
        if(!title)  return util.warn(`标题不能为空`)
        
        this.setData({working: true})
        setTimeout(()=> {
            this.setData({working: false})
            util.ok("任务完成")
        }, 3000)
    }
})
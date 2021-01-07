const util = require("../../../utils/util")

Page({
    data: {
        title: "",
        detail: "",
        working: false,

        historyShow: false,
        historyLoaded: false,           //默认只加载一次历史信息（减低云函数的调用次数😢）
        issues: [],
        activeNames:[]
    },
    toHistory (){
        let { historyShow, historyLoaded } = this.data
        if(historyShow) return this.setData({ historyShow: false })

        //查询历史
        if(!historyLoaded) {
            getApp().callCloud("issue", {action:"history"}, res=>{
                this.setData({historyLoaded: true, issues: res.data})
            })
            // this.setData({
            //     historyLoaded: true, 
            //     issues: [
            //         {
            //             title:"ABC", detail:"ABC的内容", createOn:"2020-12-20 21:37:36", 
            //             reply:"已收到您的意见", replyOn:"2020-12-20 21:37:59"
            //         },
            //         {title:"ABCABC", detail:"ABCABC的内容"}
            //     ]
            // })
        }

        this.setData({historyShow: true})
    },
    onIssueSelect (e){
        this.setData({activeNames: e.detail})
    },
    onSave (){
        let {title, detail} = this.data
        if(!title)  return util.warn(`标题不能为空`)
        
        this.setData({working: true})
        getApp().callCloud("issue", {action:"save", title, detail}, res=>{
            if(res.errCode == 87014){
                util.warn(`检测到违法违规内容`)
            }else if("_id" in res){
                util.warn(`反馈提交成功`)
                this.setData({title:"", detail:""})
            }
            this.setData({working: false})
        } )
    }
})
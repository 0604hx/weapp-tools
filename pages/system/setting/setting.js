const util = require("../../../utils/util")
const configure = require("../../../utils/configure")
const app = getApp()

Page({
    data: {
        color: app.globalData.color,
        
        ossAliRegionShow: false,
        ossAliRegionActions: [
            { value:"hangzhou", name:"杭州（hangzhou）" },
            { value:"shenzhen", name:"深圳（shenzhen）" },
            { value:"shanghai", name:"上海（shanghai）" },
            { value:"beijing", name:"北京（beijing）" },
            { value:"guangzhou", name:"广州（ghuangzhou）" },
            { value:"chengdu", name:"成都（chengdu）" }
        ],

        backupHistoryShow: false
    },
    onLoad (e){
        let settings = configure.load()
        settings['dataBeans'] = configure.dateBeans().map(d=> {
            let newObj = Object.assign({}, d)
            newObj.value = settings[d.configKey]
            return newObj
        })
        console.debug(`配置信息加载完成`, settings)
        this.setData(settings)
    },
    onReady (){
        this.backupHistory = this.selectComponent('#backupHistory')
    },
    //根据 data-key 更新属性
    onSwitchChange(e) {
        let { key, index } = e.target.dataset
        let data = {}
        data[key] = e.detail

        let beans = this.data.dataBeans
        beans[index].value = e.detail
        data.dataBeans = beans

        this.setData(data)
    },
    onSheetSelect (e){
        let { ossAliRegionShow } = this.data
        if(ossAliRegionShow){
            if(e.type=='close') return this.setData({ ossAliRegionShow: false })
            this.setData({ OSS_ALI_REGION: e.detail.value })
        }
        else
            this.setData({ ossAliRegionShow: true })
    },
    onSave() {
        configure.save(this.data, ()=> util.ok("保存成功"))
    },
    /**
     * 显示最近备份历史
     */
    showBackupHistory (e){
        let { backupHistoryShow } = this.data
        if(backupHistoryShow){
            if(e.type=='close') return this.setData({ backupHistoryShow: false })
        }else{
            this.backupHistory.refresh()
        }
        
        this.setData({ backupHistoryShow: true })
    }
})
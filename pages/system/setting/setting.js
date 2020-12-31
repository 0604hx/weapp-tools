const util = require("../../../utils/util")
const configure = require("../../../utils/configure")
const app = getApp()

Page({
    data: {
        color: app.globalData.color
    },
    onLoad (e){
        let settings = configure.load()
        settings['dataBeans'] = configure.dateBeans().map(d=> {
            let newObj = Object.assign({}, d)
            newObj.value = settings[d.configKey]
            return newObj
        })
        console.debug(`加载配置文件...`, settings)
        this.setData(settings)
    },
    //根据 data-key 更新属性
    onSwitchChange(e) {
        let { key, index } = e.target.dataset
        console.log(key, e, e.detail)
        let data = {}
        data[key] = e.detail
        let beans = this.data.dataBeans
        beans[index].value = e.detail

        this.setData(data)
        setTimeout(()=> console.log(this.data), 500)
    },
    onSave() {
        console.debug(this.data)
        config.save(this.data, ()=> util.ok("保存成功"))
    }
})
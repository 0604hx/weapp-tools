/**
 * 备份及还原工具
 */
const util = require("./util")
const configure = require("./configure")

module.exports = {
    onDataChange (id, type=0){
        // 判断是否为定义好的数据对象
        let data = configure.dateBeans().find(d=> d.id==id && d.type == type)

        // 判断用户是否开启自动备份
        if(!!data && configure.isEnable(data)){
            console.debug(`用户已开启<${data.name}>自动备份，即将执行备份作业...`)
        }
    }
}
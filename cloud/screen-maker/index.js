// 云函数入口文件
const cloud = require('wx-server-sdk')
const configs = require("./marker.json")

const fs = require('fs')

const { createCanvas, loadImage } = require('canvas')

cloud.init()
console.debug(`云环境初始化完成...`)

/**
 * 生成微信支付截图
 * @param {*} ps 
 */
let createWechatPay = ps=>{
    console.debug(`生成微信支付截图`, ps)
    let model = ps.model || 'iphone'
    let config = configs.wechat.pay[model]
    if(!config) throw Error(`找不到${model}相关配置`)

    let canvas = createCanvas(config.width, config.height)
    let ctx = canvas.getContext('2d')
    console.debug(`canvas 环境设置完成， config=`, config)

    // Draw cat with lime helmet
    loadImage(`screen/wechat-pay-${model}.png`).then((image) => {
        ctx.drawImage(image, 0, 0, config.width, config.height)

        Object.keys(config.texts).forEach(key=>{
            if(!!ps[key]){
                let v = config.texts[key]
                console.debug(`[文本填充] ${key}=${ps[key]} (${v})`)
                ctx.font = `${v[3]}px "Microsoft YaHei"`
                ctx.textAlign = v[4] || 'start'
                ctx.fillText(ps[key], v[2]/2, v[1], v[2])
            }
        })
    
        const out = fs.createWriteStream(__dirname + `/output/wechat-pay-${model}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The PNG file was created.'))
    })

}

createWechatPay({model:`iphone`, target:`扫二维码付款-给万科物业`, money:"-5000.00"})

// 云函数入口函数
exports.main = async (ps, context) => {
    const wxContext = cloud.getWXContext()
    
    return {
    }
}
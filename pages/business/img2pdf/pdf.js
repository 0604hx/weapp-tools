Page({
    data: {

    },
    onLoad (){
        const query = wx.createSelectorQuery()
        query.select('#imgCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')

            const dpr = wx.getSystemInfoSync().pixelRatio
            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr
            ctx.scale(dpr, dpr)
            
            let img = canvas.createImage();
            img.src = 'https://nerve-images.oss-cn-shenzhen.aliyuncs.com/public/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20180524124345.jpg';
            img.onload = function (res) {
                console.log('onload成功', res, img)
                //res.path[0].height
                ctx.drawImage(img, 0, 0, 300, 300);
            }
        })
    }
})
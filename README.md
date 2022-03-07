# 小程序工具集
> 基于微信小程序的各种简单工具合集

## 开源地址   (*欢迎 Star ~ ~  (￣▽￣)*)
GitHub: [https://github.com/0604hx/weapp-tools](https://github.com/0604hx/weapp-tools)  
Gitee:  [https://gitee.com/0604hx/weapp-tools](https://gitee.com/0604hx/weapp-tools)

## 工具目录
> 📅 表示计划中

**日常生活类**

  [胎儿体重测算](weapp/pages/daily/fetusWeight)
| [个人密码本](weapp/pages/daily/password)
| [时序数据](weapp/pages/daily/sequence)
| [微信支付截图生成器](weapp/pages/daily/screenMaker)
| [分期还款笔记](weapp/pages/daily/monthly)

**职场工具**

[IP归属查询](weapp/pages/business/ip)
| [图片转PDF](weapp/pages/business/img2pdf)

**其他**

  [意见反馈](weapp/pages/other/issue)
| [关于](weapp/pages/other/about)


## 在线体验
> 左侧为小程序二维码

<center class="half">
    <img alt="扫码或微信搜索集成工具集体验小程序" src="https://nerve-images.oss-cn-shenzhen.aliyuncs.com/public/qrcode-weapp-tools.jpg" width="48%" />
    <img alt="关注公众号" src="https://nerve-images.oss-cn-shenzhen.aliyuncs.com/public/qrcode-wandoushuju.jpg" width="48%" />
</center>

## 系列博文

1. [微信小程序开发基础（胎儿体重测算工具实例）](https://blog.csdn.net/ssrc0604hx/article/details/110877828)
2. [云函数开发及调试（意见反馈实例）](https://blog.csdn.net/ssrc0604hx/article/details/111587855)


## 首页预览
> 更多运行时预览图片请转 [screen](documents/screen)
![首页](documents/screen/index.png)

## 附录

### 第三方库

[vant-weapp](https://github.com/youzan/vant-weapp)

[wx-f2](https://github.com/antvis/wx-f2)

### 本地如何运行

1. 拉取代码至本地，在`微信开发者工具`中导入项目
2. 配置 `project.config.json`，添加如下内容：
```json
    "miniprogramRoot": "./weapp",
    "cloudbaseRoot": "./cloud",
```
3. 启用 npm 模块：详情（IDE 右上角）-> 本地配置 -> （勾选）使用 npm 模块
4. 下载依赖：在 weapp 目录下执行 `npm i` 命令
5. 工具 -> 构建 npm
6. 此时可以正常编译，Enjoy 😏

特别提示：

* 本地调试时，控制台会有诸多警告信息，可以通过设置 `levels` （不勾选 warning）进行屏蔽

**我个人使用的编辑器配置**

配置项|值
------|------
使用空格代替制表符|是
字体|Consolas
字体大小|15
制表符大小|4
行距|2
从内容中检测缩进方式|否

### project.config.json 配置说明

**packOptions.ignore**
> 详见：[项目配置文件](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)

```json
"ignore": [
    {"type": "suffix", "value": ".md"},
    {"type": "folder", "value": "documents" },
    {"type": "folder", "value": "cloud" }
]
```
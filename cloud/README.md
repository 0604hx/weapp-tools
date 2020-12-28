# 云资源相关

## issue

## account
> 用户相关云函数

### 记录用户登录情况
> action=`login`

每次调用小程序 `wx.getUserInfo` 得到结果后请求该接口（记录已授权的用户信息）并返回诸如个人配置信息（如是否为管理员等）

记录内容如下

字段名|必填|说明
-----|-----|-----
avatarUrl|是|[UserInfo]头像地址
country||[UserInfo]国家
province||[UserInfo]省份
city||[UserInfo]城市
gender|是|[UserInfo]性别（0=未知，1=男，2=女）
nickName|是|[UserInfo]昵称
language||[UserInfo]语言
createOn|是|注册时间戳（云函数自动生成）
lastOn||最后登录时间（最后登录时间戳）
count||登录次数统计
ip||最后登录的客户端IP
brand||[SystemInfo]设备品牌
model||[SystemInfo]机型
system||[SystemInfo]客户端操作系统


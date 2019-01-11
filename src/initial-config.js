const fs = require('fs')
const utils = require('./utils')

const configContent = `module.exports = {
  // Generate API 接口必填参数
  neiCookies: {
    "S_INFO": "",
    "koa.sid": "",
    "koa.sid.sig": ""
  },
  // Generate Icon 接口必填参数
  iconCookies: {
    "EGG_SESS_ICONFONT": "",
    "ctoken": ""
  }
}`

module.exports = (uri) => {
  let configFilePath = utils.getConfigFilePath(uri.fsPath)

  if (fs.existsSync(configFilePath)) {
    utils.showError('芸苔配置文件已经存在！')
  } else {
    fs.writeFileSync(configFilePath, configContent)
    utils.showInfo('创建成功，请完善相关信息')
  }
}

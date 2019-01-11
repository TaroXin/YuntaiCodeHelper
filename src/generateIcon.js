const vscode = require('vscode')
const fs = require('fs')
const utils = require('./utils')
const { getIconGroup } = require('./apiRequest')

function generateIcon (currentFile) {
  const config = utils.dynamicRequire(utils.getConfigFilePath(currentFile))
  console.log(config)
  getIconGroup(
    config
  ).then(res => {
    return vscode.window.showQuickPick(res, { canPickMany: false })
  }).then(pickRes => {
    console.log(pickRes)
  }).catch(err => {
    if (typeof err === 'object') {
      utils.showError(err.message)
    } else {
      utils.showError(err)
    }
  })
}

module.exports = (uri) => {
  const currentFile = uri.fsPath
  if (utils.isDirectory(currentFile)) {
    if (utils.checkProjectInitial(currentFile)) {
      generateIcon(currentFile)
    } else {
      utils.showError('请先对项目进行初始化操作')
    }
  } else {
    utils.showError('请选择文件夹进行操作')
  }
}

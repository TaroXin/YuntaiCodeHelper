const vscode = require('vscode')
const fs = require('fs')
const http = require('http')
const cheerio = require('cheerio')
const compressing = require('compressing')
const utils = require('./utils')
const { getIconGroup } = require('./apiRequest')

const downloadHost = 'www.iconfont.cn'
const downloadUrl = '/api/project/download.zip?'
let config = null
let defaultOptions = null

function generateIcon (currentFile) {
  config = utils.dynamicRequire(utils.getConfigFilePath(currentFile))

  getIconGroup(
    config
  ).then(res => {
    return vscode.window.showQuickPick(res, { canPickMany: false })
  }).then(pickRes => {
    if (pickRes) {
      download(pickRes, currentFile)
    }
  }).catch(err => {
    if (typeof err === 'object') {
      utils.showError(err.message)
    } else {
      utils.showError(err)
    }
  })
}

function download (pickRes, currentFile) {
  const downloadFileName = '/cache.zip'
  let file = fs.createWriteStream(currentFile + downloadFileName);
  const options = {
    hostname: downloadHost,
    port: 80,
    path: `${downloadUrl}ctoken=${config.iconCookies.ctoken}&pid=${pickRes.value}`,
    method: 'GET',
    headers: {
        'Cookie': `EGG_SESS_ICONFONT=${config.iconCookies.EGG_SESS_ICONFONT}`
    }
  }

  http.get(options, function (res) {
    res.on('data', data => {
      file.write(data);
    });

    res.on('end', () => {
      file.end();
      console.log('文件下载成功')
      unzipCache(currentFile + downloadFileName, currentFile)
    })
  })
}

function unzipCache (path, currentFile) {
  const compressPath = currentFile + '/cache'
  compressing.zip.uncompress(path, compressPath).then(() => {
    console.log('解压成功')
    utils.rmFile(path)
    resolveFiles(compressPath, currentFile)
  }).catch(err => {
    utils.showError('文件解压失败，请重新执行：' + err.message)
    utils.rmFile(path)
    utils.rmDir(compressPath)
  })
}

function resolveFiles (compressPath, currentFile) {
  const sourceDir = fs.readdirSync(compressPath)[0]
  let sourceFiles = null
  if (!defaultOptions.isSvg) {
    sourceFiles = ['iconfont.css', 'iconfont.ttf', 'demo_index.html']
  } else {
    sourceFiles = ['iconfont.js', 'demo_index.html']
  }

  sourceFiles.forEach(fileName => {
    let source = compressPath + '/' + sourceDir + '/' + fileName
    if (fs.existsSync(source)) {
      let target = currentFile + '/' + fileName
      mergeFile(target, source)
    } else {
      utils.showError('预设文件不存在，跳过执行')
    }
  })

  if (!defaultOptions.isSvg) {
    formatIconCss(currentFile + '/iconfont.css')
  }

  generateIconJson(currentFile + '/' + sourceFiles[sourceFiles.length - 1], currentFile)
  utils.showInfo('Generate Icon 执行完成')
  utils.rmDir(compressPath)
}

function generateIconJson (iconPath, parent) {
  let options = { decodeEntities: false }
  let $ = cheerio.load(fs.readFileSync(iconPath), options)
  let iconList = $('.icon_lists').eq(1).find('li')
  let iconContent = `export default [$REPLACE];\n`
  let iconObjects = []
  iconList.each((index, element) => {
    iconObjects.push(
      `{\n` +
      `  name: '${$(element).find('.name').eq(0).html().trim()}',\n` +
      `  fontclass: '${$(element).find('.code-name').eq(0).html().trim().substring(1)}',\n` +
      `}`
    )
  })

  let replaceStr = ''
  iconObjects.forEach(content => {
    replaceStr += content + ', '
  })
  replaceStr = replaceStr.substring(0, replaceStr.lastIndexOf(','))
  iconContent = iconContent.replace('$REPLACE', replaceStr)
  fs.writeFileSync(parent + '/icons.js', iconContent)
}

function formatIconCss (iconCssPath) {
  let content = fs.readFileSync(iconCssPath).toString()
  let needReplace = content.substring(0, content.indexOf('}', 200) + 2)
  let replaceStr =
    `/* stylelint-disable */\n` +
    `@font-face {\n` +
    `  font-family: "iconfont";\n` +
    `  src: ${needReplace.substring(needReplace.indexOf("url('iconfont.ttf"), needReplace.indexOf("format('truetype')") + 18)};\n` +
    `}\n`

  content = content.replace(needReplace, replaceStr)
  fs.writeFileSync(iconCssPath, content)
}

// 合并文件
function mergeFile (target, source) {
  fs.copyFileSync(source, target)
}

module.exports = (uri, options) => {
  defaultOptions = options
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

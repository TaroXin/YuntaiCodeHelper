const request = require('superagent')

const requestUrls = {
  recentApi: 'https://nei.netease.com/api/projects/?recent',
  progroupsApi: 'https://nei.netease.com/api/progroups/',
  interfaceApi: 'https://nei.netease.com/api/interfaces/?pid=',
  iconGroupApi: 'http://www.iconfont.cn/api/user/myprojects.json?',
}

const requestHeaders = {
  icon: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Connection": "keep-alive",
    "Host": "www.iconfont.cn",
    "Referer": "http://www.iconfont.cn/manage/index?spm=a313x.7781069.1998910419.11&manage_type=myprojects&projectId=709954&keyword=",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36 QQBrowser/4.3.4986.400"
  }
}

function generateCookie (cookies) {
  return Object.keys(cookies).map(key => {
      return key + '=' + cookies[key]
  }).join('; ')
}

function getIconGroup (config) {
  return new Promise((resolve, reject) => {
    request
      .get(requestUrls.iconGroupApi + 't=' + Date.now() + '&ctoken=' + config.iconCookies.ctoken)
      .set(requestHeaders.icon)
      .set('Cookie', generateCookie(config.iconCookies))
      .end((err, res) => {
        if (res.status === 200 && res.body.code === 200) {
          const iconGroup = []
          res.body.data.corpProjects.forEach(item => {
            iconGroup.push({
              name: item.name,
              value: item.id,
              label: item.name,
            })
          })

          res.body.data.ownProjects.forEach(item => {
            iconGroup.push({
              name: item.name,
              value: item.id,
              label: item.name,
            })
          })

          resolve(iconGroup)
        } else {
          reject('获取Icon列表失败，请检查参数配置')
        }
      })
  })
}

module.exports = {
  getIconGroup
}

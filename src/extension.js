const vscode = require('vscode');
const utils = require('./utils')
const fs = require('fs')
const initialConfig = require('./initial-config')
const generateIcon = require('./generateIcon')

function provideCompletionItems(document, position, token, context) {
	const projectPath = utils.getYuntaiProjectSourcePath(document)
	console.log(projectPath)

	const themeParent = `${projectPath}/styles/`
	const themeNames = ['them.scss', 'theme.scss']
	let themeFile = themeParent + themeNames.find(path => fs.existsSync(`${themeParent}${path}`))
	if (themeFile.endsWith('.scss')) {
		let themeFileArray = fs.readFileSync(themeFile).toString().split('\n').filter(item => item.startsWith('$'))

		return themeFileArray.map(item => {
			return new vscode.CompletionItem(item.split(":")[0], vscode.CompletionItemKind.Field)
		})
	} else {
		utils.showError('当前项目没有发现主题文件！')
	}
}

function resolveCompletionItem(item, token) {
	return null;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// 注册代码建议提示，只有当按下“.”时才触发
	vscode.window.showInformationMessage('YuntaiCode 成功启动！')
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('vue', {
		provideCompletionItems,
		resolveCompletionItem
	}, '$'));

	context.subscriptions.push(vscode.commands.registerCommand('extension.yuntai.GenerateIcon', generateIcon))
	context.subscriptions.push(vscode.commands.registerCommand('extension.yuntai.InitialConfig', initialConfig))
}

exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

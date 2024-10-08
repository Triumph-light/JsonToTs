import { window, commands, env, Range, type ExtensionContext } from 'vscode';
import generateType from './getType';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand('extension.JsonToTs', async () => {
			try {
				const input = await window.showInputBox({
					title: 'JsonToTs',
					placeHolder: '⚡请输入JSON数据',
				});

				console.log('---------input', input);

				if (input) {
					const output = await generateType(input);
					insertText(output);
					await env.clipboard.writeText(output);
					window.showInformationMessage('类型生成成功, 已复制到剪贴板.');
				}
			} catch (error) {
				console.error('-----errror', error);
				window.showErrorMessage(error as string);
			}
		})
	);
}

/**
 * 插入文字到编辑器
 * @param text 文字
 */
function insertText(text: string):void {
	const editor = window.activeTextEditor;
	if (editor) {
		const { selections } = editor;
		editor.edit((editBuilder) => {
			selections.forEach((selection) => {
				const { start, end } = selection;
				const range = new Range(start, end);
				editBuilder.replace(range, text);
			});
		});
	}
}

export function deactivate() { }



import axios from 'axios';
import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

const PREFIXCONFIG = 'glmTranslate';

interface GLMTranslateOption {
    apiKey?: string;
    model?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
}

export class GLMTranslate implements ITranslate {
    get maxLen(): number {
        return 3000;
    }

    private _config: GLMTranslateOption;
    constructor() {
        this._config = this.createOption();
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._config = this.createOption();
            }
        });
    }

    createOption() {
        const defaultOption: GLMTranslateOption = {
            apiKey: workspace.getConfiguration('glmTranslate').get<string>('apiKey'),
            model: workspace.getConfiguration('glmTranslate').get<string>('model') || 'GLM-4-Flash',
            sourceLanguage: workspace.getConfiguration('commentTranslate').get<string>('sourcelanguage') || 'EN',
            targetLanguage: workspace.getConfiguration('commentTranslate').get<string>('targetLanguage') || 'zh-CN',
        };
        return defaultOption;
    }

    async translate(content: string, { to = 'auto' }: ITranslateOptions): Promise<string> {
        if (!this._config.apiKey) {
            return "需要提供智谱的 APIKey";
        }
        const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

        const requestPayload = {
            model: this._config.model,
            messages: [
                {
                    role: "system", content: `
                    您是一位精通「${this._config.sourceLanguage}」与「${this._config.targetLanguage}」的翻译专家。

                    ## 翻译要求:
                    1.忠实于"源文本"，确保每个句子都得到准确且流畅的翻译。
                    2.大额数字的翻译需准确无误，符合「${this._config.targetLanguage}」的表达习惯。

                    ##任务:
                    1.仔细研究并深入理解"源文本"的内容、上下文、语境、情感以及和目标语言的文化细微差异。
                    2."源文本"的部分单词可能是来源于代码，请根据上下文判断其含义，并翻译成目标语言。
                    3.根据「翻译要求」将"源文本"准确翻译为「${this._config.targetLanguage}」,返回结果为Markdown格式。
                    4.确保翻译对目标受众来说准确、自然、流畅，必要时可以根据需要调整表达方式以符合文化和语言习惯。

                    注意:不要输出任何额外的内容，只能输出翻译内容。这一点非常关键。
                    `
                },
                {
                    role: "user", content: `${content}`
                }
            ],
        };

        try {
            console.log('Request apiUrl:', apiUrl);
            const response = await axios.post(apiUrl, requestPayload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this._config.apiKey}`
                }
            });
            console.log('Response:', response.data); // 添加日志打印响应内容
            if (response.status === 200) {
                const translatedContent = response.data.choices[0].message.content;
                return translatedContent;
            } else {
                throw new Error(`翻译失败了: ${response.status}`);
            }
        } catch (error: any) {
            const errorMessage = error.response
                ? `${error.response.status} - ${error.response.data.message}`
                : error.request
                    ? '请求未响应'
                    : error.message;
            throw new Error(`未知错误: ${errorMessage}`);
        }
    }


    link(content: string, { to = 'auto' }: ITranslateOptions) {
        return '';
    }

    isSupported(src: string) {
        return true;
    }
}

# zhipu-glm-translate
> 基于智谱 GLM 大模型翻译

## Requirements

安装依赖 [comment-translate](https://github.com/intellism/vscode-comment-translate)

切换到 `zhipu-glm-translate` 源：
1. 通过快捷键 `ctrl+shift+p` 或 `cmd+shift+p` 搜索`Comment translate: Change translate source`并回车确定
2. 在确定后显示的下拉选项中选择 `Zhipu GLM translate`

或者直接在 `VSCode` 中指定源：
```json
{
    "commentTranslate.source": "zhaolei.zhipu-glm-translate-glm"
}
```

## Extension Settings
需要配置 `apiKey`

* `glmTranslate.apiKey`: 申请 APIkey
* `glmTranslate.model`: 指定模型，默认为`GLM-4-Flash`

**Enjoy!**

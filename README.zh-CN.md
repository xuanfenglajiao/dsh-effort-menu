# dsh-effort-slider

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 输入框设计的模型菜单，内置可拖动的渐变滑杆，用来调节模型的思考强度（推理等级）。

[![MIT license](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![DSH 0.2.2-rc.1 tested](https://img.shields.io/badge/DSH-0.2.2--rc.1%20tested-4d6bfe)](#兼容性)

[English](./README.md) | 简体中文

本插件替换输入框的模型选择器。菜单先列出最近使用的模型，悬停后在右侧展开全部提供商的模型，底部是一条滑杆，节点对应当前模型的各档思考强度。它与官方选择器、`/model` 弹窗读写同一份会话级模型目录，三处状态始终一致。

## 截图

| 浅色 | 深色 |
| --- | --- |
| <img src="docs/screenshots/menu-light.png" alt="带思考强度滑杆的模型菜单（浅色主题）" width="400"> | <img src="docs/screenshots/menu-dark.png" alt="带思考强度滑杆的模型菜单（深色主题）" width="400"> |

悬停提供商行，会在右侧展开全部提供商的模型。

<img src="docs/screenshots/flyout-light.png" alt="模型菜单与全部模型列表（浅色主题）" width="620">

<img src="docs/screenshots/flyout-dark.png" alt="模型菜单与全部模型列表（深色主题）" width="620">

## 功能

- **最近使用优先。** 菜单显示最近用过的三个模型，当前模型始终在列。悬停或点击提供商行，会在右侧展开所有提供商的模型。选完模型后菜单保持打开，可以接着调节思考强度。
- **思考强度滑杆。** 节点数量等于当前模型在 `reasoning.efforts` 中公布的档位。可以点击节点，点击旋钮旁边的空白处会朝点击方向移动一档，也可以拖动，旋钮在节点之间吸附，松手时只提交一次选择。
- **独立的“默认”档。** 模型有档位但没有自己的默认值时，滑杆最左侧会多出一个“默认”节点。选中它不会发送显式等级，由提供商自己的默认值生效。
- **切换模型时的强度处理。** 当前使用的等级在新模型也有时直接沿用，否则请求新模型的最高档。当前没有指定等级时，使用新模型自己的默认值。
- **失败看得见。** 模型目录加载失败，或某个提供商加载失败，都会在菜单里提示并给出**重试**按钮，不会留一个空列表。选择被拒绝时会在菜单内提示，如果会话被另一个正在运行的 DSH 占用，会给出专门的说明。
- **键盘与焦点。** `↑`/`↓` 在菜单项之间移动。焦点在滑杆上时，方向键、`Home`、`End` 用来调节滑杆。在提供商行按 `→` 展开模型列表，`Esc` 关闭菜单并把焦点还给触发按钮。
- **跟随主题。** 使用应用的设计 token，适配亮色和暗色主题，遵循 `prefers-reduced-motion`。输入框隐藏模型文字时，会退化为模型图标。
- 界面文字提供**中文和英文**。

## 安装

需要所用的 DeepSeek Harness 自带 `dsh-client-ui-conversation`、`dsh-client-ui-model-selection` 和 `dsh-client-locale` 三个客户端包（见[兼容性](#兼容性)）。

**由 CLI 管理的 profile**（`web`、`headless` 等）用一条命令安装。

```sh
dsh plugin --profile web add github:LYLMagui/dsh-effort-slider
```

**桌面端。** `desktop` profile 由应用独占管理，`dsh plugin` 会直接拒绝。请先克隆仓库，再打开 **Plugin Manager**，选择安装这个本地目录。

```sh
git clone https://github.com/LYLMagui/dsh-effort-slider.git
```

安装后重启 DeepSeek Harness，或重新加载窗口。本插件没有构建步骤，浏览器端就是仓库里提交的 `client.js`。

**卸载**时执行 `dsh plugin --profile web remove dsh-effort-slider`，桌面端在 Plugin Manager 里移除即可。

## 兼容性

- 开发和测试用的是 DeepSeek Harness Desktop 44.7.0（DSH `0.2.2-rc.1`），Windows 11。更早的 DSH 版本没有测过。
- 当前模型必须公布 `reasoning.efforts`，滑杆才有内容可显示。否则菜单会提示该模型没有可选档位。
- 在子代理会话中不渲染任何内容。

## 已知限制

- **模型槽位只能有一个占用者。** 本插件以优先级 `-1` 接管单占位槽 `conversation.input.model`，遮住官方选择器。其他同样替换该槽位的插件会与它竞争，请只安装其中一个。从外部给官方选择器改样式的插件，可能对这个菜单不生效。
- **模型标签子槽无法扩展。** `conversation.input.model.label` 由官方 model-selection 包声明，重复声明会让整个客户端条目加载失败。因此本插件自己渲染模型名称，其他插件贡献到该子槽的标签不会显示在这里。
- **暂无自动化测试。** 目前靠在运行中的应用里手工验证。

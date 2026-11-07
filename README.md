# dsh-effort-slider

A model menu for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer, with a draggable gradient slider for the model's reasoning effort.

[![MIT license](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![DSH 0.2.2-rc.1 tested](https://img.shields.io/badge/DSH-0.2.2--rc.1%20tested-4d6bfe)](#compatibility)

English | [简体中文](./README.zh-CN.md)

The plugin replaces the composer's model selector. The menu lists your recent models, opens a flyout with every provider's models, and ends with a slider whose nodes are the reasoning-effort levels of the current model. It reads and writes through the same per-session model directory as the shipped selector and the `/model` popup, so all three stay in sync.

## Screenshots

| Light | Dark |
| --- | --- |
| <img src="docs/screenshots/menu-light.png" alt="Model menu with the reasoning-effort slider, light theme" width="400"> | <img src="docs/screenshots/menu-dark.png" alt="Model menu with the reasoning-effort slider, dark theme" width="400"> |

Hovering the provider row opens a flyout with every provider's models.

<img src="docs/screenshots/flyout-light.png" alt="Model menu with the all-models flyout, light theme" width="620">

<img src="docs/screenshots/flyout-dark.png" alt="Model menu with the all-models flyout, dark theme" width="620">

## Features

- **Recent models first.** The menu shows the last three models you used, the current one always included. Hover or click the provider row to open a flyout with every provider's models. The menu stays open after you pick a model, so you can adjust the effort straight away.
- **Effort slider.** One node per level the current model advertises in `reasoning.efforts`. Click a node, click beside the knob to step one level toward the pointer, or drag. The knob snaps from node to node, and a drag sends a single selection when you release.
- **A real "Default" level.** When a model offers levels but no default of its own, the slider gets a leading *Default* node. Choosing it requests no explicit level, so the provider's own default applies.
- **Sensible effort on model switch.** The level in use carries over if the new model offers it; otherwise the new model's highest level is requested. With no level in use, the new model's own default applies.
- **Failures are visible.** A catalog that fails to load, or a single provider that fails, is shown in the menu with a **Retry** button, never as an empty list. A rejected selection is shown inline, with a dedicated message when another running DSH holds the session.
- **Keyboard and focus.** `↑`/`↓` move between menu items. While the slider has focus, the arrow keys, `Home` and `End` adjust it instead. `→` on the provider row opens the flyout, and `Esc` closes the menu and returns focus to the trigger.
- **Theme-aware.** Uses the app's design tokens, so it follows light and dark themes, honours `prefers-reduced-motion`, and falls back to a model icon when the composer hides the model text.
- **English and Chinese** interface text.

## Install

Requires a DeepSeek Harness build that ships the `dsh-client-ui-conversation`, `dsh-client-ui-model-selection` and `dsh-client-locale` client packages (see [Compatibility](#compatibility)).

**CLI-managed profiles** (`web`, `headless`, …) install with one command.

```sh
dsh plugin --profile web add github:LYLMagui/dsh-effort-slider
```

**Desktop app.** The `desktop` profile is managed by the app, so `dsh plugin` refuses it. Clone the repository, then open **Plugin Manager** and install the checkout directory.

```sh
git clone https://github.com/LYLMagui/dsh-effort-slider.git
```

Restart DeepSeek Harness, or reload the window, after installing. There is no build step. The browser half is the committed `client.js`.

**Uninstall** with `dsh plugin --profile web remove dsh-effort-slider`, or remove it in Plugin Manager on the desktop app.

## Compatibility

- Developed and tested on DeepSeek Harness Desktop 44.7.0 (DSH `0.2.2-rc.1`) on Windows 11. Earlier DSH lines are untested.
- The current model must expose `reasoning.efforts` for the slider to have anything to show. Otherwise the menu says the model provides no levels.
- Renders nothing in subagent sessions.

## Known limitations

- **One occupant of the model slot.** The plugin takes over the single slot `conversation.input.model` at priority `-1`, shadowing the shipped selector. Another plugin that replaces the same slot competes for it, so install only one. Plugins that restyle the shipped selector from outside may not apply to this menu.
- **The model label sub-slot is not extensible.** `conversation.input.model.label` is declared by the shipped model-selection package, and a second declaration makes the whole client entry fail to load. This plugin therefore renders model names itself, and labels that other plugins contribute to that sub-slot do not appear here.
- **No automated tests yet.** Changes are checked by hand in a running app.

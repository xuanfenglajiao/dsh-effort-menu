/**
 * Client half of the effort-menu bundle.
 *
 * It shadows the composer's `conversation.input.model` single slot at priority -1
 * (the shipped seat registers at 0, and the lowest priority renders). The data
 * path is the shipped `modelDirectories` service, so this plugin adds no new
 * RPC and no second selection state: reading the directory and calling its
 * `select()` keeps the composer and the `/model` popup in sync.
 */
window.__ModuleLoader__.load({
  id: 'dsh-effort-menu',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;

    const NS = 'effort-menu';

    const zh = {
      'menu.aria': '模型与思考强度',
      'menu.model': '模型',
      'menu.recent': '最近使用',
      'menu.allModels': '全部模型',
      'menu.effort': '思考强度',
      'menu.manageModels': '管理模型',
      'provider.account': 'DeepSeek 账号',
      'trigger.fallback': '请选择模型',
      'trigger.selectAria': '请选择模型',
      'trigger.loading': '正在加载模型…',
      'trigger.aria': '选择模型，当前 {model}',
      'trigger.ariaEffort': '选择模型，当前 {model}，推理等级 {effort}',
      'effort.default': '默认',
      'status.loading': '正在刷新模型列表…',
      'empty.efforts': '当前模型未提供推理等级。',
      'empty.groups': '暂无可用模型',
      'warning.groupLoad': '{name} 加载失败：{message}',
      'retry': '重试',
      'error.action': '模型操作失败：{message}',
      'error.sessionInUse': '当前会话已被占用，可能是其他正在运行的 DSH 导致的，请退出后重试。',
    };

    const en = {
      'menu.aria': 'Model and thinking intensity',
      'menu.model': 'Model',
      'menu.recent': 'Recently used',
      'menu.allModels': 'All models',
      'menu.effort': 'Thinking intensity',
      'menu.manageModels': 'Manage models',
      'provider.account': 'DeepSeek Account',
      'trigger.fallback': 'Select model',
      'trigger.selectAria': 'Select model',
      'trigger.loading': 'Loading models…',
      'trigger.aria': 'Select model, current {model}',
      'trigger.ariaEffort': 'Select model, current {model}, reasoning effort {effort}',
      'effort.default': 'Default',
      'status.loading': 'Refreshing model list…',
      'empty.efforts': 'This model provides no reasoning effort levels.',
      'empty.groups': 'No models available.',
      'warning.groupLoad': '{name} failed to load: {message}',
      'retry': 'Retry',
      'error.action': 'Model operation failed: {message}',
      'error.sessionInUse': 'This session is already in use, possibly by another running DSH instance. Quit it and try again.',
    };

    const CSS = `
.es-root,.es-root *{corner-shape:round}
.es-root{min-width:0;position:relative;font-size:var(--dsh-content-font-size,13px)}
.es-trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:360px;height:calc(28px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:var(--dsh-content-font-size,13px);font-weight:400;line-height:calc(20px + var(--dsh-content-font-delta,0px));display:flex}
@media (hover:hover){.es-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.es-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary))}
.es-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.es-triggerIcon{display:var(--dsh-composer-model-icon-display,none);flex:none;width:16px;height:16px}
.es-triggerLabel{display:var(--dsh-composer-model-text-display,block);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
.es-triggerEffort{display:var(--dsh-composer-model-text-display,block);text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary));flex:none;overflow:hidden}
.es-chevron{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary));flex:none;transition:transform .16s ease}
.es-chevronOpen{transform:rotate(180deg)}
.es-spinner{width:14px;height:14px;flex:none;border-radius:50%;border:1.5px solid var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary));border-top-color:transparent;animation:es-spin .8s linear infinite}
@keyframes es-spin{to{transform:rotate(360deg)}}
.es-menu{box-sizing:border-box;position:fixed;z-index:1100;width:300px;max-width:calc(100vw - 24px);max-height:min(480px,calc(100vh - 96px));display:flex;flex-direction:column;padding:5px 8px 10px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-input-major,var(--dsw-alias-bg-overlay));box-shadow:var(--dsw-elevation-prominent,0 18px 48px rgba(0,0,0,.45));color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px));overflow:hidden}
.es-menu:focus{outline:none}
.es-modelSection{display:flex;flex-direction:column;min-height:0;max-height:300px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding:2px 0 0}
.es-provider{box-sizing:border-box;width:100%;height:calc(42px + var(--dsh-content-font-delta,0px));display:flex;align-items:center;gap:8px;padding:0 8px;margin:0;border:0;border-radius:9px;background:0 0;color:inherit;font:inherit;text-align:left;cursor:pointer;outline:none;flex:none;transition:background-color .16s ease}
.es-provider:disabled{cursor:default}
.es-provider:focus-visible,.es-provider.es-providerOpen{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.es-provider:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.es-providerDivider{flex:none;height:1px;margin:4px 0 0;background:var(--dsw-alias-border-l1)}
.es-providerName{flex:1;min-width:0;font-size:var(--dsh-content-font-size,13px);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.es-providerBadge{flex:none;font-size:calc(10px + var(--dsh-content-font-delta-secondary,0px));line-height:16px;padding:0 5px;border-radius:4px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));letter-spacing:.02em}
.es-providerChevron{width:14px;height:14px;flex:none;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary));transition:transform .18s ease}
.es-flyout{box-sizing:border-box;position:fixed;z-index:1101;width:280px;max-width:calc(100vw - 24px);max-height:min(480px,calc(100vh - 24px));display:flex;flex-direction:column;padding:6px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-input-major,var(--dsw-alias-bg-overlay));box-shadow:var(--dsw-elevation-prominent,0 18px 48px rgba(0,0,0,.45));color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px));overflow:hidden}
.es-flyout:focus{outline:none}
.es-flyoutList{display:flex;flex-direction:column;min-height:0;flex:1;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}
.es-sectionLabel{flex:none;padding:7px 8px 3px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:calc(11px + var(--dsh-content-font-delta-secondary,0px));line-height:16px;font-weight:500}
.es-modelGroup{display:flex;flex-direction:column}
.es-groupHeading{flex:none;padding:6px 8px 2px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:calc(11px + var(--dsh-content-font-delta-secondary,0px));line-height:16px;font-weight:500}
.es-modelRow{box-sizing:border-box;width:100%;min-height:calc(36px + var(--dsh-content-font-delta,0px));display:flex;align-items:center;gap:7px;padding:7px 8px;border:0;border-radius:8px;background:0 0;color:inherit;font:inherit;text-align:left;cursor:pointer;outline:none;transition:background-color .16s ease}
.es-modelRowSelected{background:transparent}
@media (hover:hover){.es-modelRow:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.es-modelRow:focus-visible{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.es-modelRow:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.es-modelName{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px))}
.es-modelLabel{display:inline;min-width:0}
.es-modelBadge{flex:none;font-size:calc(10px + var(--dsh-content-font-delta-secondary,0px));line-height:16px;padding:0 5px;border-radius:5px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1)}
.es-check{flex:0 0 14px;display:grid;place-items:center;color:var(--dsw-alias-label-primary)}
.es-effortDivider{border-top:1px solid var(--dsw-alias-border-l1);margin:8px 0 0;flex:none}
.es-effortBlock{padding:8px 2px 2px;border-radius:10px;flex:none}
.es-footerDivider{border-top:1px solid var(--dsw-alias-border-l1);margin:8px 0 0;flex:none}
.es-footer{padding:4px 0 0;flex:none}
.es-manageRow{box-sizing:border-box;width:100%;height:calc(36px + var(--dsh-content-font-delta,0px));display:flex;align-items:center;gap:8px;padding:0 8px;margin:0;border:0;border-radius:8px;background:0 0;color:inherit;font:inherit;text-align:left;cursor:pointer;outline:none;transition:background-color .16s ease}
@media (hover:hover){.es-manageRow:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.es-manageRow:focus-visible{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.es-manageRow:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.es-manageLabel{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px))}
.es-effortHeader{display:flex;align-items:center;gap:8px;padding:2px 6px 0}
.es-effortLabel{color:var(--dsw-alias-label-primary);flex:none;font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px))}
.es-effortValue{color:var(--dsw-alias-label-primary);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--dsh-content-font-size,13px);line-height:calc(20px + var(--dsh-content-font-delta,0px))}
.es-track{--es-knob:24px;--es-ease:cubic-bezier(.32,.72,0,1);--es-dur:.46s;position:relative;box-sizing:border-box;height:var(--es-knob);margin:10px 6px 2px;border-radius:999px;corner-shape:round;cursor:pointer;touch-action:none;outline:none;isolation:isolate;background:transparent}
.es-track.es-dragging{--es-dur:.34s}
.es-rail{position:absolute;inset:0;border-radius:999px;corner-shape:round;overflow:hidden;pointer-events:none;container-type:inline-size;background:var(--dsw-alias-interactive-bg-hover,rgba(120,130,145,.24));box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1)}
.es-track:hover:not(.es-disabled) .es-rail{filter:brightness(1.04)}
.es-track:focus-visible .es-rail{box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1),0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary))}
.es-track.es-disabled{cursor:default;opacity:1}
.es-fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:999px 0 0 999px;corner-shape:round;overflow:hidden;background:linear-gradient(90deg,#33e0a1 0%,#18d7d1 34%,#1bbcf0 60%,#2f7cf6 100%);transition:width var(--es-dur) var(--es-ease)}
.es-sparkles{position:absolute;inset:0;border-radius:inherit;corner-shape:round;pointer-events:none;background-image:radial-gradient(circle at 12% 38%,rgba(255,255,255,.55) 1.2px,transparent 1.8px),radial-gradient(circle at 23% 70%,rgba(255,255,255,.32) .9px,transparent 1.4px),radial-gradient(circle at 39% 30%,rgba(255,255,255,.45) 1.4px,transparent 2px),radial-gradient(circle at 53% 66%,rgba(255,255,255,.3) .9px,transparent 1.4px),radial-gradient(circle at 69% 40%,rgba(255,255,255,.4) 1.2px,transparent 1.8px),radial-gradient(circle at 83% 64%,rgba(255,255,255,.28) .8px,transparent 1.3px);animation:es-twinkle 2.8s ease-in-out infinite alternate}
.es-shine{position:absolute;inset:0;border-radius:inherit;corner-shape:round;pointer-events:none;background:linear-gradient(105deg,transparent 28%,rgba(255,255,255,.3) 47%,rgba(255,255,255,.08) 56%,transparent 72%);background-size:240% 100%;mix-blend-mode:screen;animation:es-shine 4s linear infinite}
.es-dots{position:absolute;inset:0;pointer-events:none}
.es-fill .es-dots{inset:auto;left:0;top:0;bottom:0;width:100cqw}
.es-dot{position:absolute;top:50%;display:block;width:7px;height:7px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-label-tertiary,#adb2b8);opacity:.62;transform:translate(-50%,-50%);transition:transform .18s cubic-bezier(.34,1.56,.64,1),opacity .18s ease;will-change:transform}
.es-dotsOn .es-dot{background:#fff;opacity:.5}
.es-dotHover{transform:translate(-50%,-50%) scale(1.35)}
.es-steps{position:absolute;inset:0;z-index:1;pointer-events:none}
.es-step{position:absolute;top:50%;box-sizing:border-box;width:14px;height:14px;padding:0;border:0;border-radius:0;-webkit-appearance:none;appearance:none;transform:translate(-50%,-50%);background:transparent;cursor:pointer;pointer-events:auto;outline:none}
.es-knob{position:absolute;top:50%;z-index:2;display:block;width:var(--es-knob);height:var(--es-knob);transform:translate(-50%,-50%);transition:left var(--es-dur) var(--es-ease),filter .18s ease;will-change:left;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))}
.es-knob svg{display:block;width:100%;height:100%;pointer-events:none}
.es-track:hover:not(.es-disabled) .es-knob{filter:drop-shadow(0 1px 4px rgba(0,0,0,.5))}
.es-track.es-dragging .es-knob{filter:drop-shadow(0 2px 6px rgba(0,0,0,.55))}
.es-track.es-dragging .es-sparkles,.es-track.es-dragging .es-shine{animation:none}
.es-effortEmpty{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));padding:2px 6px 0;font-size:calc(12px + var(--dsh-content-font-delta-secondary,0px));line-height:18px}
.es-status{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));padding:8px;font-size:calc(12px + var(--dsh-content-font-delta-secondary,0px));line-height:18px}
.es-alerts{display:flex;flex-direction:column;gap:4px;padding:4px 2px 2px;flex:none}
.es-error,.es-warning{display:flex;align-items:flex-start;gap:8px;margin:0;padding:6px 8px;border-radius:8px;font-size:calc(11px + var(--dsh-content-font-delta-secondary,0px));line-height:16px}
.es-error{background:var(--dsw-alias-interactive-bg-hover-danger,rgba(220,38,38,.12));color:var(--dsw-alias-state-error-primary)}
.es-warning{background:var(--dsw-alias-interactive-bg-hover-warning,rgba(245,158,11,.12));color:var(--dsw-alias-state-warn-primary)}
.es-errorText{min-width:0;overflow-wrap:anywhere}
.es-retry{flex:none;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
@keyframes es-shine{0%{background-position:220% 0}100%{background-position:-40% 0}}
@keyframes es-twinkle{0%{opacity:.5}100%{opacity:1}}
@keyframes es-knob-pulse{0%,100%{box-shadow:0 3px 12px rgba(0,0,0,.4),0 0 0 0 rgba(255,255,255,.28)}50%{box-shadow:0 3px 12px rgba(0,0,0,.4),0 0 0 7px rgba(255,255,255,.1)}}
@media (prefers-reduced-motion:reduce){.es-sparkles,.es-shine{animation:none!important}.es-knob,.es-fill{transition:none!important}}
`;

    /** Inline stroke icons copied from the shipped icon set artwork. */
    function chevronDown({ className, size } = {}) {
      return h(
        'svg',
        {
          className,
          width: size || 14,
          height: size || 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1,
          'aria-hidden': true,
        },
        h('path', { d: 'M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6' }),
      );
    }

    function chevronRight({ className, size } = {}) {
      return h(
        'svg',
        {
          className,
          width: size || 12,
          height: size || 12,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1,
          'aria-hidden': true,
        },
        h('path', { d: 'M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4' }),
      );
    }

    function check({ className, size } = {}) {
      return h(
        'svg',
        {
          className,
          width: size || 14,
          height: size || 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1,
          'aria-hidden': true,
        },
        h('path', { d: 'M2.25 8.5L5.49732 11.7473C5.90519 12.1552 6.57263 12.1344 6.95426 11.7018L13.75 4' }),
      );
    }

    /** Compact-model icon shown when the composer hides the model text. */
    function modelIcon({ className } = {}) {
      return h(
        'svg',
        {
          className,
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1,
          'aria-hidden': true,
        },
        h('ellipse', { cx: 8, cy: 4, rx: 5.5, ry: 2.5 }),
        h('path', { d: 'M2.5 4v4c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5V4' }),
        h('path', { d: 'M2.5 8v4c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5V8' }),
      );
    }

    /**
     * Click the Models row in an open Settings dialog. The row index comes from the
     * live `settings.section` ledger (the shell sorts its nav by `order`), with a
     * localized label fallback for shells whose registry is not exposed here.
     */
    function selectModelsSection(scope, panel) {
      let index = -1;
      try {
        const sections = scope.slots
          .entries('settings.section')
          .map((entry) => ({
            id: entry.options === undefined || entry.options.id === undefined ? '' : entry.options.id,
            order: entry.options === undefined || entry.options.order === undefined ? 0 : entry.options.order,
          }))
          .sort((left, right) => left.order - right.order);
        index = sections.findIndex((section) => section.id === 'models');
      } catch (_error) {
        index = -1;
      }
      const nav = panel.querySelector('nav');
      const buttons = nav === null ? [] : Array.from(nav.querySelectorAll('button'));
      let target = index >= 0 && index < buttons.length ? buttons[index] : null;
      if (target === null) {
        const label = /^(模型|Models?|モデル|모델|Модели|Modèles|Modelle|Modelos|Modelli)$/i;
        target = buttons.find((button) => label.test((button.textContent || '').trim())) || null;
      }
      if (target !== null) target.click();
    }

    /**
     * Open Settings on its Models section. The settings shell keeps its open
     * state in the store registered on `sidebar.settings`, so the exact live
     * instance is reachable through the slot ledger. If that route is absent,
     * invoke the shipped `settings.open` command and click the Models row in the
     * rendered dialog instead.
     */
    function openModelsSettings(scope) {
      const existing = document.querySelector('[data-shortcut-modal="settings"]');
      if (existing !== null) {
        selectModelsSection(scope, existing);
        return;
      }
      let opened = false;
      try {
        const entries =
          typeof scope.slots.entriesOfSlot === 'function'
            ? scope.slots.entriesOfSlot('sidebar.settings')
            : scope.slots.entries('sidebar.settings');
        const entry = entries.find(
          (candidate) =>
            candidate !== undefined &&
            candidate !== null &&
            candidate.store !== undefined &&
            typeof candidate.store.create === 'function',
        );
        const instance = entry === undefined ? undefined : entry.store.create();
        if (
          instance !== undefined &&
          instance !== null &&
          instance.actions !== undefined &&
          typeof instance.actions.openSection === 'function'
        ) {
          instance.actions.openSection('models');
          opened = true;
        }
      } catch (_error) {
        opened = false;
      }
      if (!opened) {
        const shortcuts = scope.shortcuts;
        const registry = shortcuts === undefined || shortcuts === null ? undefined : shortcuts.registry;
        if (registry !== undefined && registry !== null && typeof registry.invoke === 'function') {
          registry.invoke('settings.open', { region: 'page', modal: null, target: null });
        }
      }
      // The dialog is portaled on the next React commit; retry briefly when the
      // shell store route missed and the command opened the dialog asynchronously.
      let attempts = 0;
      const settle = () => {
        const panel = document.querySelector('[data-shortcut-modal="settings"]');
        if (panel === null) {
          if (attempts < 40) {
            attempts += 1;
            window.setTimeout(settle, 50);
          }
          return;
        }
        selectModelsSection(scope, panel);
      };
      window.setTimeout(settle, 30);
    }

    const RECENT_KEY = 'dsh-effort-menu/recent-models';
    /** The menu lists at most this many recent models, the current one included. */
    const RECENT_VISIBLE = 3;

    /** Read the most recently used model/provider pairs from this browser profile. */
    function readRecentModels() {
      try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        const parsed = raw === null ? [] : JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((entry) => entry !== null && typeof entry === 'object' && typeof entry.provider === 'string' && typeof entry.model === 'string');
      } catch (_error) {
        return [];
      }
    }

    /** Remember one model choice in front; keep the list short. */
    function rememberRecentModel(provider, model) {
      try {
        const previous = readRecentModels().filter((entry) => entry.provider !== provider || entry.model !== model);
        window.localStorage.setItem(RECENT_KEY, JSON.stringify([{ provider, model }, ...previous].slice(0, 6)));
      } catch (_error) {
        // Storage may be unavailable in a private or restricted context; recency is optional.
      }
    }

    /**
     * The order the recent list keeps while the menu stays open: the current model first, then the
     * stored history. Choosing a row afterwards must not reshuffle the rows under the pointer.
     */
    function seedRecent(stored, current) {
      if (current === null || current === undefined) return stored;
      return [
        { provider: current.provider, model: current.model },
        ...stored.filter((entry) => entry.provider !== current.provider || entry.model !== current.model),
      ];
    }

    /**
     * A model just chosen joins the front of the open menu's recent list, unless it is already one
     * of the rows shown. Rows already shown keep their places, and a row that came in stays until
     * the menu closes.
     */
    function promoteRecent(list, provider, model) {
      const at = list.findIndex((entry) => entry.provider === provider && entry.model === model);
      if (at >= 0 && at < RECENT_VISIBLE) return list;
      return [{ provider, model }, ...list.filter((entry) => entry.provider !== provider || entry.model !== model)];
    }

    const LAST_EFFORT_KEY = 'dsh-effort-menu/last-effort';

    /** The effort level the user last had on a model that offers levels, if one was stored. */
    function readLastEffort() {
      try {
        const raw = window.localStorage.getItem(LAST_EFFORT_KEY);
        return typeof raw === 'string' && raw !== '' ? raw : undefined;
      } catch (_error) {
        return undefined;
      }
    }

    function writeLastEffort(effort) {
      try {
        window.localStorage.setItem(LAST_EFFORT_KEY, effort);
      } catch (_error) {
        // Storage may be unavailable; inheritance then only works from the model being left.
      }
    }

    /** Forget the inherited level after an explicit "Default" choice. */
    function clearLastEffort() {
      try {
        window.localStorage.removeItem(LAST_EFFORT_KEY);
      } catch (_error) {
        // Storage may be unavailable; the stale value only affects a later switch.
      }
    }

    /**
     * Effort to request for `model` when switching to it. Keep the level the user had if the model
     * offers it; if not, use its highest level (levels are listed low to high). With nothing to
     * inherit, keep the provider default when the model declares one; otherwise request no explicit
     * level so the provider's own default applies. Returns undefined when no explicit level should
     * be sent, including for a model without levels.
     */
    function effortForModel(model, wanted) {
      const reasoning = model === undefined || model === null ? undefined : model.reasoning;
      const efforts = reasoning === undefined || reasoning === null || !Array.isArray(reasoning.efforts) ? [] : reasoning.efforts;
      if (efforts.length === 0) return undefined;
      const highest = efforts[efforts.length - 1].id;
      if (wanted !== undefined) return efforts.some((level) => level.id === wanted) ? wanted : highest;
      if (reasoning.defaultEffort !== undefined && efforts.some((level) => level.id === reasoning.defaultEffort)) return reasoning.defaultEffort;
      return undefined;
    }

    /**
     * The gradient track. Pointer drags preview an index locally and commit once
     * on release, so a drag across five levels sends one selection instead of five.
     */
    function EffortControl({ label, levels, index, disabled, onCommit, scope }) {
      const trackRef = React.useRef(null);
      const dragRef = React.useRef(false);
      const movedRef = React.useRef(false);
      const startXRef = React.useRef(0);
      const inflightRef = React.useRef(false);
      const queuedRef = React.useRef(null);
      const commitRef = React.useRef(onCommit);
      commitRef.current = onCommit;
      // Level shown while the pointer is down. The knob only ever rests on a node, so a drag
      // previews whole levels: it steps to the next one once the pointer passes the midpoint.
      const [preview, setPreview] = React.useState(null);
      const [hoverIndex, setHoverIndex] = React.useState(null);
      const [dragging, setDragging] = React.useState(false);
      // Level chosen here but not yet echoed back by the model directory. Showing it at once
      // keeps the knob from waiting on (or snapping back before) the round trip. It belongs to the
      // model it was chosen on (`scope`), so it cannot outlive a switch to another model.
      const [optimistic, setOptimistic] = React.useState(null);
      const pending = optimistic !== null && optimistic.scope === scope ? optimistic.value : null;
      const last = Math.max(0, levels.length - 1);
      const committed = Math.min(Math.max(pending === null ? index : pending, 0), last);
      const displayIndex = preview === null ? committed : Math.min(last, Math.max(0, preview));
      const displayRatio = last === 0 ? 0 : displayIndex / last;
      const valueText = levels[displayIndex] === undefined ? '' : levels[displayIndex].name;
      // Track, knob, and step nodes share --es-knob; railPosition maps 0..1 onto cap-centre span.
      // Both rail ends are half circles of radius --es-knob / 2 and the knob has the same diameter,
      // so at either end the knob exactly covers the end cap. The 0..1 value maps onto the span
      // between the two cap centres: left = value * 100% + (0.5 - value) * knob.
      const railPosition = (value) => 'calc(' + (value * 100).toFixed(4) + '% + ' + (0.5 - value).toFixed(4) + ' * var(--es-knob))';
      const nodePosition = railPosition;
      const nodeLeft = (stepIndex) => nodePosition(last === 0 ? 0 : stepIndex / last);

      /**
       * One layer of level dots. The grey layer lies on the rail. The white layer is drawn inside
       * the fill and clipped by it, so a dot turns white at the moment the animated fill reaches it
       * rather than all at once when the level changes.
       */
      const dotLayer = (className) =>
        h(
          'span',
          { className, 'aria-hidden': true },
          levels.map((level, stepIndex) =>
            h('span', {
              key: level.id === undefined ? 'default' : String(level.id),
              className: 'es-dot' + (hoverIndex === stepIndex ? ' es-dotHover' : ''),
              style: { left: nodeLeft(stepIndex) },
            }),
          ),
        );

      /**
       * Pointer position in level units (0..last, fractional) plus the pixel size of the knob and
       * of one level. Nodes sit between the two end-cap centres, so the pointer is measured against
       * that same span; measuring the full track width put the snap midpoints off the nodes.
       */
      const measure = (clientX) => {
        const track = trackRef.current;
        if (track === null || last === 0) return { f: committed, knob: 24, perLevel: 1 };
        const rect = track.getBoundingClientRect();
        const parsed = parseFloat(window.getComputedStyle(track).getPropertyValue('--es-knob'));
        const knob = Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
        const span = Math.max(1, rect.width - knob);
        const f = Math.min(last, Math.max(0, ((clientX - rect.left - knob / 2) / span) * last));
        return { f, knob, perLevel: span / last };
      };

      /** Dragging: the nearest node, so the level changes exactly when the pointer passes a midpoint. */
      const nearestLevel = (clientX) => Math.round(measure(clientX).f);

      /**
       * Pressing without dragging: the nearest node, except that a press beside the knob (not on
       * it) steps one level toward the pointer. Otherwise the half of a gap nearest the current
       * node would do nothing at all.
       */
      const pressedLevel = (clientX) => {
        const { f, knob, perLevel } = measure(clientX);
        const nearest = Math.round(f);
        if (nearest !== committed) return nearest;
        const offset = (f - committed) * perLevel;
        if (Math.abs(offset) <= knob / 2) return committed;
        return Math.min(last, Math.max(0, committed + (offset > 0 ? 1 : -1)));
      };

      /** Send levels one at a time; a click made while one is in flight replaces any queued one. */
      const run = (next) => {
        inflightRef.current = true;
        let result;
        try {
          result = Promise.resolve(commitRef.current(next));
        } catch (_error) {
          result = Promise.resolve(false);
        }
        const settle = () => {
          if (queuedRef.current !== null) {
            const queued = queuedRef.current;
            queuedRef.current = null;
            run(queued);
            return;
          }
          inflightRef.current = false;
          // Let the directory's own update render first, so a successful change does not
          // flash back to the old level; a failed one falls back to it here. A timer rather than
          // an animation frame: frames do not run in a background tab.
          window.setTimeout(() => setOptimistic(null), 60);
        };
        result.then(settle, settle);
      };

      const commit = (next) => {
        setOptimistic({ scope, value: next });
        if (inflightRef.current) {
          queuedRef.current = next;
          return;
        }
        run(next);
      };

      const finish = (event) => {
        if (!dragRef.current) return;
        dragRef.current = false;
        setDragging(false);
        const next = movedRef.current ? nearestLevel(event.clientX) : pressedLevel(event.clientX);
        setPreview(null);
        if (next !== committed) commit(next);
      };

      const cancel = () => {
        dragRef.current = false;
        setDragging(false);
        setPreview(null);
      };

      return h(
        'div',
        { className: 'es-effortBlock' },
        h(
          'div',
          { className: 'es-effortHeader' },
          h('span', { className: 'es-effortLabel' }, label),
          h('span', { className: 'es-effortValue' }, valueText),
        ),
        levels.length === 0
          ? h('div', { className: 'es-effortEmpty' }, '—')
          : h(
              'div',
              {
                ref: trackRef,
                className: 'es-track' + (disabled ? ' es-disabled' : '') + (dragging ? ' es-dragging' : ''),
                role: 'slider',
                tabIndex: disabled ? -1 : 0,
                'aria-label': label,
                'aria-disabled': disabled ? true : undefined,
                'aria-valuemin': 0,
                'aria-valuemax': last,
                'aria-valuenow': displayIndex,
                'aria-valuetext': valueText,
                onPointerDown: (event) => {
                  if (disabled) return;
                  if (trackRef.current !== null) trackRef.current.focus({ preventScroll: true });
                  event.preventDefault();
                  dragRef.current = true;
                  movedRef.current = false;
                  startXRef.current = event.clientX;
                  setDragging(true);
                  try {
                    if (event.currentTarget.setPointerCapture !== undefined) {
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }
                  } catch (_error) {
                    // Capture is only a convenience for drags that leave the track.
                  }
                  setPreview(pressedLevel(event.clientX));
                },
                onPointerMove: (event) => {
                  if (!dragRef.current || disabled) return;
                  // A press that barely moves stays a click, so a shaky hand cannot override it.
                  if (!movedRef.current) {
                    if (Math.abs(event.clientX - startXRef.current) < 4) return;
                    movedRef.current = true;
                  }
                  event.preventDefault();
                  setPreview(nearestLevel(event.clientX));
                },
                onPointerUp: finish,
                onPointerCancel: cancel,
                onLostPointerCapture: () => {
                  if (dragRef.current) cancel();
                },
                onKeyDown: (event) => {
                  if (disabled) return;
                  let next = committed;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(last, committed + 1);
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, committed - 1);
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = last;
                  else return;
                  event.preventDefault();
                  if (next !== committed) commit(next);
                },
              },
              h(
                'span',
                { className: 'es-rail', 'aria-hidden': true },
                dotLayer('es-dots'),
                h(
                  'span',
                  { className: 'es-fill', style: { width: railPosition(displayRatio) } },
                  h('span', { className: 'es-sparkles' }),
                  h('span', { className: 'es-shine' }),
                  dotLayer('es-dots es-dotsOn'),
                ),
              ),
              h(
                'span',
                { className: 'es-steps' },
                levels.map((level, stepIndex) =>
                  h('button', {
                    key: level.id === undefined ? 'default' : String(level.id),
                    type: 'button',
                    tabIndex: -1,
                    'aria-label': level.name,
                    title: level.name,
                    className: 'es-step',
                    style: { left: nodeLeft(stepIndex) },
                    onMouseEnter: () => setHoverIndex(stepIndex),
                    onMouseLeave: () => setHoverIndex((current) => (current === stepIndex ? null : current)),
                    onClick: () => {
                      if (disabled) return;
                      setPreview(null);
                      if (stepIndex !== committed) commit(stepIndex);
                    },
                  }),
                ),
              ),
              h(
                'span',
                { className: 'es-knob', style: { left: railPosition(displayRatio) } },
                h(
                  'svg',
                  { viewBox: '0 0 28 28', 'aria-hidden': true },
                  h('circle', { cx: 14, cy: 14, r: 14, fill: '#fff' }),
                ),
              ),
            ),
      );
    }

    /** Keep the account and official providers first, preserving every other group's order. */
    function orderGroups(groups) {
      const rank = (group) => (group.id === 'deepseek-account' ? 0 : group.id === 'deepseek-official' ? 1 : 2);
      return [...groups].sort((left, right) => rank(left) - rank(right));
    }

    /** Localized provider name; the account provider's catalog name is not translated by the Host. */
    function providerDisplayName(group, t) {
      if (group === undefined || group === null) return '';
      return group.id === 'deepseek-account' ? t('provider.account') : group.name || group.displayName || group.id;
    }

    /**
     * Composer model seat replacement.
     *
     * @param props - owner share (`locked`), the injected directory face, and locale `t`.
     * @returns the trigger button plus, while open, a portaled menu.
     */
    function EffortSeat({ locked, available, directory, load, select, resolveText, t, manageModels }) {
      const state = React.useSyncExternalStore(
        (callback) => directory.subscribe(callback),
        () => directory.getSnapshot(),
      );
      const [open, setOpen] = React.useState(false);
      const [position, setPosition] = React.useState(null);
      const [error, setError] = React.useState(null);
      // True while the all-models flyout is shown to the right of the menu.
      const [showAll, setShowAll] = React.useState(false);
      const [flyoutPos, setFlyoutPos] = React.useState(null);
      const [recent, setRecent] = React.useState(() => readRecentModels());
      // True while an effort level is being saved. The directory reports that as `pending` too, but
      // only the effort block should react to it, not the model rows or the trigger.
      const [effortSaving, setEffortSaving] = React.useState(false);
      const rootRef = React.useRef(null);
      const triggerRef = React.useRef(null);
      const menuRef = React.useRef(null);
      const flyoutRef = React.useRef(null);
      const providerRef = React.useRef(null);
      const hoverTimerRef = React.useRef(null);
      const focusFlyoutRef = React.useRef(false);
      // A failure can come from a catalog load or from a selection; only the former belongs to
      // `state.error`'s catalog alert, while selection failures render from local `error`.
      const lastActionRef = React.useRef('load');

      const groups = orderGroups(state.groups || []);
      const current = state.current;
      let currentGroup = null;
      let currentModel = null;
      if (current !== null && current !== undefined) {
        currentGroup = groups.find((group) => group.id === current.provider) || null;
        currentModel = currentGroup === null ? null : currentGroup.models.find((model) => model.id === current.model) || null;
      }
      const activeGroup = currentGroup !== null && currentGroup !== undefined ? currentGroup : groups.length > 0 ? groups[0] : null;
      const reasoning = currentModel === null || currentModel === undefined ? undefined : currentModel.reasoning;
      const efforts = reasoning === undefined || reasoning === null || !Array.isArray(reasoning.efforts) ? [] : reasoning.efforts;
      const hasDefaultLevel = efforts.length > 0 && (reasoning.defaultEffort === undefined || reasoning.defaultEffort === null);
      const levels = hasDefaultLevel ? [{ id: undefined, name: t('effort.default'), isDefault: true }, ...efforts] : efforts;
      const effectiveEffort = current === null || current === undefined ? undefined : current.reasoningEffort ?? (reasoning === undefined || reasoning === null ? undefined : reasoning.defaultEffort);
      let effortIndex = levels.findIndex((level) => level.id === effectiveEffort);
      if (effortIndex < 0) effortIndex = 0;
      let effortLabel;
      if (currentChoiceMissing(currentModel, state)) effortLabel = undefined;
      else if (reasoning === undefined || reasoning === null) effortLabel = state.retainedEffort;
      else if (effectiveEffort === undefined) effortLabel = t('effort.default');
      else {
        const level = levels.find((entry) => entry.id === effectiveEffort);
        effortLabel = level === undefined ? effectiveEffort : level.name;
      }
      const waiting = currentModel === null && state.status === 'loading';
      const modelLabel = waiting ? t('trigger.loading') : currentModel === null ? t('trigger.fallback') : currentModel.name;
      const busy = state.pending !== null && state.pending !== undefined;
      const modelBusy = busy && !effortSaving;
      const loadFailures = Array.isArray(state.failures) ? state.failures : [];
      const loadError =
        lastActionRef.current !== 'load' || state.error === null || state.error === undefined || state.error === ''
          ? null
          : String(state.error);
      const triggerTitle = effortLabel === undefined ? modelLabel : modelLabel + ' · ' + effortLabel;
      const triggerAria =
        waiting
          ? t('trigger.loading')
          : currentModel === null
            ? t('trigger.selectAria')
            : effortLabel === undefined
              ? t('trigger.aria', { model: modelLabel })
              : t('trigger.ariaEffort', { model: modelLabel, effort: effortLabel });

      const close = (restoreFocus = true) => {
        setOpen(false);
        setPosition(null);
        setShowAll(false);
        setError(null);
        if (restoreFocus && triggerRef.current !== null) triggerRef.current.focus({ preventScroll: true });
      };

      // Opening reads the latest selection and loader through a ref so a stale render can never
      // decide what the menu shows.
      const latestRef = React.useRef(null);
      latestRef.current = { current, load };
      const openMenu = () => {
        const latest = latestRef.current;
        lastActionRef.current = 'load';
        setPosition(null);
        setOpen(true);
        setShowAll(false);
        setError(null);
        setRecent(seedRecent(readRecentModels(), latest.current));
        if (triggerRef.current !== null) triggerRef.current.focus({ preventScroll: true });
        if (typeof latest.load === 'function') latest.load();
      };

      // Remember the level in use, so a later switch can carry it over even from a model that
      // offers no levels.
      const knownEffort = efforts.some((level) => level.id === effectiveEffort) ? effectiveEffort : undefined;
      React.useEffect(() => {
        if (knownEffort !== undefined) writeLastEffort(knownEffort);
      }, [knownEffort]);

      React.useEffect(() => {
        if (!open) return undefined;
        const onMouseDown = (event) => {
          if (rootRef.current !== null && rootRef.current.contains(event.target)) return;
          if (menuRef.current !== null && menuRef.current.contains(event.target)) return;
          if (flyoutRef.current !== null && flyoutRef.current.contains(event.target)) return;
          close(false);
        };
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
      }, [open]);

      // Escape works wherever focus is, not only while it stays inside the seat; a focus move
      // outside the seat also closes the floating menu so it cannot outlive its trigger.
      React.useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          const target = event.target;
          if (rootRef.current !== null && rootRef.current.contains(target)) return;
          if (menuRef.current !== null && menuRef.current.contains(target)) return;
          if (flyoutRef.current !== null && flyoutRef.current.contains(target)) return;
          event.preventDefault();
          close(false);
        };
        const onFocusIn = (event) => {
          const target = event.target;
          if (rootRef.current !== null && rootRef.current.contains(target)) return;
          if (menuRef.current !== null && menuRef.current.contains(target)) return;
          if (flyoutRef.current !== null && flyoutRef.current.contains(target)) return;
          close(false);
        };
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('focusin', onFocusIn, true);
        return () => {
          document.removeEventListener('keydown', onKeyDown, true);
          document.removeEventListener('focusin', onFocusIn, true);
        };
      }, [open]);

      // The menu is anchored by the edge facing the trigger (its bottom edge when it opens upward),
      // so it grows away from the trigger when its content changes, e.g. when a model switch adds or
      // removes the effort block. The side is chosen from the room available, never from the
      // menu's own height, so a content change cannot flip it. Placed once per opening and again
      // on resize/scroll.
      React.useLayoutEffect(() => {
        if (!open) return undefined;
        const place = () => {
          const trigger = triggerRef.current;
          const menu = menuRef.current;
          if (trigger === null) return;
          const rect = trigger.getBoundingClientRect();
          const width = menu === null ? 300 : menu.offsetWidth;
          const margin = 12;
          const gap = 8;
          const left = Math.min(Math.max(margin, rect.right - width), Math.max(margin, window.innerWidth - width - margin));
          const roomAbove = rect.top - gap - margin;
          const roomBelow = window.innerHeight - rect.bottom - gap - margin;
          const above = roomAbove >= 260 || roomAbove >= roomBelow;
          const next = above
            ? { left, bottom: window.innerHeight - rect.top + gap, maxHeight: Math.max(120, Math.min(480, roomAbove)) }
            : { left, top: rect.bottom + gap, maxHeight: Math.max(120, Math.min(480, roomBelow)) };
          setPosition((previous) =>
            previous !== null &&
            Math.abs(previous.left - next.left) < 0.5 &&
            Math.abs((previous.top ?? 0) - (next.top ?? 0)) < 0.5 &&
            Math.abs((previous.bottom ?? 0) - (next.bottom ?? 0)) < 0.5 &&
            Math.abs(previous.maxHeight - next.maxHeight) < 0.5
              ? previous
              : next,
          );
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
          window.removeEventListener('resize', place);
          window.removeEventListener('scroll', place, true);
        };
      }, [open]);

      // What decides the menu's height: whether the effort block is there and which kind, the error
      // row, and how many recent rows there are. A change re-aligns the flyout with the provider row.
      const menuShape =
        (currentModel === null ? 'none' : levels.length === 0 ? 'empty' : 'effort') +
        (error === null ? '' : '+error') +
        (loadError === null ? '' : '+loaderror') +
        ':' + Math.min(recent.length, RECENT_VISIBLE) +
        ':' + loadFailures.length;

      // Place the all-models flyout beside the menu. It lines up with the provider row, is
      // clamped so its bottom edge never leaves the viewport, and flips to the menu's left
      // side when the right side has no room.
      React.useLayoutEffect(() => {
        if (!open || !showAll || position === null) {
          setFlyoutPos((previous) => (previous === null ? previous : null));
          return undefined;
        }
        const placeFlyout = () => {
          const menu = menuRef.current;
          const flyout = flyoutRef.current;
          const anchor = providerRef.current;
          if (menu === null || flyout === null || anchor === null) return;
          const menuRect = menu.getBoundingClientRect();
          const anchorRect = anchor.getBoundingClientRect();
          const width = flyout.offsetWidth;
          const height = flyout.offsetHeight;
          const margin = 12;
          const gap = 4;
          let left = menuRect.right + gap;
          if (left + width > window.innerWidth - margin) left = menuRect.left - gap - width;
          left = Math.max(margin, left);
          const top = Math.max(margin, Math.min(anchorRect.top - 6, window.innerHeight - margin - height));
          setFlyoutPos((previous) =>
            previous !== null && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.top - top) < 0.5 ? previous : { left, top },
          );
        };
        placeFlyout();
        window.addEventListener('resize', placeFlyout);
        window.addEventListener('scroll', placeFlyout, true);
        // The provider row moves when the menu changes height (a model switch can add or remove the
        // effort block), so keep the flyout lined up with it.
        let observer = null;
        if (typeof window.ResizeObserver === 'function' && menuRef.current !== null) {
          observer = new window.ResizeObserver(placeFlyout);
          observer.observe(menuRef.current);
        }
        return () => {
          window.removeEventListener('resize', placeFlyout);
          window.removeEventListener('scroll', placeFlyout, true);
          if (observer !== null) observer.disconnect();
        };
      }, [open, showAll, position, groups.length, menuShape]);

      // Keyboard users open the flyout with ArrowRight; move focus into it once it is visible.
      React.useEffect(() => {
        if (flyoutPos === null || !focusFlyoutRef.current || flyoutRef.current === null) return;
        focusFlyoutRef.current = false;
        const target = flyoutRef.current.querySelector('.es-modelRow[aria-checked="true"]') || flyoutRef.current.querySelector('.es-modelRow');
        if (target !== null) target.focus({ preventScroll: true });
      }, [flyoutPos]);

      React.useEffect(
        () => () => {
          if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
        },
        [],
      );

      if (!available) return null;

      const cancelFlyoutClose = () => {
        if (hoverTimerRef.current === null) return;
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      };
      const openFlyout = () => {
        if (locked) return;
        cancelFlyoutClose();
        setShowAll(true);
      };
      // A short delay lets the pointer cross the gap between the provider row and the flyout.
      const scheduleFlyoutClose = () => {
        cancelFlyoutClose();
        hoverTimerRef.current = window.setTimeout(() => {
          hoverTimerRef.current = null;
          setShowAll(false);
        }, 160);
      };

      /** Resolves true when the level was saved, so the slider knows whether to keep it. */
      const submitEffort = (index) => {
        const level = levels[index];
        if (current === null || current === undefined || level === undefined) return Promise.resolve(false);
        lastActionRef.current = 'select';
        setError(null);
        setEffortSaving(true);
        const selection = { provider: current.provider, model: current.model };
        if (level.id !== undefined && level.id !== null) selection.reasoningEffort = level.id;
        return select(selection).then(
          (result) => {
            if (result === undefined || result.ok) return true;
            setError(
              result.error !== undefined && result.error.code === 'session/writer-held'
                ? t('error.sessionInUse')
                : t('error.action', { message: result.error === undefined ? String(result) : result.error.code + ': ' + result.error.message }),
            );
            return false;
          },
          (failure) => {
            setError(t('error.action', { message: failure instanceof Error ? failure.message : String(failure) }));
            return false;
          },
        ).then((saved) => {
          if (saved && (level.id === undefined || level.id === null)) clearLastEffort();
          setEffortSaving(false);
          return saved;
        });
      };

      /**
       * Switch model and leave the menu open. The effort level in use carries over when the new
       * model offers it, otherwise the new model's highest level is requested. The host would
       * otherwise reset it to the model's own default.
       */
      const chooseModel = (group, model) => {
        if (busy || locked) return;
        if (current !== null && current !== undefined && current.provider === group.id && current.model === model.id) return;
        lastActionRef.current = 'select';
        setError(null);
        const selection = { provider: group.id, model: model.id };
        // An explicit "Default" on a model that advertises levels must stay a default choice;
        // only a model without level metadata falls back to the last level used elsewhere.
        const inheritedEffort = reasoning !== undefined && reasoning !== null ? effectiveEffort : (effectiveEffort ?? readLastEffort());
        const effort = effortForModel(model, inheritedEffort);
        if (effort !== undefined) selection.reasoningEffort = effort;
        select(selection).then(
          (result) => {
            if (result === undefined || result.ok) {
              rememberRecentModel(group.id, model.id);
              setRecent((list) => promoteRecent(list, group.id, model.id));
              return;
            }
            setError(
              result.error !== undefined && result.error.code === 'session/writer-held'
                ? t('error.sessionInUse')
                : t('error.action', { message: result.error === undefined ? String(result) : result.error.code + ': ' + result.error.message }),
            );
          },
          (failure) => {
            setError(t('error.action', { message: failure instanceof Error ? failure.message : String(failure) }));
          },
        );
      };

      /**
       * Render one model name with the catalog badge.
       *
       * The `conversation.input.model.label` child slot is owned by the shipped model-selection
       * entry. A replacement occupant must not declare that child again: SlotCore rejects a second
       * declaration and the whole entry fails to load. The fallback content is therefore rendered
       * directly here.
       */
      const renderModelLabel = (group, model) => {
        const badgeText =
          model.badge === undefined
            ? null
            : typeof model.badge.text === 'string'
              ? model.badge.text
              : resolveText === undefined
                ? ''
                : resolveText(model.badge.text);
        const content =
          badgeText === null || badgeText === ''
            ? model.name
            : h(React.Fragment, null, model.name, ' ', h('span', { className: 'es-modelBadge' }, badgeText));
        return h('span', { className: 'es-modelLabel', 'data-provider-id': group.id, 'data-model-id': model.id }, content);
      };

      const trigger = h(
        'button',
        {
          ref: triggerRef,
          type: 'button',
          className: 'es-trigger',
          'aria-label': triggerAria,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          title: triggerTitle,
          'aria-busy': modelBusy,
          disabled: locked,
          onClick: () => {
            if (open) close();
            else openMenu();
          },
        },
        h(modelIcon, { className: 'es-triggerIcon' }),
        h(
          'span',
          { className: 'es-triggerLabel' },
          currentGroup !== null && currentModel !== null ? renderModelLabel(currentGroup, currentModel) : modelLabel,
        ),
        effortLabel === undefined ? null : h('span', { className: 'es-triggerEffort' }, effortLabel),
        modelBusy ? h('span', { className: 'es-spinner', 'aria-hidden': true }) : h(chevronDown, { className: 'es-chevron' + (open ? ' es-chevronOpen' : '') }),
      );

      const renderModelRow = (group, model, keyPrefix) => {
        const selected = current !== null && current !== undefined && current.provider === group.id && current.model === model.id;
        return h(
          'button',
          {
            key: keyPrefix + ':' + group.id + ':' + model.id,
            type: 'button',
            role: 'menuitemradio',
            'aria-checked': selected,
            className: 'es-modelRow' + (selected ? ' es-modelRowSelected' : ''),
            title: model.name,
            disabled: busy || locked,
            onClick: () => chooseModel(group, model),
          },
          h('span', { className: 'es-modelName' }, renderModelLabel(group, model)),
          h('span', { className: 'es-check' }, selected ? h(check, {}) : null),
        );
      };

      const recentEntries = [];
      const seenModels = new Set();
      const rememberEntry = (group, model) => {
        if (group === undefined || group === null || model === undefined || model === null) return;
        const key = group.id + '/' + model.id;
        if (seenModels.has(key)) return;
        seenModels.add(key);
        recentEntries.push({ group, model });
      };
      for (const entry of recent) {
        const group = groups.find((candidate) => candidate.id === entry.provider);
        const model = group === undefined ? undefined : group.models.find((candidate) => candidate.id === entry.model);
        rememberEntry(group, model);
      }
      // `recent` keeps the order fixed when the menu opened, so choosing a row does not move it. A
      // model chosen since then (e.g. from the flyout) that is not among the rows shown goes on
      // top, so the current model is always visible.
      let visibleEntries = recentEntries.slice(0, RECENT_VISIBLE);
      if (current !== null && current !== undefined && currentModel !== null && !visibleEntries.some((entry) => entry.group.id === current.provider && entry.model.id === current.model)) {
        visibleEntries = [{ group: currentGroup, model: currentModel }, ...visibleEntries].slice(0, RECENT_VISIBLE);
      }
      const recentRows = visibleEntries.map((entry) => renderModelRow(entry.group, entry.model, 'recent'));
      const allGroups =
        groups.length === 0
          ? h('div', { className: 'es-status' }, state.status === 'loading' ? t('status.loading') : t('empty.groups'))
          : groups.map((group) =>
              h(
                'div',
                { key: group.id, className: 'es-modelGroup' },
                h('div', { className: 'es-groupHeading' }, providerDisplayName(group, t)),
                group.models.map((model) => renderModelRow(group, model, 'all')),
              ),
            );
      const modelContent =
        recentRows.length > 0
          ? recentRows
          : activeGroup === null
            ? h('div', { className: 'es-status' }, state.status === 'loading' ? t('status.loading') : t('empty.groups'))
            : activeGroup.models.map((model) => renderModelRow(activeGroup, model, 'active'));
      const sectionLabel = recentRows.length > 0 ? t('menu.recent') : t('menu.model');

      const providerRow = h(
        'button',
        {
          ref: providerRef,
          type: 'button',
          className: 'es-provider' + (showAll ? ' es-providerOpen' : ''),
          'aria-haspopup': 'menu',
          'aria-expanded': showAll,
          disabled: locked,
          title: activeGroup === null ? undefined : providerDisplayName(activeGroup, t),
          onMouseEnter: openFlyout,
          onMouseLeave: scheduleFlyoutClose,
          onClick: openFlyout,
          onKeyDown: (event) => {
            if (event.key !== 'ArrowRight') return;
            event.preventDefault();
            focusFlyoutRef.current = true;
            openFlyout();
          },
        },
        h('span', { className: 'es-providerName' }, activeGroup === null ? modelLabel : providerDisplayName(activeGroup, t)),
        h(chevronRight, { className: 'es-providerChevron' }),
      );

      const retryLoad = () => {
        lastActionRef.current = 'load';
        setError(null);
        if (typeof load === 'function') load();
      };
      const alertRow = (kind, key, message) =>
        h(
          'div',
          { key, className: kind },
          h('span', { className: 'es-errorText' }, message),
          h('button', { type: 'button', className: 'es-retry', onClick: retryLoad }, t('retry')),
        );
      const alerts = [];
      if (loadError !== null) alerts.push(alertRow('es-error', 'catalog-error', t('error.action', { message: loadError })));
      loadFailures.forEach((failure, index) => {
        const name =
          failure !== null && typeof failure === 'object' && failure.id === 'deepseek-account'
            ? t('provider.account')
            : failure !== null && typeof failure === 'object'
              ? failure.name || failure.id || ''
              : String(failure);
        const message =
          failure !== null && typeof failure === 'object' && failure.message !== undefined ? failure.message : String(failure);
        alerts.push(alertRow('es-warning', 'failure:' + (failure && failure.id ? failure.id : index), t('warning.groupLoad', { name, message })));
      });

      const rootPane = h(
        React.Fragment,
        null,
        alerts.length === 0 ? null : h('div', { className: 'es-alerts' }, alerts),
        h('div', { className: 'es-modelSection' }, providerRow, h('div', { className: 'es-providerDivider' }), h('div', { className: 'es-sectionLabel' }, sectionLabel), modelContent),
        // No effort block until a model is chosen: there is nothing to set yet.
        currentModel === null ? null : h('div', { className: 'es-effortDivider' }),
        currentModel === null
          ? null
          : reasoning === undefined || levels.length === 0
          ? h(
              'div',
              { className: 'es-effortBlock' },
              h(
                'div',
                { className: 'es-effortHeader' },
                h('span', { className: 'es-effortLabel' }, t('menu.effort')),
                h('span', { className: 'es-effortValue' }, '—'),
              ),
              h('div', { className: 'es-effortEmpty' }, t('empty.efforts')),
            )
          : h(EffortControl, {
              label: t('menu.effort'),
              levels,
              index: effortIndex,
              disabled: locked || modelBusy || current === null,
              onCommit: submitEffort,
              scope: current === null ? '' : current.provider + '/' + current.model,
            }),
        error === null ? null : h('div', { className: 'es-error' }, h('span', { className: 'es-errorText' }, error)),
      );

      const menu = h(
        'div',
        {
          ref: menuRef,
          className: 'es-menu',
          role: 'menu',
          'aria-label': t('menu.aria'),
          style:
            position === null
              ? { left: 0, top: 0, visibility: 'hidden' }
              : position.bottom !== undefined
                ? { left: position.left, bottom: position.bottom, maxHeight: position.maxHeight }
                : { left: position.left, top: position.top, maxHeight: position.maxHeight },
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              if (showAll) setShowAll(false);
              else close();
              return;
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            // The slider owns its arrow keys; do not steal focus while it is being adjusted.
            if (event.target instanceof Element && event.target.closest('.es-track') !== null) return;
            const items = Array.from(event.currentTarget.querySelectorAll('.es-provider, .es-modelRow, .es-track, .es-retry')).filter((item) => !item.disabled);
            if (items.length === 0) return;
            event.preventDefault();
            const at = items.indexOf(document.activeElement);
            const down = event.key === 'ArrowDown';
            const next = at < 0 ? (down ? 0 : items.length - 1) : (at + (down ? 1 : -1) + items.length) % items.length;
            items[next].focus();
          },
        },
        rootPane,
      );

      // Hidden until measured, so the first frame never shows it at the wrong place.
      const flyout = h(
        'div',
        {
          ref: flyoutRef,
          className: 'es-flyout',
          role: 'menu',
          'aria-label': t('menu.allModels'),
          style: flyoutPos === null ? { left: 0, top: 0, visibility: 'hidden' } : { left: flyoutPos.left, top: flyoutPos.top },
          onMouseEnter: cancelFlyoutClose,
          onMouseLeave: scheduleFlyoutClose,
          onKeyDown: (event) => {
            if (event.key === 'Escape' || event.key === 'ArrowLeft') {
              event.preventDefault();
              event.stopPropagation();
              setShowAll(false);
              if (providerRef.current !== null) providerRef.current.focus({ preventScroll: true });
              return;
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            const rows = Array.from(event.currentTarget.querySelectorAll('.es-modelRow, .es-manageRow')).filter((row) => !row.disabled);
            if (rows.length === 0) return;
            event.preventDefault();
            const at = rows.indexOf(document.activeElement);
            const down = event.key === 'ArrowDown';
            const next = at < 0 ? (down ? 0 : rows.length - 1) : (at + (down ? 1 : -1) + rows.length) % rows.length;
            rows[next].focus();
          },
        },
        h('div', { className: 'es-flyoutList' }, allGroups),
        h('div', { className: 'es-footerDivider' }),
        h(
          'div',
          { className: 'es-footer' },
          h(
            'button',
            {
              type: 'button',
              className: 'es-manageRow',
              onClick: () => {
                close(false);
                if (typeof manageModels === 'function') manageModels();
              },
            },
            h('span', { className: 'es-manageLabel' }, t('menu.manageModels')),
          ),
        ),
      );

      return h(
        'div',
        {
          ref: rootRef,
          className: 'es-root',
          onKeyDown: (event) => {
            if (!open) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              if (showAll) setShowAll(false);
              else close();
              return;
            }
            if (event.target !== triggerRef.current) return;
            if (event.key !== 'ArrowDown' && !(event.key === 'Tab' && !event.shiftKey)) return;
            const first = menuRef.current === null ? null : menuRef.current.querySelector('.es-provider, .es-modelRow, .es-track, .es-retry');
            if (first === null) return;
            event.preventDefault();
            first.focus({ preventScroll: true });
          },
        },
        h('style', { 'data-plugin': 'dsh-effort-menu' }, CSS),
        trigger,
        open ? ReactDOM.createPortal(h('div', { className: 'es-root' }, menu, showAll ? flyout : null), document.body) : null,
      );
    }

    /** True when no catalog entry matches the stored selection. */
    function currentChoiceMissing(currentModel, state) {
      return currentModel === null && state.current !== null && state.current !== undefined;
    }

    const inject = ['locale', 'slots', 'modelDirectories', 'sessions', 'shortcuts'];

    /**
     * Mount the replacement seat over the shipped per-session model directory.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      ctx.inject(['locale', 'slots', 'modelDirectories', 'sessions', 'shortcuts'], (scope) => {
        scope.effect(() => scope.locale.register(NS, { zh, en }), 'effort-menu: dictionaries');
        const models = scope.modelDirectories;
        const sessions = scope.sessions;
        scope.slots.inject('conversation.input.model', () =>
          scope.slots.register(
            {
              name: 'conversation.input.model',
              priority: -1,
              locale: NS,
              inject: (sessionId) => {
                const directory = models.directoryFor(sessionId);
                const available = sessions.subagentAddress(sessionId) === undefined;
                return {
                  available,
                  directory: directory.store,
                  load: () => {
                    if (available) directory.load().catch(() => {});
                  },
                  resolveText: (text) => scope.locale.resolveText(text),
                  select: (selection) => (available ? directory.select(selection) : Promise.resolve(undefined)),
                  manageModels: () => openModelsSettings(scope),
                };
              },
            },
            EffortSeat,
          ),
        );
      });
    }

    return { inject, apply };
  },
});

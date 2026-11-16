# Changelog

## 1.3.0

- Works with the agent-teamwork switch that DSH `0.2.2-rc.3` added to the model menu: it is rendered below the thinking slider again, and hidden for subagent sessions as before.
- On DSH `0.2.2-rc.3` and newer the shipped seat entry is reused instead of registering a second one, which the host rejected ("slot already declared") and which left the shipped menu in place.
- The seat is mounted only once the shipped entry is visible, so this plugin can no longer cause the shipped registration to fail by declaring the options slot first. If the host refuses the component swap, a warning is logged and the shipped menu stays.

## 1.2.1

- The model list no longer flickers while a thinking level is saved: the pending selection that already carries the new level no longer dims every model row or turns the trigger into a spinner.
- The chosen level stays on the slider until the directory reports it, so a slow reply or a second click no longer steps the knob back to the previous level.

## 1.2.0

- The all-models flyout is narrower and uses a smaller font, and it has a search box that filters models by name.

## 1.1.0

- The all-models flyout ends with a *Manage models* row, separated by a divider; it opens Settings → Models directly.

## 1.0.1

Documentation only. The published README now states the supported DSH version, the npm install command, and the correct desktop install steps.

## 1.0.0

First public release.

- Recent-models list, with a flyout for every provider's models.
- Draggable reasoning-effort slider, one node per advertised level.
- A leading *Default* node for models that expose levels without their own default.
- Effort carry-over when switching models.
- Inline load and selection errors, with a retry action.
- Keyboard and focus handling, including arrow keys on the slider.
- Light and dark themes, reduced-motion support, and English and Chinese interface text.

# Changelog

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

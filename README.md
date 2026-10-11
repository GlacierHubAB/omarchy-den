# Den Agents

Your Claude Code agents at a glance in the Omarchy bar. Den Agents shows how many
agents are running and, when one is waiting on you, how many need you. Click it
to open [Den](https://github.com/GlacierHubAB/den), which lets you see, approve
and steer all your Claude Code agents from one terminal screen.

![Den Agents](preview.png)

- **󰚩 4** means four agents are running.
- **󰚩 4  󰂚 1**, in your theme's urgent colour, means one of them needs you (a
  permission, a plan to review, a question).
- A dimmed 󰚩 means no agents are running, or Den is missing or failed. Hover
  for the reason.

Hover for the breakdown (needs you, working, idle). Left-click opens Den with
`omarchy-launch-or-focus-tui den`, or focuses it if it's already open.

## Requirements

- Omarchy with the Quickshell-based `omarchy-shell` (Quattro).
- **[Den](https://github.com/GlacierHubAB/den)** on your `PATH`. Den is a
  separate program and this plugin does not install or download it. Install it
  from its [releases](https://github.com/GlacierHubAB/den/releases)
  (static Linux binaries with a `SHA256SUMS` file) or from source; see
  [Den's install section](https://github.com/GlacierHubAB/den#install). Put the
  binary in `~/.local/bin`, which is already on Omarchy's `PATH`.
- For the "needs you" count, run `den install-hooks` once. Without the hooks
  Den can still count the agents, but it can't tell when one is waiting on you.

## Install

```bash
omarchy plugin add https://github.com/GlacierHubAB/omarchy-den --enable
```

That adds 󰚩 to the right side of your bar. Move it with `omarchy bar move`.

## Open Den with a key

The marketplace has no keybinding field, so bind one yourself. In
`~/.config/hypr/bindings.lua`:

```lua
o.bind("SUPER + SHIFT + K", "Den", { tui = "den", focus = true })
```

That runs `omarchy-launch-or-focus-tui den`, the same as clicking the widget.
Pick any key that's free (`omarchy menu keybindings --print` lists the ones in
use).

## Settings

| Setting | What it does |
| --- | --- |
| `refreshIntervalSec` | How often to run `den list -json`, in seconds (default 5, min 2) |

## Update

```bash
omarchy plugin update io.github.glacierhubab.den-agents
```

## Remove

```bash
omarchy plugin remove io.github.glacierhubab.den-agents
```

The plugin keeps no files of its own outside its plugin folder. Removing it
leaves Den alone; to remove Den too, follow
[Den's instructions](https://github.com/GlacierHubAB/den#install)
(`den uninstall-hooks`, `den uninstall-mods`, then delete the binary).

## How it works

Every few seconds the widget runs `den list -json` directly (no shell) and
counts the agents by status. It works with Den v0.2.0, which prints each
status as an integer (`Status`), and uses the string `StatusName`
(`needs_you`, `working`, `idle`, `unknown`, `gone`) instead whenever Den
prints one. Gone agents aren't counted.
If Den is missing, fails or takes longer than 15 seconds, the widget dims and
says why in its tooltip; it never blocks the bar. Without Den it checks only
once a minute.

## Security

- No installer and no install scripts.
- Downloads nothing, and bundles no binaries.
- No sudo, no systemd units, no services.
- Runs exactly two commands, both as fixed argument lists: `den list -json`,
  and `omarchy-launch-or-focus-tui den` when you click.
- Writes no files and changes no configuration.

## Develop

```bash
node test/model.test.js        # parser tests
omarchy plugin validate .
```

To try a local checkout, copy `manifest.json`, `BarWidget.qml` and `Model.js`
into `~/.config/omarchy/plugins/io.github.glacierhubab.den-agents/`, then
`omarchy plugin enable io.github.glacierhubab.den-agents`. The shell reloads
plugin code when files there change.

## License

MIT

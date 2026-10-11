import QtQuick
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as M

// Den Agents: the Claude Code agents Den sees, as a count in the bar. Polls
// `den list -json` and opens Den on click. Den itself is not part of this
// plugin; without it the widget stays dimmed and says so in its tooltip.
BarWidget {
  id: root
  moduleName: "io.github.glacierhubab.den-agents"

  // "loading", "ok", "missing" (den not on PATH) or "error" (den failed).
  property string status: "loading"
  property var counts: ({ total: 0, needsYou: 0, working: 0, idle: 0, unknown: 0 })
  property bool started: false
  property bool timedOut: false
  property string errorText: ""

  readonly property int intervalSec: Math.max(2, Number(root.setting("refreshIntervalSec", 5)) || 5)
  readonly property bool needsYou: status === "ok" && counts.needsYou > 0

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  function refresh() {
    if (listProc.running) return
    started = false
    timedOut = false
    listProc.running = true
    startCheck.restart()
  }

  function openDen() {
    Util.execArgv(["omarchy-launch-or-focus-tui", "den"])
  }

  function finish(exitCode) {
    timeout.stop()
    if (timedOut) return
    if (exitCode !== 0) {
      fail(String(errOut.text || "").trim() || ("den exited with " + exitCode))
      return
    }
    try {
      counts = M.summarize(out.text)
      status = "ok"
      errorText = ""
    } catch (e) {
      fail(String(e.message || e))
    }
  }

  function fail(message) {
    status = "error"
    errorText = message.split("\n")[0].slice(0, 160)
  }

  function label() {
    var glyph = "󰚩"
    if (status !== "ok" || counts.total === 0) return glyph
    return glyph + " " + counts.total + (counts.needsYou ? "  󰂚 " + counts.needsYou : "")
  }

  function tooltip() {
    if (status === "missing") return "Den Agents: den is not installed or not on PATH\ngithub.com/GlacierHubAB/den"
    if (status === "error") return "Den Agents: den list failed\n" + errorText
    if (status === "loading") return "Den Agents"
    return M.tooltip(counts)
  }

  Process {
    id: listProc
    command: ["den", "list", "-json"]
    stdout: StdioCollector { id: out; waitForEnd: true }
    stderr: StdioCollector { id: errOut; waitForEnd: true }
    onStarted: {
      root.started = true
      timeout.restart()
    }
    onExited: function(exitCode) { root.finish(exitCode) }
  }

  // A process that never starts emits neither started nor exited.
  Timer {
    id: startCheck
    interval: 1000
    onTriggered: if (!root.started && !listProc.running) root.status = "missing"
  }

  // Never let a stuck den hold the poll: stop it and report an error.
  Timer {
    id: timeout
    interval: 15000
    onTriggered: {
      if (!listProc.running) return
      root.timedOut = true
      root.fail("den list took longer than 15 s")
      listProc.running = false
    }
  }

  Timer {
    // Without den, check rarely: each failed start logs a shell warning.
    interval: (root.status === "missing" ? 60 : root.intervalSec) * 1000
    running: true
    repeat: true
    triggeredOnStart: true
    onTriggered: root.refresh()
  }

  WidgetButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: root.label()
    tooltipText: root.tooltip()
    active: root.needsYou
    dimmed: root.status !== "ok" || root.counts.total === 0
    onPressed: function(buttonCode) {
      if (buttonCode === Qt.LeftButton) root.openDen()
    }
  }
}

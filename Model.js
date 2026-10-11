.pragma library
// Den Agents model: parses `den list -json`. Pure functions, no QML, so node
// can test it.

// Den's integer status values (internal/fleet/fleet.go), used when the
// output has no StatusName, which older Den versions don't print.
var statusByNumber = ["unknown", "needs_you", "working", "idle", "gone"]

function statusOf(agent) {
  if (agent && typeof agent.StatusName === "string" && agent.StatusName !== "")
    return agent.StatusName
  var n = agent ? agent.Status : undefined
  return typeof n === "number" && statusByNumber[n] ? statusByNumber[n] : "unknown"
}

// summarize turns the stdout of `den list -json` into counts. Den prints
// `null` when no agents run. Throws on anything that isn't a JSON list.
function summarize(raw) {
  var text = String(raw || "").trim()
  if (text === "") throw new Error("den list -json printed nothing")
  var list = JSON.parse(text)
  if (list === null) list = []
  if (!Array.isArray(list)) throw new Error("den list -json did not print a list")
  var counts = { total: 0, needsYou: 0, working: 0, idle: 0, unknown: 0 }
  for (var i = 0; i < list.length; i++) {
    var status = statusOf(list[i])
    if (status === "gone") continue
    counts.total++
    if (status === "needs_you") counts.needsYou++
    else if (status === "working") counts.working++
    else if (status === "idle") counts.idle++
    else counts.unknown++
  }
  return counts
}

function plural(n, one, many) {
  return n + " " + (n === 1 ? one : many)
}

function tooltip(counts) {
  if (!counts.total) return "Den: no Claude Code agents running\nClick to open Den"
  var parts = []
  if (counts.needsYou) parts.push(counts.needsYou + " need" + (counts.needsYou === 1 ? "s" : "") + " you")
  if (counts.working) parts.push(counts.working + " working")
  if (counts.idle) parts.push(counts.idle + " idle")
  if (counts.unknown) parts.push(counts.unknown + " unknown")
  return "Den: " + plural(counts.total, "agent", "agents") + "\n" + parts.join(", ") + "\nClick to open Den"
}

// Lets node load this file for test/model.test.js.
if (typeof module !== "undefined") module.exports = { statusOf: statusOf, summarize: summarize, tooltip: tooltip }

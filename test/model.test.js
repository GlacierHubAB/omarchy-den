// Run: node test/model.test.js
const fs = require("fs"), path = require("path"), assert = require("assert")
const src = fs.readFileSync(path.join(__dirname, "../Model.js"), "utf8").replace(/^\.pragma library.*$/m, "")
const m = { exports: {} }; new Function("module", src)(m); const M = m.exports
let t = 0, ok = (name, fn) => { fn(); t++; console.log("✓", name) }

ok("empty fleet prints null", () => {
  assert.deepEqual(M.summarize("null\n"), { total: 0, needsYou: 0, working: 0, idle: 0, unknown: 0 })
  assert.equal(M.summarize("[]").total, 0)
})
ok("integer Status from older Den", () => {
  const c = M.summarize(JSON.stringify([{ Status: 0 }, { Status: 1 }, { Status: 2 }, { Status: 3 }, { Status: 3 }, { Status: 4 }, { Status: 9 }]))
  assert.deepEqual(c, { total: 6, needsYou: 1, working: 1, idle: 2, unknown: 2 })
})
ok("StatusName wins over the integer", () => {
  assert.equal(M.statusOf({ Status: 3, StatusName: "needs_you" }), "needs_you")
  assert.equal(M.statusOf({ Status: 1, StatusName: "" }), "needs_you")
  assert.equal(M.statusOf({ StatusName: "something_new" }), "something_new")
  assert.equal(M.summarize(JSON.stringify([{ StatusName: "something_new" }])).unknown, 1)
})
ok("gone agents are not counted", () => {
  assert.equal(M.summarize(JSON.stringify([{ Status: 4 }, { StatusName: "gone" }])).total, 0)
})
ok("garbage throws", () => {
  assert.throws(() => M.summarize("den: boom"))
  assert.throws(() => M.summarize("{}"))
  assert.throws(() => M.summarize(""))
})
ok("tooltip", () => {
  assert.equal(M.tooltip(M.summarize("null")), "Den: no Claude Code agents running\nClick to open Den")
  assert.equal(M.tooltip({ total: 3, needsYou: 1, working: 1, idle: 1, unknown: 0 }), "Den: 3 agents\n1 needs you, 1 working, 1 idle\nClick to open Den")
  assert.equal(M.tooltip({ total: 2, needsYou: 2, working: 0, idle: 0, unknown: 0 }), "Den: 2 agents\n2 need you\nClick to open Den")
})
console.log(`${t} passed`)

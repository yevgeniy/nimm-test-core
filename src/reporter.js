const log = [];
function enter(...args) {
  log.push(args);
}

function startTest(name, time) {
  enter("start test", name, time);
}
function endTest(name, time, ttime) {
  enter("end test", time, ttime);
}
function startEvaluation(name, time) {
  enter("start evaluation", name, time);
}
function endEvaluation(name, status, time, ttime) {
  enter("end evaluation", status, time, ttime);
}
function startBeforeEach(name, time) {
  enter("start before each", name, time);
}
function endBeforeEach(name, time, ttime) {
  enter("end before each", name, time, ttime);
}
function startAfterEach(name, time) {
  enter("start after each", name, time);
}
function endAfterEach(name, time, ttime) {
  enter("end after each", name, time, ttime);
}
function startBefore(name, time) {
  enter("start before", name, time, ttime);
}
function endBefore(name, time, ttime) {
  enter("end before", name, time, ttime);
}
function startAfter(name, time) {
  enter("start after", name, time);
}
function endAfter(name, time, ttime) {
  enter("end after", name, time, ttime);
}
function startDomain(name, time) {
  enter("start domain", name, time);
}
function endDomain(name, time, ttime) {
  enter("end domain", name, time, ttime);
}

module.exports = {
  __esModule: true,
  startTest,
  endTest,
  startEvaluation,
  endEvaluation,
  startBefore,
  endBefore,
  startAfter,
  endAfter,
  startBeforeEach,
  endBeforeEach,
  startAfterEach,
  endAfterEach,
  startDomain,
  endDomain
};

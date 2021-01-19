const options = require("./options");
const fs = require("fs");
const Mocha = require("mocha");

const src = options.getSrc();
let numberOfTries = options.getNumberOfTries();
const match = options.getMatch();
const showresult = options.getShowResult() || false;

if (!src) throw new Error("need --src");

if (!fs.existsSync(src)) throw new Error("src does not exist");

if (numberOfTries === null) numberOfTries = 2;
if (Number.isNaN(numberOfTries)) throw new Error("--tries should be a number");

let runner;
function run(ignore, discovered) {
  const passedTests = [];
  let failedTest;
  let out = {};
  return new Promise((res, rej) => {
    runner && runner.dispose();

    let adjustedMatch;
    if (discovered) {
      let consideredTests = discovered.filter(v => ignore.indexOf(v) == -1);

      if (match)
        consideredTests = consideredTests.filter(v => !!v.match(match));

      if (!consideredTests.length) {
        /*got all tests*/
        res({ passedTests });
        return;
      }
      adjustedMatch = new RegExp(consideredTests.map(v => `^${v}`).join("|"));
    }

    runner = new Mocha({
      bail: true,
      grep: adjustedMatch || match,
      parallel: false,
      timeout: 500000
      //allowUncaught: true
    });
    runner.addFile(src);

    try {
      runner
        .run()
        .on("pass", r => {
          const n = getFullTestName(r);
          passedTests.push(n);
        })
        .on("fail", r => {
          failedTest = getFullTestName(r);
          out = {
            failed: true,
            failedTest,
            passedTests,
            discoveredTests: discoverAllTests(runner)
          };
        })
        .on("end", r => {
          res({
            ...out,
            passedTests
          });
        });
    } catch (e) {
      throw e;
    }
  });
}

async function runEvaluator() {
  let overflow = 0;
  let res;
  let passedTests = [];
  let failedTests = [];
  let faultTests = [];
  let discoveredTests;
  let failedTest;
  let x = 0;

  do {
    overflow++;
    if (overflow > 100) break;

    res = await run([...passedTests, ...failedTests], discoveredTests).catch(
      e => {
        throw e;
      }
    );
    await new Promise(res => setTimeout(res, 1000));

    discoveredTests = res.discoveredTests;
    passedTests = Array.from(new Set([...passedTests, ...res.passedTests]));

    if (res.failed) {
      if (res.failedTest !== failedTest) x = 0;

      failedTest = res.failedTest;
      faultTests = Array.from(new Set([...faultTests, failedTest]));

      x++;
      if (x >= numberOfTries) {
        failedTests.push(failedTest);
        faultTests = faultTests.filter(x => x !== failedTest);
      }
    }
  } while (res.failed);

  return {
    passedTests,
    failedTests,
    faultTests,
    failed: failedTests.length
  };
}

function getFullTestName(r) {
  const testName = r.title;
  let pars = [];
  let parSite = r.parent;
  do {
    pars.push(parSite.title);
  } while ((parSite = parSite.parent));
  pars.reverse();
  pars = pars.filter(v => !!v);

  return `${pars.join(" ")} ${testName}`;
}

function discoverAllTests(runner) {
  const tests = [];

  function parse(curSuite, parSuites = []) {
    const suiteTitle = curSuite.title;
    for (let test of curSuite.tests) {
      const testTitle = test.title;
      tests.push(`${parSuites.join(" ")} ${suiteTitle} ${testTitle}`.trim());
    }

    for (let suite of curSuite.suites) {
      parse(suite, [...parSuites, suiteTitle]);
    }
  }
  parse(runner.suite);

  return tests;
}

function report(results) {
  if (showresult) console.log(results);
  if (results.failed) {
    process.exit(1);
  } else process.exit(0);
}

runEvaluator()
  .then(results => {
    report(results);
  })
  .catch(e => {
    throw e;
  });

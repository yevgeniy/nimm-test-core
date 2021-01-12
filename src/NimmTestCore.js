class NimmTestCore {
  constructor() {
    this.reporters = [];
    this.log = [];
  }

  async evaluate(def, ignoretests = []) {
    const evaluator = new EvaluateInstance(
      this.evaluator,
      this.match,
      ignoretests,
      this.reporters
    );
    let error;
    await evaluator.evaluate(def).catch(e => {
      error = true;
    });

    error && (evaluator.failed = true);

    return evaluator;
  }

  async runEvaluator(def) {
    let x = 0;
    let res;
    let passedTests = [];
    let failedTests = [];
    let faultTests = [];
    let failedTest = null;
    let overflow = 0;
    do {
      overflow++;
      if (overflow > 100) break;

      res = await this.evaluate(def, [...passedTests, ...failedTests]).catch(
        e => {
          throw e;
        }
      );
      passedTests = Array.from(new Set([...passedTests, ...res.passedTests]));

      if (res.failed) {
        if (res.currentTestPhase !== failedTest) x = 0;

        failedTest = res.currentTestPhase;
        faultTests = Array.from(new Set([...faultTests, failedTest]));

        x++;
        if (x >= this.numberOfTries) {
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
  /*
    src,
    numberOfTries,
    discoverer,
    reporters,
    evaluator,
    match
  */
  run(profile) {
    const discoverer = profile.discoverer;
    this.evaluator = profile.evaluator;
    this.reporters.push(...(profile.reporters || []));
    this.match = profile.match || /./;
    this.numberOfTries = profile.numberOfTries;

    if (!profile.discoverer) throw new Error("discoverer should be a function");
    if (!profile.src) throw new Error("need src");
    if (!this.evaluator) throw new Error("need evaluator");

    const def = discoverer(profile.src);
    /*
      {
        'describeDomain': {
          '@before': [fn...],
          '@after': [fn...],
          '@beforeEach': [fn...],
          '@afterEach': [fn...],
          'testname':[fn, [args]],
          'testname2':[fn, [args]],
          'describeDomain2: {
            ...
          },
        } 
      }
    */

    return new Promise(async res => {
      const r = await this.runEvaluator(def).catch(e => {
        throw e;
      });
      res(r);
    });
  }
}

class EvaluateInstance {
  constructor(evaluator, match, ignoretests, reporters) {
    this.log = [];
    this.evaluator = evaluator;
    this.match = match;
    this.failed = null;
    this.ignoreTests = ignoretests || [];
    this.passedTests = [];
    this.currentTestPhase = null;
    this.reporters = reporters || [];
  }
  async evaluate(
    def,
    prefix = [],
    beforeeach = [],
    aftereach = [],
    runwholedomain = false
  ) {
    let x;
    runwholedomain =
      runwholedomain || (prefix.slice(-1)[0] || "").match(this.match);

    const evalueDescribe = async (key, val) => {
      await this.evaluate(
        val,
        [...prefix, key],
        [...beforeeach, ...(def["@beforeEach"] || [])],
        [...(def["@afterEach"] || []), ...aftereach],
        runwholedomain
      ).catch(e => {
        throw e;
      });
    };
    const evaluateIt = async (key, val) => {
      const [fn, args] = val;
      const fullTestName = prefix.join("|") + `@${key}`;
      this.log.push(fullTestName);
      this.currentTestPhase = fullTestName;

      for (const beforeEachFn of [...beforeeach, ...(def["@beforeEach"] || [])])
        await beforeEachFn();

      this.currentTestPhase = fullTestName;
      await this.evaluator.runTest(fn, args).out((didPass, opts, time) => {
        this.log.push(`${fullTestName} -- ${didPass}`);

        if (!didPass) {
          this.failed = true;
          this.phase = fullTestName;
          throw new Error("NIMM FAILED TEST ERROR");
        }
      });
      this.passedTests.push(fullTestName);
      this.currentTestPhase = null;

      for (const afterEachFn of [...(def["@afterEach"] || []), ...aftereach])
        await afterEachFn();
    };
    const lookAhead = (def, prefix) => {
      for (let key in def) {
        let fullTestName = prefix.join("|") + `@${key}`;

        if (key[0] === "@") continue;
        if (
          key.match(this.match) &&
          this.ignoreTests.indexOf(prefix.join("|") + `@${key}`) === -1
        )
          return fullTestName;
        if (def[key].constructor === Object) {
          const res = lookAhead(def[key], [...prefix, key]);
          if (res) return res;
        }
      }
      return null;
    };

    let beforeRan;
    if ((this.currentTestPhase = lookAhead(def, [...prefix]))) {
      beforeRan = true;
      for (let beforeFn of def["@before"] || []) await beforeFn();
    }

    for (let key in def) {
      let val = def[key];

      if (val.constructor === Object) {
        await evalueDescribe(key, val).catch(e => {
          throw e;
        });
        if (this.failed) return;
      } else if (key[0] === "@") continue;
      else {
        if (runwholedomain || key.match(this.match))
          if (this.ignoreTests.indexOf(prefix.join("|") + `@${key}`) === -1)
            await evaluateIt(key, val).catch(e => {
              throw e;
            });
        if (this.failed) return;
      }
    }

    x = 0;
    if (beforeRan)
      for (let afterFn of def["@after"] || []) {
        this.currentTestPhase = prefix.join("|") + `@@after#${x++}`;
        await afterFn();
      }
  }
}

module.exports = {
  default: NimmTestCore,
  __esModule: true
};

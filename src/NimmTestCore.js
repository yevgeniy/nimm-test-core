class NimmTestCore {
  constructor() {
    this.reporters = [];
    this.log = [];
  }

  async evaluate(
    def,
    prefix = [],
    beforeeach = [],
    aftereach = [],
    runwholedomain = false
  ) {
    runwholedomain =
      runwholedomain || (prefix.slice(-1)[0] || "").match(this.match);

    const evalueDescribe = async (key, val) => {
      await this.evaluate(
        val,
        [...prefix, key],
        [...beforeeach, ...(def["@beforeEach"] || [])],
        [...(def["@afterEach"] || []), ...aftereach],
        runwholedomain
      );
    };
    const evaluateIt = async (key, val) => {
      const [fn, args] = val;
      this.log.push(prefix.join("|") + `@${key}`);

      for (const beforeEachFn of [...beforeeach, ...(def["@beforeEach"] || [])])
        await beforeEachFn();

      await this.evaluator.runTest(fn, args).out((didPass, opts, time) => {
        this.log.push(prefix.join("|") + `@${key} -- ${didPass}`);
      });

      for (const afterEachFn of [...(def["@afterEach"] || []), ...aftereach])
        await afterEachFn();
    };
    const lookAhead = def => {
      for (let key in def) {
        if (key[0] === "@") continue;
        if (key.match(this.match)) return true;
        if (def[key].constructor === Object) {
          if (lookAhead(def[key])) return true;
        }
      }
      return false;
    };

    if (lookAhead(def))
      for (let beforeFn of def["@before"] || []) await beforeFn();

    for (let key in def) {
      let val = def[key];

      if (val.constructor === Object) await evalueDescribe(key, val);
      else if (key[0] === "@") continue;
      else {
        if (runwholedomain || key.match(this.match)) await evaluateIt(key, val);
      }
    }

    if (lookAhead(def))
      for (let afterFn of def["@after"] || []) await afterFn();
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
    this.evaluate(def);
  }
}

module.exports = {
  default: NimmTestCore,
  __esModule: true
};

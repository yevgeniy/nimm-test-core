const DURATION = 10000;
const FREQUENCY = 1000;

const runTruthEvaluator = (fn, opts = {}) => {
  if (isNaN(opts.duration)) opts.duration = DURATION;
  if (isNaN(opts.frequency)) opts.frequency = FREQUENCY;

  const ti = +new Date();

  return new Promise((res, rej) => {
    const runAgain = () => {
      let r;
      try {
        r = fn();
      } catch (e) {
        evaluateError(e);
      }
      if (r && r.then)
        r.then(evaluateResult).catch(e => {
          evaluateError(e);
        });
      else evaluateResult(r);
    };
    const evaluateError = e => {
      if (+new Date() - ti > opts.duration) rej(e);
      else setTimeout(runAgain, opts.frequency);
    };

    const evaluateResult = r => {
      if (!!r) res(r);
      else {
        if (+new Date() - ti > opts.duration)
          rej(new Error("NIMM FAILED TEST ERROR"));
        else setTimeout(runAgain, opts.frequency);
      }
    };

    runAgain();
  });
};

const doWaitFor = (dofn, waitfn, opts = {}) => {
  if (isNaN(opts.duration)) opts.duration = DURATION;
  if (isNaN(opts.frequency)) opts.frequency = FREQUENCY;
  if (isNaN(opts.tries)) opts.tries = 3;

  const ti = +new Date();

  return new Promise(async (res, rej) => {
    for (let x = 0; x < opts.tries; x++) {
      await wait(dofn, opts).catch(rej);
      const r = await runTruthEvaluator(waitfn, opts).catch(rej);
      if (!!r) res(r);
    }
    res();
  });
};

const wait = (fn, opts = {}) => {
  if (isNaN(opts.duration)) opts.duration = DURATION;
  if (isNaN(opts.frequency)) opts.frequency = FREQUENCY;

  const ti = +new Date();

  return new Promise((res, rej) => {
    const runAgain = () => {
      let r;
      try {
        r = fn();
      } catch (e) {
        evaluateError(e);
      }
      if (r && r.then)
        r.then(evaluateResult).catch(e => {
          evaluateError(e);
        });
      else evaluateResult(r);
    };
    const evaluateError = e => {
      if (+new Date() - ti > opts.duration) rej(e);
      else setTimeout(runAgain, opts.frequency);
    };

    const evaluateResult = r => {
      /*as long as it did not error, it's a valid result*/
      res();
    };

    runAgain();
  });
};

const runTest = (testFn, args) => {
  const evaluators = [];
  const expectFn = (truthEvaluatorFn, truthEvaluatorOpts) => {
    const prom = runTruthEvaluator(truthEvaluatorFn, truthEvaluatorOpts).catch(
      e => {
        throw e;
      }
    );

    evaluators.push(prom);
    return prom;
  };

  return new Promise((res, rej) => {
    let r = testFn(expectFn);
    args && (r = r(args));

    if (!r || !r.then) r = Promise.resolve(r);

    r.catch(rej).then(() => {
      if (evaluators.length)
        Promise.all(evaluators)
          .catch(rej)
          .then(res);
      else res();
    });
  });
};

module.exports = {
  __esModule: true,
  runTest,
  wait,
  waitFor: runTruthEvaluator,
  doWaitFor
};

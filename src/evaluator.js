const assert = require("assert");

const DURATION = 10000;
const FREQUENCY = 1000;

const waitFor = (fn, opts = {}) => {
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
        if (+new Date() - ti > opts.duration) res(r);
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
      const r = await waitFor(waitfn, opts).catch(rej);
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
const expect = async (fn, opts = {}) => {
  const r = await waitFor(fn, opts).catch(e => {
    throw e;
  });

  assert.equal(!!r, true);
};

module.exports = {
  __esModule: true,
  wait,
  waitFor,
  doWaitFor,
  expect
};

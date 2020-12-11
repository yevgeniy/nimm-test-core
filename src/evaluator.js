const expect = async (fn, opts) => {
  return await fn();
};

const runTest = (fn, args) => {
  const out = async f => {
    let r = fn(async (truthEvaluatorFn, truthEvaluatorOpts) => {
      const ti = +new Date();
      const res = await expect(truthEvaluatorFn, truthEvaluatorOpts);
      f(res, truthEvaluatorOpts, +new Date() - ti);
    });

    r = r && r.then ? await r : r;

    r = args ? r(args) : r;

    r = r && r.then ? await r : r;
  };

  return {
    out
  };
};

module.exports = {
  __esModule: true,
  runTest
};

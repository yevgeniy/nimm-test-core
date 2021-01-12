const runTest = (fn, args) => {
  const out = async f => {
    let r;
    try {
      r = fn((truthEvaluatorFn, truthEvaluatorOpts) => {
        const ti = +new Date();
        let r;
        try {
          r = truthEvaluatorFn();
        } catch (e) {
          throw e;
        }

        if (r && r.then) {
          return r
            .then(res => {
              f(res, truthEvaluatorOpts, +new Date() - ti);
            })
            .catch(e => {
              throw e;
            });
        } else {
          f(r, truthEvaluatorOpts, +new Date() - ti);
        }
      });
    } catch (e) {
      throw e;
    }

    if (r && r.then) {
      r = await r.catch(e => {
        throw e;
      });
    }

    if (args) {
      try {
        r = r(args);
      } catch (e) {
        throw e;
      }
      if (r && r.then) {
        r = await r.catch(e => {
          throw e;
        });
      }
    }
  };

  return {
    out
  };
};

module.exports = {
  __esModule: true,
  runTest
};

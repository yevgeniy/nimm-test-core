const PATH = require("path");

module.exports = {
  getSrc: () => {
    const part = process.argv.find(v => v.trim().match(/^--src/));
    if (!part) return null;

    const [, src] = part.split("=");
    return PATH.resolve(src.trim());
  },
  getNumberOfTries: () => {
    const part = process.argv.find(v => v.trim().match(/^--tries/));
    if (!part) return null;

    const [, tries] = part.split("=");
    return +tries;
  },
  getDiscoverer: () => {
    const part = process.argv.find(v => v.trim().match(/^--discoverer/));
    if (!part) return null;

    const [, src] = part.split("=");
    const path = PATH.resolve(src.trim());
    return require(path);
  },
  getEvaluator: () => {
    const part = process.argv.find(v => v.trim().match(/^--evaluator/));
    if (!part) return null;

    const [, src] = part.split("=");
    const path = PATH.resolve(src.trim());
    return require(path);
  },
  getMatch: () => {
    const part = process.argv.find(v => v.trim().match(/^--match/));
    if (!part) return null;

    const [, src] = part.split("=");
    return src ? new RegExp(src) : null;
  },
  getReporters: () => {
    const parts = process.argv.filter(v => v.trim().match(/^--reporter/));
    if (!parts.length) return null;

    return parts
      .map(part => {
        const [, src] = part.split("=");
        return src ? require(src) : null;
      })
      .filter(v => v);
  },
  getShowResult: () => {
    const part = process.argv.find(v => v.trim().match(/^--showresult/i));
    return !!part;
  }
};

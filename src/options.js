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
  getMatch: () => {
    const part = process.argv.find(v => v.trim().match(/^--match/));
    if (!part) return null;

    const [, src] = part.split("=");
    return src ? new RegExp(src) : null;
  },
  getShowResult: () => {
    const part = process.argv.find(v => v.trim().match(/^--showresult/i));
    return !!part;
  }
};

const PATH = require("path");
const FS = require("fs");

let current = {};
describestack = [current];

const discoverer = src => {
  src = PATH.resolve(src);

  if (FS.statSync(src).isDirectory())
    throw new Error("for discoverer src should be a file");

  require(src);

  return report();
};

const describe = (name, fn) => {
  if (!current) {
    current = {};
  } else {
    describestack.push(current);
    current[name] = {};
    current = current[name];
  }

  fn();

  if (describestack.length) current = describestack.pop();
};
const before = fn => {
  current["@before"] = current["@before"] || (current["@before"] = []);
  current["@before"].push(fn);
};
const after = fn => {
  current["@after"] = current["@after"] || (current["@after"] = []);
  current["@after"].push(fn);
};
const beforeEach = fn => {
  current["@beforeEach"] =
    current["@beforeEach"] || (current["@beforeEach"] = []);
  current["@beforeEach"].push(fn);
};
const afterEach = fn => {
  current["@afterEach"] = current["@afterEach"] || (current["@afterEach"] = []);
  current["@afterEach"].push(fn);
};

const it = (name, ...args) => {
  current[name] = args;
};
const each = (...args) => {
  const canon = args.shift();

  const vars = canon[0].split("|").map(v => v.trim());

  const itirations = [];
  while (args.length) {
    const set = vars.reduce((p, c) => {
      const val = args.shift();

      return { ...p, [c]: val };
    }, {});
    itirations.push(set);
  }

  return function(name, fn) {
    itirations.forEach((v, i) => {
      it(`${i}: ${name}`, fn, v);
    });
  };
};

const report = () => {
  return current;
};

module.exports = {
  default: discoverer,
  describe,
  reset: () => {
    current = {};
    describestack = [current];
  },
  before,
  after,
  beforeEach,
  afterEach,
  it,
  each,
  report,
  __esModule: true
};

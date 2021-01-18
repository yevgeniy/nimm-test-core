const options = require("./options");
const NimmTestCore = require("./NimmTestCore").default;
const fs = require("fs");

const src = options.getSrc();
let numberOfTries = options.getNumberOfTries();
const discoverer = options.getDiscoverer() || require("./discoverer").default;
const evaluator = options.getEvaluator() || require("./evaluator");
const match = options.getMatch();
const reporters = options.getReporters() || [];
const showresult = options.getShowResult() || false;

if (!reporters.length) reporters.push(require("./reporter"));

if (!src) throw new Error("need --src");

if (!fs.existsSync(src)) throw new Error("src does not exist");

if (numberOfTries === null) numberOfTries = 2;
if (Number.isNaN(numberOfTries)) throw new Error("--tries should be a number");

const core = new NimmTestCore();

const profile = {
  src,
  numberOfTries,
  discoverer,
  evaluator,
  match
};
core
  .run(profile)
  .then(res => {
    showresult && console.log(res);
    if (res && res.failed > 0) process.exit(1);
    else process.exit(0);
  })
  .catch(e => {
    throw e;
  });

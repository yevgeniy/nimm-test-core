const options = require("./options");
const NimmTestCore = require("./NimmTestCore");
const fs = require("fs");

const src = options.getSrc();
const numberOfTries = options.getNumberOfTries();
const discoverer = options.getDiscoverer() || require("./discoverer");
const evaluator = options.getEvaluator() || require("./evaluator");
const match = options.getMatch();

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
core.run(profile);

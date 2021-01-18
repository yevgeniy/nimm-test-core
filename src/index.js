const DiscoverDefault = require("./discoverer");
const { wait, waitFor, doWaitFor } = require("./evaluator");

module.exports = {
  describe: DiscoverDefault.describe,
  before: DiscoverDefault.before,
  after: DiscoverDefault.after,
  beforeEach: DiscoverDefault.beforeEach,
  afterEach: DiscoverDefault.afterEach,
  it: DiscoverDefault.it,
  each: DiscoverDefault.each,
  wait,
  waitFor,
  doWaitFor,

  __esModule: true
};

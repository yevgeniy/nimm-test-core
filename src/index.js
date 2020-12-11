const DiscoverDefault = require("./discoverer");
const { expect } = require("./evaluator");

module.exports = {
  describe: DiscoverDefault.describe,
  before: DiscoverDefault.before,
  after: DiscoverDefault.after,
  beforeEach: DiscoverDefault.beforeEach,
  afterEach: DiscoverDefault.afterEach,
  it: DiscoverDefault.it,
  each: DiscoverDefault.each,
  expect,
  __esModule: true
};

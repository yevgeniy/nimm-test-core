const { describe, before, after } = require("../../src");

describe("users", () => {
  before(() => {
    /*goto users*/
  });
  after(() => {
    /*go back from users*/
  });

  require("./add");
  require("./list");
  require("./remove");
});

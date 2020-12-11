const { describe, before, after } = require("../src");

describe("base", () => {
  before(() => {
    /*start browser*/
  });
  after(() => {
    /*shutdown browser*/
  });

  require("./signin");
  require("./signup");
  require("./users");
});

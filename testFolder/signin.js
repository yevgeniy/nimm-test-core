const { describe, it } = require("../src");

describe("sign in", () => {
  it("sign in works", e => {
    e(() => true, { name: "foo" });
  });
});

var assert = require("assert");

describe("boo", () => {
  it("fail", () => {
    assert.equal(true, false);
  });
  it("pass", () => {
    assert.equal(true, true);
  });
  describe("foo", () => {
    it("fail in foo", () => {
      assert.equal(true, false);
    });
    it("works", () => {
      assert.equal(true, true);
    });
  });

  it("works", () => {
    assert.equal(true, true);
  });
});

const { describe, each, expect } = require("../src");

describe("sign up", () => {
  each`
    a|b
    ${1} | ${2}
  `("sign up works", e => args => {
    e(() => true, { name: "foo" });
  });
});

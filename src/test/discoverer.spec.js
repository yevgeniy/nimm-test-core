const discoverer = require("../discoverer").default;
const D = require("../discoverer");

describe("discoverer", () => {
  it("src is not directory", () => {
    try {
      discoverer("./testFolder");
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("for discoverer src should be a file");
    }
  });

  it("FOO", () => {
    D.reset();
    discoverer("./testFolder/index.js");
    expect(true).toBe(true);
  });

  it("report structure", () => {
    D.reset();

    const f1 = 1;
    D.describe("describe1", () => {
      D.before(f1);
      D.before(f1);
      D.after(f1);
      D.it("test1", f1);
      D.beforeEach(f1);
      D.afterEach(f1);
      D.afterEach(f1);
      D.describe("describe2", () => {
        D.beforeEach(f1);
        D.afterEach(f1);
        D.it("test2", f1);
        D.each`
          a | b | c
          ${1} | ${2} | ${3}
          ${"aa"} | ${"bb"} | ${"cc"}
        `("test3", f1);

        D.describe("describe3", () => {
          D.it("test3", f1);
        });
      });
    });
    const res = D.report();

    expect(res).toMatchObject({
      describe1: {
        "@before": [f1, f1],
        "@after": [f1],
        test1: [f1],
        "@beforeEach": [f1],
        "@afterEach": [f1, f1],
        describe2: {
          "@beforeEach": [f1],
          "@afterEach": [f1],
          test2: [f1],
          "0: test3": [f1, { a: 1, b: 2, c: 3 }],
          "1: test3": [f1, { a: "aa", b: "bb", c: "cc" }],
          describe3: {
            test3: [f1]
          }
        }
      }
    });
  });
});

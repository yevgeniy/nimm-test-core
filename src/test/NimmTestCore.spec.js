const NimmTestCore = require("../NimmTestCore").default;
const discoverer = require("../discoverer").default;
const D = require("../discoverer");
const E = require("../evaluator");

const evaluator = require("../evaluator");

describe("NimmTestCore", () => {
  it("need discoverer", () => {
    const core = new NimmTestCore();
    try {
      core.run({});
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("discoverer should be a function");
    }
  });
  it("need src", () => {
    const core = new NimmTestCore();
    try {
      core.run({
        discoverer: "asdf"
      });
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("need src");
    }
  });
  it("need src", () => {
    const core = new NimmTestCore();
    try {
      core.run({
        discoverer: "asdf",
        src: "./testFolder/index.js"
      });
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("need evaluator");
    }
  });
  it("foo", () => {
    const core = new NimmTestCore();
    core.run({
      discoverer,
      src: "./testFolder/index.js",
      evaluator
    });
  });

  describe("evaluate", () => {
    describe("order of execution", () => {
      let core;
      beforeEach(() => {
        core = new NimmTestCore();
        core.evaluator = E;
      });
      it("test in describe", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.it("test1", async e => {
            await new Promise(res => setTimeout(res));
            fn("test1");
          });
          D.describe("d2", () => {
            D.it("test2", async e => {
              fn("test2");
            });
          });
          D.it("test3", async e => {
            fn("test3");
          });
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([["test1"], ["test2"], ["test3"]]);
      });

      it("test in describe with arguments", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.it("test1", e => fn("test1"));
          D.describe("d2", () => {
            D.each`
              a | b
              ${1} | ${2}
              ${3} | ${4}
            `("test2", e => async args => {
              await new Promise(res => setTimeout(res));
              fn("test2", args);
            });
          });
          D.it("test3", e => fn("test3"));
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["test1"],
          ["test2", { a: 1, b: 2 }],
          ["test2", { a: 3, b: 4 }],
          ["test3"]
        ]);
      });

      it("beforeEach in a test", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.beforeEach(async () => {
            await new Promise(res => setTimeout(res));
            fn("before1");
          });
          D.beforeEach(() => fn("before2"));
          D.it("test1", e => fn("test1"));
          D.describe("d2", () => {
            D.beforeEach(() => fn("before3"));
            D.it("test2", e => fn("test2"));
          });
          D.it("test3", e => fn("test3"));
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["before1"],
          ["before2"],
          ["test1"],
          ["before1"],
          ["before2"],
          ["before3"],
          ["test2"],
          ["before1"],
          ["before2"],
          ["test3"]
        ]);
      });

      it("afterEach in a test", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.beforeEach(() => fn("before1"));
          D.afterEach(async () => {
            await new Promise(res => setTimeout(res));
            fn("after1");
          });
          D.afterEach(() => fn("after2"));
          D.it("test1", e => fn("test1"));
          D.describe("d2", () => {
            D.it("test2", e => fn("test2"));
            D.afterEach(() => fn("after3"));
          });
          D.it("test3", e => fn("test3"));
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["before1"],
          ["test1"],
          ["after1"],
          ["after2"],
          ["before1"],
          ["test2"],
          ["after3"],
          ["after1"],
          ["after2"],
          ["before1"],
          ["test3"],
          ["after1"],
          ["after2"]
        ]);
      });

      it("before in a test", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.it("test1", e => fn("test1"));
          D.describe("d2", () => {
            D.it("test2", e => fn("test2"));
            D.afterEach(() => fn("afterEach2"));
            D.before(() => fn("before2"));
          });
          D.it("test3", e => fn("test3"));
          D.beforeEach(() => fn("beforeEach1"));
          D.before(async () => {
            await new Promise(res => setTimeout(res));
            fn("before1");
          });
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["before1"],
          ["beforeEach1"],
          ["test1"],
          ["before2"],
          ["beforeEach1"],
          ["test2"],
          ["afterEach2"],
          ["beforeEach1"],
          ["test3"]
        ]);
      });
      it("after in a test", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.after(async () => {
            await new Promise(res => setTimeout(res));
            fn("after1");
          });
          D.it("test1", e => fn("test1"));
          D.describe("d2", () => {
            D.after(() => fn("after2"));
            D.it("test2", e => fn("test2"));
            D.afterEach(() => fn("afterEach2"));
            D.before(() => fn("before2"));
          });
          D.it("test3", e => fn("test3"));
          D.beforeEach(() => fn("beforeEach1"));
          D.before(() => fn("before1"));
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["before1"],
          ["beforeEach1"],
          ["test1"],
          ["before2"],
          ["beforeEach1"],
          ["test2"],
          ["afterEach2"],
          ["after2"],
          ["beforeEach1"],
          ["test3"],
          ["after1"]
        ]);
      });
    });

    describe("match", () => {
      let core;
      beforeEach(() => {
        core = new NimmTestCore();
        core.evaluator = E;
        core.match = /foo$/;
      });

      it("execute the entire domain", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.it("test1", e => fn("test1"));
          D.describe("foo", () => {
            D.it("test2", e => fn("test2"));
            D.describe("foobovich", () => {
              D.it("test3", e => fn("test3"));
            });
          });
          D.describe("foo_", () => {
            D.it("test4", e => fn("test4"));
          });
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([["test2"], ["test3"]]);
      });
      it("execute matched tests", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.it("test1", e => fn("test1"));
          D.it("test2_foo", e => fn("test2"));
          D.describe("d2", () => {
            D.it("test3_foo", e => fn("test3"));
            D.describe("foobovich", () => {
              D.it("test4", e => fn("test4"));
            });
          });
          D.describe("d3", () => {
            D.it("test5", e => fn("test5"));
          });
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([["test2"], ["test3"]]);
      });

      it("execute only matched test and before matchers", async () => {
        const fn = jest.fn();
        D.describe("d1", () => {
          D.after(() => fn("after1"));
          D.beforeEach(() => fn("beforeEach1"));
          D.afterEach(() => fn("afterEach1"));

          D.describe("d2", () => {
            D.before(() => fn("before2"));
            D.after(() => fn("after2"));
            D.beforeEach(() => fn("beforeEach2"));
            D.describe("d3", () => {
              D.before(() => fn("before3"));
              D.it("test6", e => fn("test6"));
              D.describe("d4", () => {
                D.it("test6_foo", e => fn("test6_foo"));
              });
            });
          });
          D.describe("d2a", () => {
            D.before(() => fn("before2a"));
            D.describe("d3", () => {
              D.it("test6a", e => fn("6a"));
              D.describe("d4_foo", () => {
                D.it("test7", e => fn("test7"));
              });
            });
          });
          D.describe("d2b", () => {
            D.before(() => fn("before2b"));
            D.it("test6b", e => fn("6b"));
          });
        });

        await core.evaluate(D.report());

        expect(fn.mock.calls).toEqual([
          ["before2"],
          ["before3"],
          ["beforeEach1"],
          ["beforeEach2"],
          ["test6_foo"],
          ["afterEach1"],
          ["after2"],
          ["before2a"],
          ["beforeEach1"],
          ["test7"],
          ["afterEach1"],
          ["after1"]
        ]);
      });
    });
  });
});

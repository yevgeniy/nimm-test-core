const { spawn } = require("child_process");
const NimmTestCore = require("../NimmTestCore");

describe("options", () => {
  it("cli needs src", async () => {
    const ls = spawn("yarn", ["start"]);
    const outs = [];
    // ls.stdout.on("data", data => {
    //   console.log(`stdout: ${data}`);
    //   expect(true).toBe(true);
    // });

    ls.stderr.on("data", data => {
      outs.push(data);
    });

    // ls.on("close", code => {
    //   console.log(`child process exited with code ${code}`);
    //   expect(true).toBe(true);
    // });

    await new Promise(res => setTimeout(res, 1000));
    expect(outs.some(data => !!data.toString().match(/need --src/))).toBe(true);
  });
  it("cli src is valid", async () => {
    const ls = spawn("yarn", ["start", "--src=./foo"]);
    const outs = [];

    ls.stderr.on("data", data => {
      outs.push(data);
    });

    await new Promise(res => setTimeout(res, 1000));
    expect(
      outs.some(data => !!data.toString().match(/src does not exist/))
    ).toBe(true);
  });

  it("cli number of tries is number", async () => {
    const ls = spawn("yarn", ["start", "--src=./testFolder", "--tries=asdf"]);
    const outs = [];

    ls.stderr.on("data", data => {
      outs.push(data);
    });

    await new Promise(res => setTimeout(res, 1000));
    expect(
      outs.some(data => !!data.toString().match(/--tries should be a number/))
    ).toBe(true);
  });
});

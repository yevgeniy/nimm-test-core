class NimmTestCore {
  constructor(src) {
    this.src = src;
  }

  run() {
    if (!this.src) throw new Error("need src");
  }
}

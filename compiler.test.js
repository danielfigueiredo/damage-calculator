const { parse, evaluate } = require("./compiler");

describe("compiler tests", () => {
  describe("#parse", () => {
    it("should compile", () => {
      expect(parse("1")).toEqual([1]);
    });

    it("parses sub-expressions", () => {
      const program = "(3d6 + 3 + (10 / 2))";
      expect(parse(program)).toEqual(["3d6", "+", 3, "+", [10, "/", 2]]);
    });

    it("does not require root wrapping parenthesis", () => {
      const program = "6d8 + 4";
      expect(parse(program)).toEqual(["6d8", "+", 4]);
    });

    it("does not require space between math operators", () => {
      const program = "2d4+1*(20-3d6)-d8";
      expect(parse(program)).toEqual([
        "2d4",
        "+",
        1,
        "*",
        [20, "-", "3d6"],
        "-",
        "d8",
      ]);
    });
  });

  describe("#evaluate", () => {
    // TODO: update results when dice syntax is supported
    [
      { program: "3d6+3+(2d4+1)", result: 6 },
      { program: "6d8+1+(10/ 5)", result: 4 },
      { program: "5*2+5d4-1", result: 10 },
    ].forEach(({ program, result }) => {
      it(`resolves expression: ${program}`, () => {
        const expression = parse(program);
        expect(evaluate(expression)).toEqual(result);
      });
    });
  });
});

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

    it("parses multiple groups", () => {
      const program = "(1d4+5)*(3d6-2)";
      expect(parse(program)).toEqual([["1d4", "+", 5], "*", ["3d6", "-", 2]]);
    });
  });

  describe("#evaluate", () => {
    [
      { program: "d8", result: 4.5 },
      { program: "3d6+3", result: 13.5 },
      { program: "6d8-1+(10/ 5)", result: 28 },
      { program: "5*2+5d4-1", result: 21.5 },
      { program: "(1d4+5)*(3d6-2)+d12", result: 70.25 },
      { program: "( ( d4+ d6) -( 2d4))-11", result: -10 },
    ].forEach(({ program, result }) => {
      it(`resolves expression: ${program}`, () => {
        const expression = parse(program);
        expect(evaluate(expression)).toEqual(result);
      });
    });
    [
      { program: "1000d4" },
      { program: "4d1000" },
      { program: "3dd4" },
      { program: "-1d4" },
      { program: "*3+2" },
      { program: "/d8" },
      { program: "+9d10" },
    ].forEach(({ program }) => {
      it(`errors with expression: ${program}`, () => {
        expect(() => {
          const expression = parse(program);
          evaluate(expression);
        }).toThrow();
      });
    });
  });
});

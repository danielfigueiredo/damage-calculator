const MAX_NUMBER_DICES_DECIMALS = 2;
const MAX_NUMBER_DICE_FACE_DECIMALS = 3;

const diceRegex = new RegExp(
  `^([0-9]{0,${MAX_NUMBER_DICES_DECIMALS}})d([0-9]{1,${MAX_NUMBER_DICE_FACE_DECIMALS}})$`
);

const environmentFactory = () => ({
  "+": (a) => (b) => a + b,
  "-": (a) => (b) => a - b,
  "*": (a) => (b) => a * b,
  "/": (a) => (b) => a / b,
});

const ENV = environmentFactory();

const atom = (token = "") => {
  if (isNaN(token)) {
    return token;
  } else {
    return Number(token);
  }
};

const tokenize = (chars = "") =>
  chars
    .replace(/([\+\-\/\*\(\)])/g, " $1 ")
    .split(" ")
    .filter((c) => !!c.trim());

const readTokens = (tokens = []) => {
  const token = tokens.shift();
  if (token === "(") {
    const list = [];
    while (tokens[0] !== ")") {
      list.push(readTokens(tokens));
    }
    tokens.shift();
    return list;
  } else if (token === ")") {
    throw new SyntaxError("Unexpected )");
  } else {
    return atom(token);
  }
};

const parse = (program = "") => {
  const tokens = tokenize(`(${program})`);
  if (tokens.length === 0) {
    throw new SyntaxError("Empty program");
  }
  if (tokens[1] in ENV) {
    throw new SyntaxError(`Unexpected symbol: ${tokens[0]}`);
  }
  const expressions = readTokens(tokens);
  // we don't want to manually check for wrapping parenthesis because it is not simple
  // it is easier to always wrap and remove the unnecessary nesting if it exists
  if (expressions.length === 1 && Array.isArray(expressions[0])) {
    return expressions[0];
  } else {
    return expressions;
  }
};

const avgDiceRoll = (numberOfDices, diceFace) =>
  ((diceFace + 1) / 2) * numberOfDices;

const evaluate = (exp, env = ENV) => {
  if (typeof exp === "number") {
    return exp;
  } else if (typeof exp === "string") {
    if (exp in env) {
      return env[exp];
    } else if (diceRegex.test(exp)) {
      const [, numberOfDices, diceFace] = exp.match(diceRegex);
      return avgDiceRoll(
        !!numberOfDices ? Number(numberOfDices) : 1,
        Number(diceFace)
      );
    } else {
      throw new SyntaxError(`Invalid symbol: ${exp}`);
    }
  } else if (Array.isArray(exp)) {
    const evaledExps = exp.map((x) => evaluate(x, env));
    return evaledExps.reduce((acc, curr) => {
      let evaledCurr = curr;
      if (Array.isArray(curr)) {
        evaledCurr = evaluate(curr, env);
      }

      if (typeof curr === "function") {
        return curr(acc);
      } else if (typeof acc === "function") {
        return acc(curr);
      } else {
        return acc + curr;
      }
    });
  } else {
    throw new SyntaxError("Unexpected expression");
  }
};

module.exports = {
  parse,
  evaluate,
};

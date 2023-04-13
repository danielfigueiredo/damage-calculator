const tokenize = (chars = "") =>
  chars
    .replace(/([\+\-\/\*\(\)])/g, " $1 ")
    .split(" ")
    .filter((c) => !!c.trim());

const atom = (token = "") => {
  if (isNaN(token)) {
    return token;
  } else {
    return Number(token);
  }
};

const readTokens = (tokens = []) => {
  if (!tokens.length) {
    throw new SyntaxError("Unexpected EOF");
  }
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
  const wrappedProgram = program.startsWith("(") ? program : `(${program})`;
  return readTokens(tokenize(wrappedProgram));
};

const environment = () => ({
  "+": (a) => (b) => a + b,
  "-": (a) => (b) => a - b,
  "*": (a) => (b) => a * b,
  "/": (a) => (b) => a / b,
});

const evaluate = (exp, env = environment()) => {
  if (typeof exp === "number") {
    return exp;
  } else if (typeof exp === "string") {
    if (exp in env) {
      return env[exp];
    } else {
      // TODO: resolve dice syntax with avg here
      return 1;
    }
    return env[exp];
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
    }, 0);
  } else {
    throw new SyntaxError("Unexpected expression");
  }
};

module.exports = {
  parse,
  evaluate,
};

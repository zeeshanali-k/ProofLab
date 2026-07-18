from __future__ import annotations

import re
from dataclasses import dataclass

import sympy as sp


class MathSyntaxError(ValueError):
    """Raised for learner input outside ProofLab's published grammar."""


X = sp.Symbol("x", real=True)
TRIG_FUNCTIONS = {"sin": sp.sin, "cos": sp.cos, "tan": sp.tan}


def _read_group(source: str, start: int) -> tuple[str, int]:
    if start >= len(source) or source[start] != "{":
        raise MathSyntaxError("Expected a braced fraction term.")
    depth = 0
    for index in range(start, len(source)):
        if source[index] == "{":
            depth += 1
        elif source[index] == "}":
            depth -= 1
        if depth == 0:
            return source[start + 1:index], index + 1
    raise MathSyntaxError("Unclosed group in expression.")


def _replace_fractions(source: str) -> str:
    result: list[str] = []
    index = 0
    while index < len(source):
        if not source.startswith("\\frac", index):
            result.append(source[index])
            index += 1
            continue
        numerator, after_numerator = _read_group(source, index + len("\\frac"))
        denominator, after_denominator = _read_group(source, after_numerator)
        result.append(f"({_replace_fractions(numerator)})/({_replace_fractions(denominator)})")
        index = after_denominator
    return "".join(result)


def _replace_prime_groups(source: str) -> str:
    return re.sub(
        r"\^\{((?:\\prime)+)\}",
        lambda match: "'" * match.group(1).count("\\prime"),
        source,
    )


def normalize_latex(source: str, *, preserve_braces: bool = False) -> str:
    if not isinstance(source, str) or not source.strip():
        raise MathSyntaxError("An expression is required.")
    normalized = _replace_prime_groups(_replace_fractions(source))
    normalized = (
        normalized.replace("\\sin", " sin")
        .replace("\\cos", " cos")
        .replace("\\tan", " tan")
        .replace("\\left", "")
        .replace("\\right", "")
        .replace("\\cdot", "*")
        .replace("\\times", "*")
        .replace("^{\\prime}", "'")
        .replace("\\prime", "'")
        .replace("−", "-")
        .replace("²", "^2")
        .replace("\\,", "")
        .replace("\\!", "")
        .replace("\\{", "{")
        .replace("\\}", "}")
        .strip()
    )
    if not preserve_braces:
        normalized = normalized.replace("{", "(").replace("}", ")")
    if "\\" in normalized:
        raise MathSyntaxError("This notation is outside the current scope.")
    return normalized


@dataclass(frozen=True)
class Token:
    kind: str
    value: str


def _tokenize(source: str) -> list[Token]:
    tokens: list[Token] = []
    index = 0
    while index < len(source):
        char = source[index]
        if char.isspace():
            index += 1
        elif char.isdigit():
            end = index + 1
            while end < len(source) and source[end].isdigit():
                end += 1
            tokens.append(Token("number", source[index:end]))
            index = end
        elif char.isalpha():
            end = index + 1
            while end < len(source) and source[end].isalpha():
                end += 1
            tokens.append(Token("identifier", source[index:end]))
            index = end
        elif char in "+-*/^()":
            tokens.append(Token(char, char))
            index += 1
        else:
            raise MathSyntaxError("This expression uses unsupported notation.")

    expanded: list[Token] = []
    for token in tokens:
        previous = expanded[-1] if expanded else None
        function_call = previous and previous.kind == "identifier" and previous.value in TRIG_FUNCTIONS and token.kind == "("
        if previous and _is_atom_end(previous) and _is_atom_start(token) and not function_call:
            expanded.append(Token("*", "*"))
        expanded.append(token)
    return expanded


def _is_atom_end(token: Token) -> bool:
    return token.kind in {"number", "identifier", ")"}


def _is_atom_start(token: Token) -> bool:
    return token.kind in {"number", "identifier", "("}


def _validate_polynomial(expression: sp.Expr, *, max_degree: int, message: str = "Only polynomial expressions are supported.") -> None:
    if sp.denom(sp.together(expression)).has(X):
        raise MathSyntaxError("Variable denominators are outside the current calculus scope.")
    try:
        degree = sp.Poly(expression, X).degree()
    except sp.PolynomialError as error:
        raise MathSyntaxError(message) from error
    if degree > max_degree:
        raise MathSyntaxError(f"Only polynomial powers through degree {max_degree} are supported.")


class _ExpressionParser:
    def __init__(self, tokens: list[Token], *, allow_x: bool, allow_i: bool, allow_trig: bool, max_power: int) -> None:
        self.tokens = tokens
        self.allow_x = allow_x
        self.allow_i = allow_i
        self.allow_trig = allow_trig
        self.max_power = max_power
        self.position = 0

    def parse(self) -> sp.Expr:
        if not self.tokens:
            raise MathSyntaxError("An expression is required.")
        expression = self._sum()
        if self._current() is not None:
            raise MathSyntaxError("This expression is incomplete.")
        return sp.expand(expression)

    def _sum(self) -> sp.Expr:
        value = self._product()
        while (token := self._current()) and token.kind in {"+", "-"}:
            self.position += 1
            right = self._product()
            value = value + right if token.kind == "+" else value - right
        return value

    def _product(self) -> sp.Expr:
        value = self._power()
        while (token := self._current()) and token.kind in {"*", "/"}:
            self.position += 1
            right = self._power()
            if token.kind == "/" and right == 0:
                raise MathSyntaxError("Division by zero is not allowed.")
            value = value * right if token.kind == "*" else value / right
        return value

    def _power(self) -> sp.Expr:
        base = self._unary()
        token = self._current()
        if not token or token.kind != "^":
            return base
        self.position += 1
        exponent = self._unary()
        if not exponent.is_Integer or int(exponent) < 0 or int(exponent) > self.max_power:
            raise MathSyntaxError(f"Only non-negative integer powers through {self.max_power} are supported.")
        return base ** int(exponent)

    def _unary(self) -> sp.Expr:
        token = self._current()
        if token and token.kind in {"+", "-"}:
            self.position += 1
            value = self._unary()
            return value if token.kind == "+" else -value
        return self._atom()

    def _atom(self) -> sp.Expr:
        token = self._current()
        if token is None:
            raise MathSyntaxError("Expected an expression.")
        if token.kind == "number":
            self.position += 1
            return sp.Integer(token.value)
        if token.kind == "identifier":
            self.position += 1
            if token.value in TRIG_FUNCTIONS:
                if not self.allow_trig:
                    raise MathSyntaxError("Trigonometry is outside the current scope.")
                if not self._current() or self._current().kind != "(":
                    raise MathSyntaxError(f"Use {token.value}(…) for trigonometric functions.")
                self.position += 1
                argument = self._sum()
                if not self._current() or self._current().kind != ")":
                    raise MathSyntaxError("Parentheses do not match.")
                self.position += 1
                _validate_polynomial(argument, max_degree=12, message="Trigonometric inputs must be polynomials in x.")
                return TRIG_FUNCTIONS[token.value](argument)
            if token.value == "x" and self.allow_x:
                return X
            if token.value == "i" and self.allow_i:
                return sp.I
            raise MathSyntaxError("This variable or function is outside the current scope.")
        if token.kind == "(":
            self.position += 1
            value = self._sum()
            if not self._current() or self._current().kind != ")":
                raise MathSyntaxError("Parentheses do not match.")
            self.position += 1
            return value
        raise MathSyntaxError("Expected a number, variable, or parenthesized expression.")

    def _current(self) -> Token | None:
        return self.tokens[self.position] if self.position < len(self.tokens) else None


def parse_expression(source: str, *, allow_x: bool, allow_i: bool = False, allow_trig: bool = False, max_power: int = 12) -> sp.Expr:
    normalized = normalize_latex(source)
    if any(symbol in normalized for symbol in "={}"):
        raise MathSyntaxError("Use an expression without an equals sign or braces here.")
    expression = _ExpressionParser(
        _tokenize(normalized),
        allow_x=allow_x,
        allow_i=allow_i,
        allow_trig=allow_trig,
        max_power=max_power,
    ).parse()
    if not allow_x and expression.has(X):
        raise MathSyntaxError("x is not allowed in this expression.")
    return expression


def parse_calculus_expression(source: str) -> sp.Expr:
    expression = parse_expression(source, allow_x=True, allow_trig=True)
    if sp.denom(sp.together(expression)).has(X):
        raise MathSyntaxError("Variable denominators are outside the current calculus scope.")
    return expression


def _split_equation(source: str) -> tuple[str, str]:
    normalized = normalize_latex(source)
    if normalized.count("=") != 1:
        raise MathSyntaxError("Use exactly one equals sign.")
    left, right = normalized.split("=", maxsplit=1)
    if not left.strip() or not right.strip():
        raise MathSyntaxError("Both sides of the equation need an expression.")
    return left, right


def parse_equation(source: str, *, allow_i: bool = False, max_degree: int = 2) -> tuple[sp.Expr, sp.Expr]:
    left_source, right_source = _split_equation(source)
    left = parse_expression(left_source, allow_x=True, allow_i=allow_i)
    right = parse_expression(right_source, allow_x=True, allow_i=allow_i)
    residual = sp.expand(left - right)
    try:
        degree = sp.Poly(residual, X).degree()
    except sp.PolynomialError as error:
        raise MathSyntaxError("Only polynomial equations are supported.") from error
    if degree > max_degree:
        raise MathSyntaxError(f"Only equations through degree {max_degree} are supported.")
    if sp.denom(sp.cancel(left)).has(X) or sp.denom(sp.cancel(right)).has(X):
        raise MathSyntaxError("Variable denominators are outside the current scope.")
    return left, right


def _function_parts(source: str, *, expected_order: int | None) -> tuple[int, str]:
    normalized = normalize_latex(source)
    match = re.fullmatch(r"\s*f('*)\s*\(\s*x\s*\)\s*=\s*(.+)", normalized)
    if not match:
        raise MathSyntaxError("Use function notation like f(x) = … or f''(x) = ….")
    order = len(match.group(1))
    if expected_order is not None and order != expected_order:
        expected = "f(x) = …" if expected_order == 0 else "f'(x) = …"
        raise MathSyntaxError(f"Use function notation like {expected}.")
    return order, match.group(2)


def parse_function(source: str) -> sp.Expr:
    _, body = _function_parts(source, expected_order=0)
    return parse_calculus_expression(body)


def parse_derivative(source: str) -> tuple[int, sp.Expr]:
    order, body = _function_parts(source, expected_order=None)
    if order < 1:
        raise MathSyntaxError("A derivative must use f'(x), f''(x), or a later order.")
    return order, parse_calculus_expression(body)


def parse_integral(source: str) -> sp.Expr:
    prepared = source.replace("\\int", "INT").replace("\\mathrm{d}", "d")
    normalized = normalize_latex(prepared)
    match = re.fullmatch(r"INT\s*(.+?)\s*d\s*x", normalized)
    if not match:
        raise MathSyntaxError("Use integral notation like \\int x^2 \\, dx.")
    integrand = parse_calculus_expression(match.group(1))
    validate_integrand(integrand)
    return integrand


def parse_antiderivative(source: str) -> tuple[sp.Expr, bool]:
    normalized = normalize_latex(source).replace(" ", "")
    match = re.fullmatch(r"F\(x\)=(.+)", normalized)
    if not match:
        raise MathSyntaxError("Use antiderivative notation like F(x) = … + C.")
    right = match.group(1)
    has_constant = right.endswith("+C")
    body = right[:-2] if has_constant else right
    if not body:
        raise MathSyntaxError("An antiderivative needs an expression before + C.")
    return parse_calculus_expression(body), has_constant


def validate_integrand(integrand: sp.Expr) -> None:
    for term in sp.Add.make_args(sp.expand(integrand)):
        try:
            _validate_polynomial(term, max_degree=12)
            continue
        except MathSyntaxError:
            pass
        coefficient, candidate = term.as_coeff_Mul()
        if coefficient.is_Rational and candidate.func in {sp.sin, sp.cos}:
            argument = candidate.args[0]
            _validate_polynomial(argument, max_degree=1, message="Indefinite integrals only support sin(ax+b) and cos(ax+b).")
            if sp.Poly(argument, X).coeff_monomial(X) != 0:
                continue
        raise MathSyntaxError("Indefinite integrals support polynomials plus sin(ax+b) and cos(ax+b).")


def parse_solution_set(source: str) -> list[sp.Expr]:
    normalized = normalize_latex(source, preserve_braces=True).replace(" ", "")
    if not (normalized.startswith("{") and normalized.endswith("}")):
        raise MathSyntaxError("Enter the solutions in braces, for example {2i,-2i}.")
    body = normalized[1:-1]
    if not body:
        raise MathSyntaxError("A solution set cannot be empty.")
    pieces = body.split(",")
    if any(not piece for piece in pieces):
        raise MathSyntaxError("Separate each solution with a comma.")
    answers = [parse_expression(piece, allow_x=False, allow_i=True) for piece in pieces]
    if len(answers) != len({sp.simplify(answer) for answer in answers}):
        raise MathSyntaxError("List each solution only once.")
    return answers

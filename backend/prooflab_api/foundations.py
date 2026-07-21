"""Server-owned, deterministic arithmetic and quantity practice.

The authored template registry intentionally separates learner-safe problem
content from the generated canonical answer.  A seed can recreate an instance
on the server, but is never part of an API payload.
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from random import Random
import re

from .contracts import VisualizerType


@dataclass(frozen=True)
class FoundationTemplate:
    id: str
    node_id: str
    concept_id: str
    title: str
    generator: str
    visualizer_type: VisualizerType
    is_guided: bool


@dataclass(frozen=True)
class GeneratedPractice:
    title: str
    prompt: str
    instructions: str
    visualizer_type: VisualizerType
    visualization: dict[str, object]
    canonical_answer: Fraction
    tolerance: Fraction
    accepted_feedback: str
    correction_feedback: str


_MODULES = (
    ("count-place", "foundations.counting-place-value", "Counting and place value", "count", VisualizerType.PLACE_VALUE_BLOCKS),
    ("integers", "foundations.integers-operations", "Integers and operations", "integers", VisualizerType.NUMBER_LINE),
    ("order-factors", "foundations.order-factors-multiples", "Order, factors, and multiples", "order", VisualizerType.NUMBER_LINE),
    ("fractions", "foundations.fractions", "Fractions", "fractions", VisualizerType.FRACTION_BARS),
    ("decimals", "foundations.decimals", "Decimals", "decimals", VisualizerType.FRACTION_BARS),
    ("percentages", "foundations.percentages", "Percentages", "percent", VisualizerType.RATIO_TABLE),
    ("ratios", "foundations.ratios-rates-proportions", "Ratios, rates, and proportions", "ratio", VisualizerType.RATIO_TABLE),
    ("units", "foundations.units-measurement", "Units and measurement", "units", VisualizerType.RATIO_TABLE),
    ("estimation", "foundations.estimation", "Estimation", "estimate", VisualizerType.PLACE_VALUE_BLOCKS),
    ("finance", "foundations.financial-arithmetic", "Everyday money math", "finance", VisualizerType.RATIO_TABLE),
)

FOUNDATION_TEMPLATES: tuple[FoundationTemplate, ...] = tuple(
    FoundationTemplate(
        id=f"foundation-{slug}-{'visual' if guided else 'practice'}",
        node_id=node_id,
        concept_id=node_id,
        title=f"{'Visual mission: ' if guided else 'Practice: '}{title}",
        generator=generator,
        visualizer_type=visualizer,
        is_guided=guided,
    )
    for slug, node_id, title, generator, visualizer in _MODULES
    for guided in (True, False)
)
_TEMPLATES_BY_ID = {template.id: template for template in FOUNDATION_TEMPLATES}


def get_foundation_template(template_id: str) -> FoundationTemplate | None:
    return _TEMPLATES_BY_ID.get(template_id)


def _fraction_text(value: Fraction, *, money: bool = False) -> str:
    if money:
        return f"${float(value):.2f}"
    if value.denominator == 1:
        return str(value.numerator)
    return f"{value.numerator}/{value.denominator}"


def _number_line(minimum: int, maximum: int, *, start: int | None = None, movement: int | None = None) -> dict[str, object]:
    return {
        "minimum": minimum,
        "maximum": maximum,
        "ticks": list(range(minimum, maximum + 1)),
        "start": start,
        "movement": movement,
    }


def generate_foundation_practice(template: FoundationTemplate, seed: int) -> GeneratedPractice:
    rng = Random(seed)
    guided = template.is_guided
    if template.generator == "count":
        hundreds, tens, ones = rng.randint(1, 8), rng.randint(1, 9), rng.randint(0, 9)
        value = 100 * hundreds + 10 * tens + ones
        return GeneratedPractice(template.title, f"How many is {hundreds} hundreds, {tens} tens, and {ones} ones?", "Use the place-value blocks, then enter the whole number.", template.visualizer_type, {"hundreds": hundreds, "tens": tens, "ones": ones, "mode": "compose-number"}, Fraction(value), Fraction(0), "You composed the number from its place values.", "Recount the hundreds, tens, and ones before combining them.")
    if template.generator == "integers":
        start = rng.randint(-9, 4)
        movement = rng.randint(2, 9) * (-1 if rng.choice((True, False)) else 1)
        answer = start + movement
        minimum, maximum = min(-12, start, answer), max(12, start, answer)
        operation = f"{start} {'+' if movement >= 0 else '−'} {abs(movement)}"
        return GeneratedPractice(template.title, f"Start at {start}. Move {'right' if movement >= 0 else 'left'} {abs(movement)} spaces. Where do you land?", f"Use the number line to model {operation}, then enter the endpoint.", template.visualizer_type, _number_line(minimum, maximum, start=start, movement=movement), Fraction(answer), Fraction(0), "You tracked the signed move correctly.", "Check the direction of the move and count each space once.")
    if template.generator == "order":
        a, b, c = rng.randint(2, 8), rng.randint(2, 8), rng.randint(2, 6)
        answer = (a + b) * c if guided else a + b * c
        expression = f"({a} + {b}) × {c}" if guided else f"{a} + {b} × {c}"
        return GeneratedPractice(template.title, f"Evaluate {expression}.", "Use the highlighted grouping and operation order; enter the final value.", template.visualizer_type, _number_line(0, max(30, int(answer) + 5)), Fraction(answer), Fraction(0), "You followed the operation order.", "Do multiplication or parentheses before the remaining addition.")
    if template.generator == "fractions":
        denominator = rng.choice((4, 5, 6, 8))
        left, right = rng.randint(1, denominator - 2), rng.randint(1, denominator - 2)
        answer = Fraction(left + right, denominator)
        return GeneratedPractice(template.title, f"What is {left}/{denominator} + {right}/{denominator}?", "Shade each fraction bar mentally, combine equal-sized parts, and enter a simplified fraction or decimal.", template.visualizer_type, {"denominator": denominator, "leftFilled": left, "rightFilled": right, "mode": "combine"}, answer, Fraction(0), "You combined equal-sized fractional parts.", "Keep the denominator the same and combine only the numerators.")
    if template.generator == "decimals":
        left = Fraction(rng.randint(15, 89), 10)
        right = Fraction(rng.randint(2, int(left * 10) - 1), 10)
        answer = left - right
        return GeneratedPractice(template.title, f"What is {float(left):.1f} − {float(right):.1f}?", "Align tenths on the fraction bar, then enter the decimal value.", template.visualizer_type, {"denominator": 10, "leftTenths": int(left * 10), "rightTenths": int(right * 10), "mode": "subtract"}, answer, Fraction(0), "You aligned the decimal places correctly.", "Treat each tenth as the same-sized piece before subtracting.")
    if template.generator == "percent":
        percent = rng.choice((10, 15, 20, 25, 30, 40, 50))
        total = rng.choice((40, 60, 80, 100, 120, 160, 200))
        answer = Fraction(percent * total, 100)
        return GeneratedPractice(template.title, f"What is {percent}% of {total}?", "Use the table to connect 100% to the total, then enter the requested amount.", template.visualizer_type, {"headers": ["percent", "amount"], "rows": [["100%", str(total)], [f"{percent}%", "?"]]}, answer, Fraction(0), "You scaled the whole by the requested percent.", "Find one percent or ten percent first, then scale to the requested percent.")
    if template.generator == "ratio":
        base, multiplier = rng.randint(2, 7), rng.randint(3, 9)
        answer = base * multiplier
        return GeneratedPractice(template.title, f"A recipe uses {base} cups of water for 1 batch. How many cups are needed for {multiplier} batches?", "Complete the proportional row in the ratio table and enter the quantity.", template.visualizer_type, {"headers": ["batches", "cups"], "rows": [["1", str(base)], [str(multiplier), "?"]]}, Fraction(answer), Fraction(0), "You scaled both parts of the ratio equally.", "Use the same multiplier for batches and cups.")
    if template.generator == "units":
        meters = rng.randint(2, 18)
        answer = meters * 100
        return GeneratedPractice(template.title, f"Convert {meters} meters to centimeters.", "Use 1 meter = 100 centimeters; enter only the number of centimeters.", template.visualizer_type, {"headers": ["meters", "centimeters"], "rows": [["1", "100"], [str(meters), "?"]]}, Fraction(answer), Fraction(0), "You used the unit relationship consistently.", "Scale the 100 centimeters for every meter in the measurement.")
    if template.generator == "estimate":
        left, right = rng.randint(124, 486), rng.randint(124, 486)
        answer = int(round(left, -1) + round(right, -1))
        return GeneratedPractice(template.title, f"Estimate {left} + {right} by rounding each number to the nearest ten.", "Use the place-value blocks to round both values, then enter the estimate.", template.visualizer_type, {"values": [left, right], "roundTo": "nearest ten", "mode": "estimate-sum"}, Fraction(answer), Fraction(0), "Your rounded values make a sensible estimate.", "Round each number to the nearest ten before adding.")
    if template.generator == "finance":
        scenario = rng.choice(("discount", "sales-tax", "tip", "unit-price", "budget", "interest"))
        price = rng.choice((20, 25, 30, 40, 50, 60, 80))
        percentage = rng.choice((10, 15, 20, 25))
        if scenario == "discount":
            answer = Fraction(price * (100 - percentage), 100)
            prompt = f"A ${price:.2f} item is {percentage}% off. What is the sale price?"
            labels = [["original price", f"${price:.2f}"], ["discount", f"{percentage}%"], ["sale price", "?"]]
            accepted = "You applied the discount and kept the result in dollars."
            correction = "Find the discount amount, then subtract it from the original price."
        elif scenario == "sales-tax":
            answer = Fraction(price * (100 + percentage), 100)
            prompt = f"A ${price:.2f} item has {percentage}% sales tax. What is the total?"
            labels = [["pre-tax price", f"${price:.2f}"], ["sales tax", f"{percentage}%"], ["total", "?"]]
            accepted = "You added the sales tax to the pre-tax price."
            correction = "Find the tax amount, then add it to the pre-tax price."
        elif scenario == "tip":
            answer = Fraction(price * (100 + percentage), 100)
            prompt = f"A ${price:.2f} meal has a {percentage}% tip. What is the total?"
            labels = [["meal", f"${price:.2f}"], ["tip", f"{percentage}%"], ["total", "?"]]
            accepted = "You calculated the USD total with the percentage included."
            correction = "Find the tip first, then add it to the meal price."
        elif scenario == "unit-price":
            units = rng.choice((2, 4, 5, 8, 10))
            package_price = units * rng.choice((2, 3, 4, 5))
            answer = Fraction(package_price, units)
            prompt = f"A {units}-unit package costs ${package_price:.2f}. What is the unit price?"
            labels = [["package price", f"${package_price:.2f}"], ["units", str(units)], ["per unit", "?"]]
            accepted = "You found the cost for one unit."
            correction = "Divide the package price by the number of units."
        elif scenario == "budget":
            budget = rng.choice((100, 120, 150, 200))
            first, second = rng.choice((20, 30, 40)), rng.choice((15, 25, 35))
            answer = Fraction(budget - first - second)
            prompt = f"You have a ${budget:.2f} weekly budget and spend ${first:.2f} and ${second:.2f}. How much remains?"
            labels = [["weekly budget", f"${budget:.2f}"], ["spending", f"${first + second:.2f}"], ["remaining", "?"]]
            accepted = "You kept the budget total and spending in the same units."
            correction = "Add both expenses, then subtract that total from the budget."
        else:
            principal = rng.choice((100, 200, 300, 400, 500))
            years = rng.choice((1, 2, 3))
            answer = Fraction(principal * percentage * years, 100)
            prompt = f"What simple interest is earned on ${principal:.2f} at {percentage}% for {years} years?"
            labels = [["principal", f"${principal:.2f}"], ["annual rate", f"{percentage}%"], ["years", str(years)], ["interest", "?"]]
            accepted = "You applied principal × rate × time for simple interest."
            correction = "Convert the percent to a decimal, then multiply principal, rate, and years."
        return GeneratedPractice(template.title, prompt, "Use the money table and enter a USD amount; cents are rounded to the nearest cent.", template.visualizer_type, {"headers": ["item", "value"], "rows": labels, "currency": "USD"}, answer, Fraction(1, 200), accepted, correction)
    raise ValueError(f"Unsupported foundation generator: {template.generator}")


def normalize_quantity(response: str) -> Fraction:
    """Accept numeric, fractional, decimal, and USD learner responses."""
    value = response.strip().lower().replace("$", "").replace(",", "")
    value = re.sub(r"\s*(dollars?|usd|cents?)\s*$", "", value).strip()
    if value.endswith("%"):
        value = value[:-1].strip()
    if not re.fullmatch(r"[+-]?(?:\d+(?:\.\d+)?|\d+\s*/\s*\d+)", value):
        raise ValueError("Enter a number, decimal, fraction, or USD amount.")
    numerator = value.replace(" ", "")
    return Fraction(numerator)


def check_foundation_response(practice: GeneratedPractice, response: str) -> tuple[bool, str, str | None]:
    try:
        normalized = normalize_quantity(response)
    except (ValueError, ZeroDivisionError):
        return False, "Enter a number, decimal, fraction, or USD amount.", None
    if abs(normalized - practice.canonical_answer) <= practice.tolerance:
        return True, practice.accepted_feedback, _fraction_text(normalized)
    return False, practice.correction_feedback, _fraction_text(normalized)

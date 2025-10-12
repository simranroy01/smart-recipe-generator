/**
 * Utility functions for recipe data manipulation, including serving size scaling.
 */

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface RecipeNutrition {
  calories: string;
  protein: string;
}

/**
 * Scales ingredient quantities based on the ratio of selected servings to base servings.
 * Handles numeric quantities (e.g., "1.5 cups flour" -> "3 cups flour" for 2x servings).
 * Non-numeric quantities (e.g., "to taste", "pinch") are left unchanged.
 */
export function scaleIngredients(
  ingredients: RecipeIngredient[],
  baseServings: number,
  selectedServings: number
): RecipeIngredient[] {
  if (baseServings <= 0 || selectedServings <= 0) return ingredients;

  const ratio = selectedServings / baseServings;

  return ingredients.map((ing) => {
    const scaledQuantity = scaleQuantity(ing.quantity, ratio);
    return {
      ...ing,
      quantity: scaledQuantity,
    };
  });
}

/**
 * Scales nutrition values based on the ratio of selected servings to base servings.
 * Assumes nutrition values are per-serving and numeric.
 */
export function scaleNutrition(
  nutrition: RecipeNutrition,
  baseServings: number,
  selectedServings: number
): RecipeNutrition {
  if (baseServings <= 0 || selectedServings <= 0) return nutrition;

  const ratio = selectedServings / baseServings;

  const scaledCalories = scaleNumericValue(nutrition.calories, ratio);
  const scaledProtein = scaleNumericValue(nutrition.protein, ratio);

  return {
    calories: scaledCalories,
    protein: scaledProtein,
  };
}

/**
 * Scales a quantity string by the given ratio.
 * Parses numeric prefix, scales it, and reconstructs the string.
 * Examples:
 * - "1.5 cups flour" with ratio 2 -> "3 cups flour"
 * - "to taste" -> "to taste" (unchanged)
 */
function scaleQuantity(quantity: string, ratio: number): string {
  // Regex to match: optional number (int or float), optional space, then unit/name
  const match = quantity.trim().match(/^(\d*\.?\d+)\s*(.*)$/);
  if (!match) {
    // No numeric part, return as-is (e.g., "to taste", "pinch")
    return quantity;
  }

  const numericPart = parseFloat(match[1]);
  const rest = match[2];

  if (isNaN(numericPart)) {
    return quantity;
  }

  const scaled = numericPart * ratio;
  // Round to 2 decimal places, but remove trailing .00
  const rounded = Math.round(scaled * 100) / 100;
  const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);

  return `${formatted} ${rest}`.trim();
}

/**
 * Scales a numeric string value by the given ratio.
 * Assumes the value is numeric; returns original if not.
 */
function scaleNumericValue(value: string, ratio: number): string {
  const numeric = parseFloat(value);
  if (isNaN(numeric)) {
    return value;
  }

  const scaled = numeric * ratio;
  const rounded = Math.round(scaled * 100) / 100;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
}

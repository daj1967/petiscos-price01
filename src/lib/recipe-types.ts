export interface RecipeIngredientItem {
  ingredientId: string
  name: string
  unit: string
  unitCost: number
  quantity: number
  subtotal: number
}

export interface RecipeData {
  ingredients: RecipeIngredientItem[]
}

export function calculateIngredientSubtotal(unitCost: number, quantity: number): number {
  return unitCost * quantity
}

export function calculateRecipeTotalCost(ingredients: RecipeIngredientItem[]): number {
  return ingredients.reduce((sum, ing) => sum + ing.subtotal, 0)
}

export function calculateRecipeFinalPrice(totalCost: number, markup: number): number {
  return totalCost * (1 + markup / 100)
}

export function isRecipeData(data: unknown): data is RecipeData {
  return (
    data != null &&
    typeof data === 'object' &&
    'ingredients' in data &&
    Array.isArray((data as RecipeData).ingredients)
  )
}

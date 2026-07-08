export interface RecipeIngredientEntry {
  ingredientId: string
  name: string
  unit: string
  unitCost: number
  quantity: number
  subtotal: number
}

export interface RecipeIngredientsList {
  ingredients: RecipeIngredientEntry[]
}

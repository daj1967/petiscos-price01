import type { RecipeTechnicalSheet, RecipeIngredient } from '@/lib/pricing-types'

interface RawIngredient {
  name: string
  qtyKg: number
  price: number
}

function buildRecipe(
  id: string,
  name: string,
  unit: string,
  raw: RawIngredient[],
  yieldKg: number,
  portionG: number,
): RecipeTechnicalSheet {
  const totalKg = raw.reduce((s, i) => s + i.qtyKg, 0)
  const totalValue = raw.reduce((s, i) => s + i.qtyKg * i.price, 0)
  const ingredients: RecipeIngredient[] = raw.map((ing, idx) => {
    const value = ing.qtyKg * ing.price
    const pctKg = yieldKg > 0 ? ing.qtyKg / yieldKg : 0
    return {
      item: idx + 1,
      name: ing.name,
      quantityKg: ing.qtyKg,
      unitPrice: ing.price,
      value,
      percentKg: pctKg,
      percentValue: totalValue > 0 ? value / totalValue : 0,
      qtyPerKg: pctKg,
      costPerKg: pctKg * ing.price,
    }
  })
  return {
    id,
    productName: name,
    unit,
    ingredients,
    totalKg,
    totalValue,
    costPerKg: ingredients.reduce((s, i) => s + i.costPerKg, 0),
    yieldKg,
    portionCount: Math.floor((yieldKg * 1000) / portionG),
    portionWeightGrams: portionG,
  }
}

export const mockRecipes: RecipeTechnicalSheet[] = [
  buildRecipe(
    'recipe-1',
    'Bolinho de Mandioca com Queijo',
    'Kg',
    [
      { name: 'Água', qtyKg: 1.5, price: 0 },
      { name: 'Mandioca Cozida', qtyKg: 2.0, price: 4.5 },
      { name: 'Queijo Coalho', qtyKg: 0.4, price: 35 },
      { name: 'Manteiga', qtyKg: 0.1, price: 8 },
      { name: 'Sal', qtyKg: 0.03, price: 2.9 },
    ],
    3.8,
    30,
  ),
  buildRecipe(
    'recipe-2',
    'Croquete de Frango',
    'Kg',
    [
      { name: 'Água', qtyKg: 1.0, price: 0 },
      { name: 'Farinha de Rosca', qtyKg: 0.5, price: 6 },
      { name: 'Frango Desfiado', qtyKg: 1.5, price: 16 },
      { name: 'Cebola', qtyKg: 0.2, price: 4 },
      { name: 'Sal', qtyKg: 0.04, price: 2.9 },
      { name: 'Tempero Completo', qtyKg: 0.02, price: 25 },
    ],
    3.0,
    30,
  ),
  buildRecipe(
    'recipe-3',
    'Pastel de Fubá Recheado',
    'Kg',
    [
      { name: 'Água', qtyKg: 1.8, price: 0 },
      { name: 'Fubá de Milho', qtyKg: 0.9, price: 3.2 },
      { name: 'Polvilho Azedo', qtyKg: 0.2, price: 7.5 },
      { name: 'Banha', qtyKg: 0.08, price: 12 },
      { name: 'Sal', qtyKg: 0.035, price: 2.9 },
      { name: 'Recheio de Costela', qtyKg: 1.3, price: 28 },
    ],
    4.0,
    30,
  ),
]

migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('ingredients')
    const suppliersId = app.findCollectionByNameOrId('suppliers').id

    if (!col.fields.getByName('code')) col.fields.add(new TextField({ name: 'code' }))
    if (!col.fields.getByName('brand')) col.fields.add(new TextField({ name: 'brand' }))
    if (!col.fields.getByName('supplier_id'))
      col.fields.add(
        new RelationField({ name: 'supplier_id', collectionId: suppliersId, maxSelect: 1 }),
      )
    if (!col.fields.getByName('status')) col.fields.add(new TextField({ name: 'status' }))
    if (!col.fields.getByName('buy_unit')) col.fields.add(new TextField({ name: 'buy_unit' }))
    if (!col.fields.getByName('buy_price')) col.fields.add(new NumberField({ name: 'buy_price' }))
    if (!col.fields.getByName('package_quantity'))
      col.fields.add(new NumberField({ name: 'package_quantity' }))
    if (!col.fields.getByName('freight_cost'))
      col.fields.add(new NumberField({ name: 'freight_cost' }))
    if (!col.fields.getByName('recoverable_taxes'))
      col.fields.add(new NumberField({ name: 'recoverable_taxes' }))
    if (!col.fields.getByName('loss_percentage'))
      col.fields.add(new NumberField({ name: 'loss_percentage' }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('ingredients')
    const fieldsToRemove = [
      'code',
      'brand',
      'supplier_id',
      'status',
      'buy_unit',
      'buy_price',
      'package_quantity',
      'freight_cost',
      'recoverable_taxes',
      'loss_percentage',
    ]
    fieldsToRemove.forEach((name) => {
      const field = col.fields.getByName(name)
      if (field) col.fields.remove(field)
    })
    app.save(col)
  },
)

migrate(
  (app) => {
    const suppliers = new Collection({
      name: 'suppliers',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'legal_name', type: 'text', required: true },
        { name: 'trade_name', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'contact_info', type: 'text' },
        { name: 'payment_terms', type: 'text' },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_suppliers_user_id ON suppliers (user_id)'],
    })
    app.save(suppliers)

    const units = new Collection({
      name: 'units_of_measure',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'base_conversion_factor', type: 'number' },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_units_of_measure_user_id ON units_of_measure (user_id)'],
    })
    app.save(units)

    const suppliersId = app.findCollectionByNameOrId('suppliers').id
    const ingredientsId = app.findCollectionByNameOrId('ingredients').id

    const purchases = new Collection({
      name: 'purchases',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'ingredient_id',
          type: 'relation',
          required: true,
          collectionId: ingredientsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'supplier_id',
          type: 'relation',
          required: true,
          collectionId: suppliersId,
          maxSelect: 1,
        },
        { name: 'price', type: 'number', required: true },
        { name: 'date', type: 'date' },
        { name: 'invoice_ref', type: 'text' },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_purchases_user_id ON purchases (user_id)',
        'CREATE INDEX idx_purchases_ingredient_id ON purchases (ingredient_id)',
      ],
    })
    app.save(purchases)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('purchases'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('units_of_measure'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('suppliers'))
    } catch (_) {}
  },
)

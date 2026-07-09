migrate(
  (app) => {
    const baseProducts = new Collection({
      name: 'base_products',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'code', type: 'text' },
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'text' },
        { name: 'yield_weight', type: 'number' },
        { name: 'loss_percentage', type: 'number' },
        { name: 'shelf_life', type: 'text' },
        { name: 'needs_recalculation', type: 'bool' },
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
      indexes: ['CREATE INDEX idx_base_products_user_id ON base_products (user_id)'],
    })
    app.save(baseProducts)

    const baseProductsId = app.findCollectionByNameOrId('base_products').id
    const ingredientsId = app.findCollectionByNameOrId('ingredients').id

    const baseProductItems = new Collection({
      name: 'base_product_items',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'base_product_id',
          type: 'relation',
          required: true,
          collectionId: baseProductsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'ingredient_id',
          type: 'relation',
          required: true,
          collectionId: ingredientsId,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit', type: 'text' },
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
        'CREATE INDEX idx_base_product_items_user_id ON base_product_items (user_id)',
        'CREATE INDEX idx_base_product_items_base_product_id ON base_product_items (base_product_id)',
      ],
    })
    app.save(baseProductItems)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('base_product_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('base_products'))
    } catch (_) {}
  },
)

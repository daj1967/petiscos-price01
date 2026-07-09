migrate(
  (app) => {
    const productionAssets = new Collection({
      name: 'production_assets',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'power_kw', type: 'number' },
        { name: 'consumption_per_hour', type: 'number' },
        { name: 'cost_per_hour', type: 'number' },
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
      indexes: ['CREATE INDEX idx_production_assets_user_id ON production_assets (user_id)'],
    })
    app.save(productionAssets)

    const laborRates = new Collection({
      name: 'labor_rates',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'role', type: 'text', required: true },
        { name: 'hourly_rate', type: 'number', required: true },
        { name: 'benefits_multiplier', type: 'number' },
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
      indexes: ['CREATE INDEX idx_labor_rates_user_id ON labor_rates (user_id)'],
    })
    app.save(laborRates)

    const packaging = new Collection({
      name: 'packaging',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'type', type: 'text', required: true },
        { name: 'material', type: 'text' },
        { name: 'package_qty', type: 'number' },
        { name: 'buy_price', type: 'number', required: true },
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
      indexes: ['CREATE INDEX idx_packaging_user_id ON packaging (user_id)'],
    })
    app.save(packaging)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('packaging'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('labor_rates'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('production_assets'))
    } catch (_) {}
  },
)

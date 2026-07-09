migrate(
  (app) => {
    const taxRules = new Collection({
      name: 'tax_rules',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'ncm', type: 'text' },
        { name: 'cest', type: 'text' },
        { name: 'iva_rate', type: 'number' },
        { name: 'reduction_percentage', type: 'number' },
        { name: 'tax_regime', type: 'text' },
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
      indexes: ['CREATE INDEX idx_tax_rules_user_id ON tax_rules (user_id)'],
    })
    app.save(taxRules)

    const baseProductsId = app.findCollectionByNameOrId('base_products').id
    const packagingId = app.findCollectionByNameOrId('packaging').id
    const taxRulesId = app.findCollectionByNameOrId('tax_rules').id

    const finalProducts = new Collection({
      name: 'final_products',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'sku', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'text' },
        { name: 'sales_channel', type: 'text' },
        { name: 'net_weight', type: 'number' },
        { name: 'gross_weight', type: 'number' },
        { name: 'shelf_life', type: 'text' },
        { name: 'base_products', type: 'relation', collectionId: baseProductsId, maxSelect: 999 },
        { name: 'packaging_ids', type: 'relation', collectionId: packagingId, maxSelect: 999 },
        { name: 'tax_rule_id', type: 'relation', collectionId: taxRulesId, maxSelect: 1 },
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
      indexes: ['CREATE INDEX idx_final_products_user_id ON final_products (user_id)'],
    })
    app.save(finalProducts)

    const auditLogs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'action', type: 'text', required: true },
        { name: 'collection_name', type: 'text', required: true },
        { name: 'record_id', type: 'text' },
        { name: 'old_value', type: 'json' },
        { name: 'new_value', type: 'json' },
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
      indexes: ['CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id)'],
    })
    app.save(auditLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('final_products'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('tax_rules'))
    } catch (_) {}
  },
)

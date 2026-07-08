migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    var adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'djunior@techna.com.br')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('djunior@techna.com.br')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Admin')
      app.save(adminUser)
    }

    var calculations = app.findCollectionByNameOrId('calculations')

    var samples = [
      {
        product_name: 'Bolinho de Mandioca 300g',
        total_cost: 8.5,
        markup: 0.35,
        final_price: 15.9,
      },
      { product_name: 'Coxinha de Frango 500g', total_cost: 12.0, markup: 0.4, final_price: 22.5 },
      { product_name: 'Pastel de Queijo 1kg', total_cost: 18.0, markup: 0.3, final_price: 28.9 },
    ]

    for (var i = 0; i < samples.length; i++) {
      var s = samples[i]
      try {
        app.findFirstRecordByData('calculations', 'product_name', s.product_name)
      } catch (_) {
        var record = new Record(calculations)
        record.set('product_name', s.product_name)
        record.set('total_cost', s.total_cost)
        record.set('markup', s.markup)
        record.set('final_price', s.final_price)
        record.set('ingredients_list', '{"sample":true}')
        record.set('user_id', adminUser.id)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var record = app.findAuthRecordByEmail('_pb_users_auth_', 'djunior@techna.com.br')
      app.delete(record)
    } catch (_) {}
  },
)

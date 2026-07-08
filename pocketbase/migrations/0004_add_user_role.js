migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('role')) {
      users.fields.add(new TextField({ name: 'role' }))
    }

    users.listRule =
      "@request.auth.id != '' && (@request.auth.id = id || @request.auth.role = 'Admin')"
    users.viewRule =
      "@request.auth.id != '' && (@request.auth.id = id || @request.auth.role = 'Admin')"
    users.createRule = "@request.auth.id != '' && @request.auth.role = 'Admin'"
    users.updateRule =
      "@request.auth.id != '' && (@request.auth.id = id || @request.auth.role = 'Admin')"
    users.deleteRule = "@request.auth.id != '' && @request.auth.role = 'Admin'"

    app.save(users)

    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'djunior@techna.com.br')
      adminUser.set('role', 'Admin')
      app.save(adminUser)
    } catch (_) {}
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)

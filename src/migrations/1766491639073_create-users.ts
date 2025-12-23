const {MigrationBuilder} = require('node-pg-migrate')

export async function up(pgm: typeof MigrationBuilder): Promise<void> {
  // Create users table
  pgm.createTable("users", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    username: {
      type: "varchar(100)",
    },
    password: {
      type: "varchar(150)",
    },
    email: {
      type: "varchar(100)",
      unique: true,
    },
    created_by: {
      type: "timestamp",
      notNull: true,
    },
  });
}

export async function down(pgm:typeof MigrationBuilder): Promise<void> {
  // Drop users table
  pgm.dropTable("users");
}

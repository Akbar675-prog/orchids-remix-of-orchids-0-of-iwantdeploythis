import postgres from "postgres"

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.fwijwgpsdakpnnfvqkfg:ThIsIsEndPassDatabaseE2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

const sql = postgres(connectionString, {
  ssl: "require",
  max: 1,
})

export default sql

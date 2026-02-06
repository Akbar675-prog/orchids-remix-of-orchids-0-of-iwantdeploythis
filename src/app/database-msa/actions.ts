"use server"

import sql from "@/lib/db"

export async function executeQuery(query: string) {
  try {
    const result = await sql.unsafe(query)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Database query error:", error)
    return { success: false, error: error.message }
  }
}

export async function getTables() {
  try {
    const tables = await sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename ASC;
    `
    return { success: true, data: tables }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTableData(tableName: string) {
  try {
    const data = await sql.unsafe(`SELECT * FROM "${tableName}" LIMIT 100`)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTableInfo(tableName: string) {
  try {
    const info = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position ASC;
    `
    return { success: true, data: info }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

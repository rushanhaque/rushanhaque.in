import { getSqlClient } from "../lib/database";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function getDb() {
  return drizzle(getSqlClient(), { schema });
}

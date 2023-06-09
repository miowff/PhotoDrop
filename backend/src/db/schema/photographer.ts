import { varchar } from "drizzle-orm/mysql-core/columns";
import { mysqlTable } from "drizzle-orm/mysql-core/table";
import { persons } from "./person";

export const photographers = mysqlTable("Photographers", {
  personId: varchar("PersonId", { length: 70 })
    .references(() => persons.id)
    .notNull()
    .primaryKey(),
  login: varchar("Login", { length: 256 }).notNull(),
  passwordHash: varchar("PasswordHash", { length: 256 }).notNull(),
});

export interface Photographer {
  personId: string;
  login: string;
  passwordHash: string;
  email: string | null;
  fullName: string | null;
}

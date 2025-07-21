import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  documents: defineTable({
    title: v.string(),
    sharedWith: v.optional(v.array(v.id("users"))),
    createdBy: v.id("users"),
    lastModified: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["createdBy"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  users: authTables.users.searchIndex("search_name", {
    searchField: "name",
  }),
});

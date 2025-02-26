import { z } from "zod";

export const StringArray = z.object({
  array: z.array(z.string())
})

export const SearchIntent = z.object({
  type: z.union([
    z.literal("buy"),
    z.literal("know"),
    z.literal("do"),
    z.literal("go")
  ])
})
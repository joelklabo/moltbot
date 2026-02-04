import { Type } from "@sinclair/typebox";

export const DiagnosticsOtelTestParamsSchema = Type.Object(
  {
    label: Type.Optional(Type.String({ maxLength: 120 })),
  },
  { additionalProperties: false },
);

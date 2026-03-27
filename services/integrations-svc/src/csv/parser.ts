import { z } from "zod";

const csvRowSchema = z.object({
  student_id: z.string().min(1, "student_id is required"),
  first_name: z.string().min(1, "first_name is required"),
  last_name: z.string().min(1, "last_name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  grade: z.string().optional(),
  teacher_email: z.string().email("Invalid teacher email").optional().or(z.literal("")),
  classroom: z.string().optional(),
  parent_email: z.string().email("Invalid parent email").optional().or(z.literal("")),
  parent_name: z.string().optional(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export interface ParseResult {
  rows: CsvRow[];
  errors: Array<{ row: number; field: string; message: string }>;
  totalRows: number;
}

export class CsvParser {
  parse(csvContent: string): ParseResult {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return { rows: [], errors: [{ row: 0, field: "", message: "CSV must have a header row and at least one data row" }], totalRows: 0 };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const rows: CsvRow[] = [];
    const errors: Array<{ row: number; field: string; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const record: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = (values[j] ?? "").trim();
      }

      const result = csvRowSchema.safeParse(record);
      if (result.success) {
        rows.push(result.data);
      } else {
        for (const err of result.error.errors) {
          errors.push({ row: i + 1, field: err.path.join("."), message: err.message });
        }
      }
    }

    return { rows, errors, totalRows: lines.length - 1 };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  getTemplate(): string {
    return "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name\n";
  }
}

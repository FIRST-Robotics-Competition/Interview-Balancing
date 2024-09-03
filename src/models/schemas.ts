import { z } from "zod";

const ImpactExportCSVRowSchema = z.object({
  "Team Number": z.string(),
  "Lead Mentor 1 First Name": z.string(),
  "Lead Mentor 1 Last Name": z.string(),
  "Lead Mentor 1 Email": z.string().email(),
  "Lead Mentor 2 First Name": z.string(),
  "Lead Mentor 2 Last Name": z.string(),
  "Lead Mentor 2 Email": z.string().email(),
});

const ImpactExportCSVSchema = z.array(ImpactExportCSVRowSchema);

type ImpactExportCSVRow = z.infer<typeof ImpactExportCSVRowSchema>;
type ImpactExportCSV = z.infer<typeof ImpactExportCSVSchema>;

export type { ImpactExportCSVRow, ImpactExportCSV };
export { ImpactExportCSVRowSchema, ImpactExportCSVSchema };

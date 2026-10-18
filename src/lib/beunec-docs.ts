import fs from "fs";
import path from "path";

/** Read a markdown file from `Beunec Docs/`. Edit the .md, not React. */
export function readBeunecDoc(relativePath: string): string {
  const full = path.join(process.cwd(), "Beunec Docs", relativePath);
  return fs.readFileSync(full, "utf8");
}

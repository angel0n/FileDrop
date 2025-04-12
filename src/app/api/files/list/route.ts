import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "tmp", "uploads");

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir);

    const fileList = files.map((file) => {
      const filePath = path.join(uploadDir, file);
      const stat = fs.statSync(filePath);

      return {
        name: file,
        size: stat.size,
        type: path.extname(file).slice(1),
        lastModified: stat.mtime, // opcional
      };
    });

    return NextResponse.json({ files: fileList });
  } catch (err) {
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

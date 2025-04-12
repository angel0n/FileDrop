import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ message: "No files selected" }, { status: 400 });
  }

  const uploadDir = path.join("/tmp", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filesNames = await getFilesNames();

  const filesNamesFiltered = files.filter(file => !filesNames.includes(file.name));
  
  const uploadPromises = filesNamesFiltered.map(async (file) => {
    const filePath = path.join(uploadDir, file.name);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
  });

  await Promise.all(uploadPromises);

  return NextResponse.json({ message: "Files uploaded successfully" }, { status: 200 });
}

const getFilesNames = async (): Promise<string[]> => {
  const uploadDir = path.join("/tmp", "uploads");
  if (!fs.existsSync(uploadDir)) {
    return []
  }

 return fs.readdirSync(uploadDir);;
}

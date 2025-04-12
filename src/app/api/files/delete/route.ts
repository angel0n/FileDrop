import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
        return NextResponse.json({ message: "File name is required" }, { status: 400 });
    }

    const uploadDir = path.join("/tmp", "uploads");

    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ message: "File deleted" }, { status: 200 });
}
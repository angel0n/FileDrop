import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
        return NextResponse.json({ message: "File name is required" }, { status: 400 });
    }

    const uploadDir = path.join("tmp", "uploads");

    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const file = fs.readFileSync(filePath);

    return new Response(file, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${fileName}"`,
        },
    });
}
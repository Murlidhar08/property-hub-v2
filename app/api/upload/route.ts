import { getUserSession } from "@/lib/auth/auth";
import { uploadFile } from "@/lib/file-operations";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
    const session = await getUserSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const propertyId = (formData.get("propertyId") as string) || "temp"; // User 'temp' for new properties

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const uploadedFiles = [];
        for (const file of files) {
            const destinationDir = path.join("property", propertyId).replace(/\\/g, "/");
            const extension = path.extname(file.name).toLowerCase();
            const fileName = `${Date.now()}${extension}`;
            const relativePath = await uploadFile(file, destinationDir, fileName);
            uploadedFiles.push({
                fileName: file.name,
                relativePath: relativePath,
                extension: path.extname(file.name).toLowerCase(),
            });
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
    }
}

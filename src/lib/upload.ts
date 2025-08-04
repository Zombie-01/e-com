import { writeFile } from "fs/promises";
import path from "path";

export async function uploadFileToPublicUploads(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const safeFileName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const fileName = `${Date.now()}-${safeFileName}`;
    const uploadFolder = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadFolder, fileName);

    // Ensure the uploads folder exists (optional but recommended)
    // You can import and use fs.mkdir here if you want

    await writeFile(filePath, uint8Array);

    console.log(`File saved successfully: ${filePath}`);

    return {
      success: true,
      fileName,
      filePath,
      urlPath: `/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

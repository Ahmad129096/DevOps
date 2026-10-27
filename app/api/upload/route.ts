import { randomUUID } from "node:crypto";
import AWS from "aws-sdk";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
    console.error("S3 upload is missing one or more required environment variables.");
    return Response.json(
      { error: "The upload service is not configured." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "The request must contain multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  if (file.size === 0) {
    return Response.json({ error: "The selected file is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "The file must be 10 MB or smaller." },
      { status: 413 },
    );
  }

  const safeFileName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "upload";
  const key = `uploads/${randomUUID()}-${safeFileName}`;
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    region,
  });

  try {
    await s3
      .upload({
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      })
      .promise();
  } catch (uploadError) {
    console.error("S3 file upload failed.", uploadError);
    return Response.json(
      { error: "The file could not be uploaded. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ key, fileName: file.name }, { status: 201 });
}

import { randomUUID } from "node:crypto";
import AWS from "aws-sdk";

const TABLE_NAME = "contact";
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

function isContactRequest(value: unknown): value is ContactRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.message === "string"
  );
}

export async function POST(request: Request) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    console.error(
      "DynamoDB contact submission is missing AWS credentials or region.",
    );
    return Response.json(
      { error: "The contact service is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "The request must contain valid JSON." },
      { status: 400 },
    );
  }

  if (!isContactRequest(body)) {
    return Response.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  if (!name || name.length > MAX_NAME_LENGTH) {
    return Response.json(
      { error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters.` },
      { status: 400 },
    );
  }

  if (
    email.length > MAX_EMAIL_LENGTH ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const dynamoDb = new AWS.DynamoDB.DocumentClient({
    accessKeyId,
    secretAccessKey,
    region,
  });

  try {
    await dynamoDb
      .put({
        TableName: TABLE_NAME,
        Item: {
          id: randomUUID(),
          name,
          email,
          message,
          createdAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(id)",
      })
      .promise();
  } catch (saveError) {
    console.error("DynamoDB contact submission failed.", saveError);
    return Response.json(
      { error: "Your message could not be saved. Please try again." },
      { status: 502 },
    );
  }

  return Response.json(
    { message: "Your message was saved successfully." },
    { status: 201 },
  );
}

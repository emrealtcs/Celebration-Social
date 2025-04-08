import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) return NextResponse.json({ error: "Missing event ID" }, { status: 400 });

  try {
    const eventRef = db.ref(`events/${id}`);
    const snapshot = await eventRef.once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(snapshot.val(), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

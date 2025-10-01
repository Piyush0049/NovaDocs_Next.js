import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    // Connect to DB
    await connectToDatabase();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: payload.name,
        email: payload.email,
        image: payload.picture,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      // Link existing user
      user.googleId = payload.sub;
      user.image = user.image || payload.picture;
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    // Set token in HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, image: user.image },
    });

    response.cookies.set({
      name: "token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

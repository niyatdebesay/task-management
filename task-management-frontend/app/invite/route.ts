import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Decode the JWT token to check if user is signed
    const payload = JSON.parse(atob(token.split(".")[1]))
    const isSigned = payload.isSigned

    if (isSigned) {
      // User already has an account, redirect to login
      return NextResponse.redirect(new URL(`/login?token=${token}`, request.url))
    } else {
      // User needs to register, redirect to register
      return NextResponse.redirect(new URL(`/register?token=${token}`, request.url))
    }
  } catch (error) {
    console.error("Failed to decode invite token:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const frontendURL = process.env.NEXT_FRONTEND_URL

  if (!token || !frontendURL) {
    return NextResponse.redirect(`${frontendURL || ""}/login`)
  }

  try {
    const base64 = token.split(".")[1]
    const decoded = Buffer.from(base64, "base64").toString("utf-8")
    const payload = JSON.parse(decoded)
    const isSigned = payload.isSigned

    if (isSigned) {
      return NextResponse.redirect(`${frontendURL}/login?token=${token}`)
    } else {
      return NextResponse.redirect(`${frontendURL}/register?token=${token}`)
    }
  } catch (error) {
    console.error("Failed to decode invite token:", error)
    return NextResponse.redirect(`${frontendURL}/login`)
  }
}

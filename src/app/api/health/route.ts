import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Lightweight check — query the auth health endpoint
    const { error } = await supabase.auth.getSession();

    if (error) {
      return Response.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

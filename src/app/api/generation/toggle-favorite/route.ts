import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { generationId, isFavorite } = await request.json();

  if (!generationId) {
    return Response.json(
      { error: "Falta el ID de generación" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("generations")
      .update({ is_favorite: isFavorite })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Error al actualizar favorito" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

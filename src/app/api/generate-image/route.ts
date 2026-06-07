import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    let body: { generationId?: string; title?: string; content?: string; category?: string; game_system?: string | null };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
    }

    const { generationId, title, content, category, game_system } = body;
    if (!generationId || !content) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const pollinationsKey = process.env.POLLINATIONS_API_KEY;
    if (!pollinationsKey) {
      console.error("POLLINATIONS_API_KEY no configurada");
      return NextResponse.json(
        { error: "Servicio de imágenes no configurado. Contacta al administrador." },
        { status: 503 },
      );
    }

    // Generar prompt visual con Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let imagePrompt = title ?? "RPG scene";

    const systemContext = game_system
      ? `You are a specialist in image generation prompts for ${game_system} tabletop RPG art. The visual style should match the aesthetic, setting, and tone of ${game_system}.`
      : "You are a specialist in image generation prompts for tabletop RPG art.";

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `${systemContext} Generate ONE prompt in English, 1-2 sentences, visually describing the following RPG content for an illustration. Return ONLY the prompt, no explanations.`,
          },
          {
            role: "user",
            content: `Category: ${category}\nTitle: ${title}\n\n${content.substring(0, 800)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 120,
      });
      imagePrompt = completion.choices[0]?.message?.content?.trim() ?? imagePrompt;
    } catch (groqErr) {
      // Si Groq falla, usamos el título como fallback — la imagen igualmente se genera
      console.warn("Groq falló al generar el prompt de imagen, usando fallback:", (groqErr as Error).message);
      imagePrompt = game_system
        ? `${game_system} RPG ${category}: ${title}`
        : `RPG ${category}: ${title}`;
    }

    // Construir URL de Pollinations
    const stylePrefix = game_system ? `${game_system} RPG art,` : "tabletop RPG art,";
    const fullPrompt = `${stylePrefix} ${imagePrompt}, detailed, dramatic lighting, digital painting`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=768&height=512&nologo=true&model=flux&key=${pollinationsKey}`;

    // Guardar en Supabase
    const { error: dbError } = await supabase
      .from("generations")
      .update({ image_url: imageUrl })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Error guardando image_url en Supabase:", dbError);
      return NextResponse.json(
        { error: "Error al guardar la imagen en la base de datos" },
        { status: 500 },
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Error inesperado en generate-image:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

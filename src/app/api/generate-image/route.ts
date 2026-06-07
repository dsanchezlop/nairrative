import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { generationId, title, content, category, game_system } =
    await request.json();
  if (!generationId || !content) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Generar prompt visual con Groq
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  let imagePrompt = title;

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
    imagePrompt = completion.choices[0]?.message?.content?.trim() ?? title;
  } catch {
    imagePrompt = game_system
      ? `${game_system} RPG ${category}: ${title}`
      : `RPG ${category}: ${title}`;
  }

  // Construir URL de Pollinations
  const stylePrefix = game_system
    ? `${game_system} RPG art,`
    : "tabletop RPG art,";
  const fullPrompt = `${stylePrefix} ${imagePrompt}, detailed, dramatic lighting, digital painting`;
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=512&nologo=true&model=flux`;

  // Guardar en Supabase directamente — Pollinations genera la imagen bajo demanda al cargarla
  const { error } = await supabase
    .from("generations")
    .update({ image_url: imageUrl })
    .eq("id", generationId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Error al guardar la imagen" },
      { status: 500 },
    );
  }

  return NextResponse.json({ imageUrl });
}

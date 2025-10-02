import { NextRequest } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API] Received request:", JSON.stringify(body, null, 2));

    const { messages = [] } = body;

    if (!messages || messages.length === 0) {
      console.error("[API] No messages provided");
      return new Response("No messages provided", { status: 400 });
    }

    console.log("[API] Starting streamText with model: gemini-2.0-flash-exp");
    console.log("[API] Messages count:", messages.length);

    // Convert UIMessage[] to ModelMessage[]
    const modelMessages = convertToModelMessages(messages);
    console.log("[API] Converted to model messages:", JSON.stringify(modelMessages, null, 2));

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages: modelMessages,
      onFinish: (event) => {
        console.log("[API] Stream finished:", {
          finishReason: event.finishReason,
          usage: event.usage,
          text: event.text?.substring(0, 100) + "...",
        });
      },
      onError: (error) => {
        console.error("[API] Stream error:", error);
      },
    });

    console.log("[API] Returning stream response");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[API] Route error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

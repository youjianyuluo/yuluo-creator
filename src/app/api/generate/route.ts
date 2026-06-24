import { NextRequest } from "next/server";
import { platformPrompts } from "@/lib/prompts";
import { generateText, generateTextStream } from "@/lib/deepseek";
import { validateContent } from "@/lib/validator";

export async function POST(request: NextRequest) {
  try {
    const { idea, platform, stream = false } = await request.json();

    if (!idea || !platform) {
      return Response.json(
        { error: "缺少参数 idea 或 platform" },
        { status: 400 }
      );
    }

    const promptConfig = platformPrompts[platform];
    if (!promptConfig) {
      return Response.json(
        { error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    if (stream) {
      // 流式输出
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            const generator = generateTextStream(
              promptConfig.systemPrompt,
              promptConfig.userPromptTemplate(idea)
            );

            for await (const chunk of generator) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            }

            // 完成后发送验证结果
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
            );
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "生成失败，请稍后重试" })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 非流式输出
    const content = await generateText(
      promptConfig.systemPrompt,
      promptConfig.userPromptTemplate(idea)
    );

    const validation = validateContent(platform, content);

    return Response.json({
      content,
      platform,
      warnings: validation.warnings,
    });
  } catch (error: unknown) {
    console.error("生成失败:", error);
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后重试";
    return Response.json({ error: message }, { status: 500 });
  }
}

// 批量生成：一次生成所有选中平台的文案
export async function PUT(request: NextRequest) {
  try {
    const { idea, platforms } = await request.json();

    if (!idea || !platforms || !Array.isArray(platforms)) {
      return Response.json(
        { error: "缺少参数 idea 或 platforms" },
        { status: 400 }
      );
    }

    const results: Record<
      string,
      { content: string; warnings: string[] } | { error: string }
    > = {};

    // 并行生成所有平台文案
    const promises = platforms.map(async (platform: string) => {
      const promptConfig = platformPrompts[platform];
      if (!promptConfig) {
        results[platform] = { error: `不支持的平台: ${platform}` };
        return;
      }

      try {
        const content = await generateText(
          promptConfig.systemPrompt,
          promptConfig.userPromptTemplate(idea)
        );
        const validation = validateContent(platform, content);
        results[platform] = {
          content,
          warnings: validation.warnings,
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "生成失败";
        results[platform] = { error: message };
      }
    });

    await Promise.all(promises);

    return Response.json({ idea, results });
  } catch (error: unknown) {
    console.error("批量生成失败:", error);
    const message =
      error instanceof Error ? error.message : "批量生成失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

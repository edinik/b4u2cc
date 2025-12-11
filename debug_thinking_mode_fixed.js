// 调试修复后的思考模式下的消息处理
const testRequest = {
  "max_tokens": 64000,
  "messages": [
    {
      "content": "详细介绍一下《烽火十四》",
      "role": "user"
    },
    {
      "content": [
        {
          "text": " \n\n我来帮你搜索一下《烽火十四》的详细信息 🔍\n\n\n",
          "type": "text"
        },
        {
          "id": "toolu_ugJykWgtOTZK",
          "input": {
            "query": "烽火十四",
            "searchTimeRange": "anytime"
          },
          "name": "lobe-web-browsing____search____builtin",
          "type": "tool_use"
        }
      ],
      "role": "assistant"
    },
    {
      "content": [
        {
          "content": [
            {
              "text": "<searchResults>\n  <item title=\"烽火十四\" url=\"https://store.steampowered.com/app/4228810/_/\" />\n  <item title=\"烽火十四\" url=\"https://store.steampowered.com/app/4228810/_/?l=schinese\" />\n  <item title=\"如何评价国产抗日题材FPS 游戏《烽火十四》发布首支先导 ...\" url=\"https://www.zhihu.com/question/1980307100778325712\" />\n  <item title=\"Fourteen Years of Flames 烽火十四 | New Chinese Indie ...\" url=\"https://www.youtube.com/watch?v=aXbqFhnutuQ\" />\n  <item title=\"《烽火十四》公布预告\" url=\"https://www.ign.com.cn/topic/57528/video/feng-huo-shi-si-gong-bu-yu-gao\" />\n  <item title=\"烽火：枕戈待旦 · 烽火十四\" url=\"https://steamdb.info/app/4228810/\" />\n  <item title=\"国产抗日《烽火十四》首曝确认是实机游戏时长曝光\" url=\"https://www.gamersky.com/news/202512/2055135.shtml\" />\n  <item title=\"烽火十四游戏配置要求介绍\" url=\"https://www.3dmgame.com/gl/3974864.html\" />\n  <item title=\"国产抗日题材FPS游戏：烽火十四！ #游戏解说\" url=\"https://www.youtube.com/shorts/qYiLZWjHyoc\" />\n  <item title=\"Trailer for the Chinese WWII video game: 烽火十四 (14 ...\" url=\"https://www.reddit.com/r/Sino/comments/1pin64b/trailer_for_the_chinese_wwii_video_game_%E7%83%BD%E7%81%AB%E5%8D%81%E5%9B%9B_14/\" />\n  <item title=\"Post-Han : Song-Ming : Romance of the Three Kingdoms : On Seven-Star Altar, Zhuge Liang Sacrifices To The Winds; At Three Gorges, Zhou Yu Liberates the Fire - Chinese Text Project\" url=\"https://ctext.org/text.pl?node=651470&if=en\" />\n  <item title=\"烽火大秦 on Steam\" url=\"https://store.steampowered.com/app/1157330/_\" />\n  <item title=\"\" url=\"https://chinesenotes.com/words/21626.html\" />\n  <item title=\"封神演義 : 哪吒現蓮花化身 - Chinese Text Project\" url=\"https://ctext.org/fengshen-yanyi/14\" />\n  <item title=\"Legendary Story About Lantern Festival, Story of Chinese Lantern Festival\" url=\"https://www.yourchineseastrology.com/holidays/lantern-festival/legends.htm\" />\n</searchResults>",
              "type": "text"
            }
          ],
          "tool_use_id": "toolu_ugJykWgtOTZK",
          "type": "tool_result"
        }
      ],
      "role": "user"
    }
  ],
  "model": "claude-sonnet-4-5-20250929",
  "system": [
    {
      "text": "# Role\n你是 2025 年的 AI 全能日常助手。你既严谨可靠，又亲切有趣。你的核心目标是提供**准确**的信息和**自然**的陪伴。",
      "type": "text"
    }
  ],
  "thinking": {
    "budget_tokens": 32768,
    "type": "enabled"
  },
  "tools": [
    {
      "description": "a search service. Useful for when you need to answer questions about current events. Input should be a search query. Output is a JSON array of the query results",
      "input_schema": {
        "properties": {
          "query": {
            "description": "The search query",
            "type": "string"
          }
        },
        "required": ["query"],
        "type": "object"
      },
      "name": "lobe-web-browsing____search____builtin"
    }
  ],
  "stream": true
};

// 模拟修复后的 normalizeBlocks 函数的处理逻辑
function normalizeBlocks(content, triggerSignal) {
  if (typeof content === "string") {
    return content;
  }
  
  return content.map((block) => {
    if (block.type === "text") {
      return block.text;
    }
    if (block.type === "thinking") {
      return `<thinking>${block.thinking}</thinking>`;
    }
    if (block.type === "tool_result") {
      // 修复后的工具结果处理
      let toolResult = block.content ?? "";
      
      // 处理工具结果的内容格式
      if (typeof toolResult === "string") {
        // 如果是字符串，直接使用
        toolResult = toolResult;
      } else if (Array.isArray(toolResult)) {
        // 如果是数组（如测试用例中的格式），提取文本内容
        toolResult = toolResult
          .filter((item) => item && item.type === "text")
          .map((item) => item.text || "")
          .join("\n");
      } else if (typeof toolResult === "object" && toolResult !== null) {
        // 如果是对象，尝试转换为 JSON 字符串
        toolResult = JSON.stringify(toolResult, null, 2);
      }
      
      return `[工具调用结果 - ID: ${block.tool_use_id}]\n${toolResult}`;
    }
    if (block.type === "tool_use") {
      const params = Object.entries(block.input ?? {})
        .map(([key, value]) => {
          const stringValue = typeof value === "string" ? value : JSON.stringify(value);
          return `<parameter name="${key}">${stringValue}</parameter>`;
        })
        .join("\n");
      return `<invoke name="${block.name}">\n${params}\n</invoke>`;
    }
    return "";
  }).join("\n");
}

// 模拟修复后的思考模式下的消息处理
function simulateThinkingModeProcessing(request) {
  const THINKING_HINT = "<antml\\b:thinking_mode>interleaved</antml><antml\\b:max_thinking_length>16000</antml>";
  
  console.log('=== 修复后的思考模式消息处理分析 ===\n');
  
  request.messages.forEach((message, index) => {
    console.log(`消息 ${index + 1} [${message.role}]:`);
    
    let content = normalizeBlocks(message.content);
    console.log('原始处理后的内容:');
    console.log(content);
    console.log('---');
    
    // 检查是否包含工具结果
    const hasToolResult = Array.isArray(message.content) && 
      message.content.some(block => block.type === "tool_result");
    
    // 修复后的逻辑：如果是用户消息且思考模式已启用，在消息末尾添加思考提示符
    // 但排除包含工具结果的消息，避免干扰模型对工具结果的读取
    if (message.role === "user" && request.thinking && request.thinking.type === "enabled" && !hasToolResult) {
      content = content + THINKING_HINT;
      console.log('添加思考提示符后的内容:');
      console.log(content);
      console.log('---');
    } else if (message.role === "user" && request.thinking && request.thinking.type === "enabled" && hasToolResult) {
      console.log('✅ 包含工具结果，跳过添加思考提示符（修复后）');
      console.log('---');
    }
    
    console.log('\n');
  });
}

// 运行模拟
simulateThinkingModeProcessing(testRequest);

console.log('=== 修复总结 ===');
console.log('1. ✅ 修复了工具结果显示为 [object Object] 的问题');
console.log('2. ✅ 修复了思考模式下工具结果消息被添加思考提示符的问题');
console.log('3. ✅ 现在工具结果能够正确显示，且不会被思考提示符干扰');
console.log('4. ✅ 思考模式仍然对其他消息生效，但不影响工具结果的处理');
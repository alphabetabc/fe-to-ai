import readline from 'readline';
import { MCPClient, OpenAIAdapter } from './client';

const client = new MCPClient({
    servers: ['http://localhost:3000'],
    maxRetries: 2,
});

const openAI = new OpenAIAdapter();

// 定义可用工具
const availableTools = [
    {
        name: 'get_weather',
        description: 'Get current weather for a city',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'City name' },
            },
            required: ['city'],
        },
    },
];

// 控制台交互
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function processInput(input: string) {
    try {
        // 步骤1: 调用 OpenAI 生成工具调用请求
        const message = await openAI.generate(input, availableTools);

        // console.log('log-----AI 回答:', message);

        // 步骤2: 检查是否需要工具调用
        if (message.tool_calls && message.tool_calls.length > 0) {
            try {
                const toolCall = message.tool_calls[0]; // 假设我们只处理第一个工具调用
                const funcName = toolCall.function.name;
                const params = JSON.parse(toolCall.function.arguments);
                // console.log('log-----toolCall:', { params, funcName });

                // 步骤3: 通过 MCP Client 执行实际调用
                const result = await client.callTools(funcName, params);

                // 步骤4: 生成最终响应
                const finalResponse = await openAI.generate(`工具调用结果: ${JSON.stringify(result)}\n原始问题: ${input}`, availableTools);
                return finalResponse.content;
            } catch (error: any) {
                return `Error parsing tool call arguments: ${error.message}`;
            }
        }

        return message.content;
    } catch (error: any) {
        return `Error: ${error.message}`;
    }
}

rl.question('你的问题: ', async (input) => {
    const answer = await processInput(input);
    console.log('AI 回答:', answer);
    rl.close();
});

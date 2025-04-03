import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

const server = new McpServer({
    name: 'webSearch',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {},
    },
});

server.tool('webSearch', 'webSearch', { input: z.string() }, async (state) => {
    const input = state.input;
    /**
     * 搜索互联网内容
     *
     * @param query - 要搜索的内容
     * @returns 搜索结果的总结
     */
    try {
        // 创建一个 axios 实例并发送 POST 请求
        const response = await axios.post(
            process.env.ZHI_PU_QING_YAN_BASE_URL as string,
            {
                tool: process.env.ZHI_PU_QING_YAN_TOOL as string,
                messages: [{ role: 'user', content: input }],
                stream: false,
            },
            {
                headers: {
                    Authorization: process.env.ZHI_PU_QING_YAN_KEY,
                },
            }
        );

        const resData: string[] = [];
        // 遍历响应数据中的每个选择
        for (const choice of response.data.choices) {
            // 遍历每个选择中的消息
            for (const message of choice.message.tool_calls) {
                // 获取搜索结果
                const searchResults = message.search_result;
                // 如果搜索结果为空，则跳过当前循环
                if (!searchResults) {
                    continue;
                }
                // 遍历每个搜索结果
                for (const result of searchResults) {
                    // 将搜索结果的内容添加到 resData 数组中
                    resData.push(result.content);
                }
            }
        }

        // 返回的结果是有格式的，这和python的返回不一样
        return {
            content: [
                {
                    type: 'text',
                    text: resData.join('\n\n\n'),
                },
            ],
        };
    } catch (error: any) {
        return {
            content: [
                {
                    type: 'text',
                    text: error.message,
                },
            ],
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Weather MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});

import { McpServer as Server } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import z from 'zod';

const serverApp = new Server(
    { name: 'file_server', version: '0.0.1' },
    {
        capabilities: {
            prompts: {},
            resources: {},
            tools: {},
        },
    }
);

serverApp.tool('deleteFile', 'deleteFile', { input: z.string() }, async (request) => {
    try {
        //
        const result = await serverApp.server.createMessage({
            method: 'createMessage/sampling',
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `是否删除文件？(y/n):`,
                    },
                },
            ],
            maxTokens: 0,
        });

        if (result.content.text === 'y') {
            // 删除文件逻辑
            return {
                content: [
                    {
                        type: 'text',
                        text: '文件已经删除（File deleted）',
                        status: 'success',
                    },
                ],
            };
        } else {
            return {
                content: [
                    {
                        type: 'text',
                        text: '文件没有删除（File not deleted）',
                        status: 'fail',
                    },
                ],
            };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: '文件删除失败（File deletion failed）',
                    status: 'error',
                },
            ],
        };
    }
});

const main = async () => {
    const transport = new StdioServerTransport();
    await serverApp.connect(transport);
};

main();

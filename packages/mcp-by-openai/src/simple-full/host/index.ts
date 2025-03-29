import { OpenAI } from 'openai';
import readline from 'node:readline';

import { MCPClient } from '../client';

const config = {
    apiKey: process.env.ALI_TONGYI_API_KEY,
    baseURL: process.env.ALI_TONGYI_BASE_URL,
    model: process.env.ALI_TONGYI_MODEL as string,
};

class MCPHost {
    openai: OpenAI;
    rl: readline.Interface;
    client: MCPClient;
    constructor() {
        this.openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
        });

        this.client = new MCPClient({
            file: 'http://localhost:3001',
            weather: 'http://localhost:3002',
        });

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    tools = [
        {
            type: 'function' as const,
            function: {
                name: 'read_file',
                parameters: {
                    path: {
                        type: 'string',
                        description: '文件路径',
                    },
                },
                required: ['path'],
            } as any,
        },

        {
            type: 'function' as const,
            function: {
                name: 'list_dir',
                parameters: {
                    path: {
                        type: 'string',
                        description: '目录路径',
                    },
                },
                required: ['path'],
            } as any,
        },

        {
            type: 'function' as const,
            function: {
                name: 'get_weather',
                parameters: {
                    city: {
                        type: 'string',
                        description: '城市名',
                    },
                },
                required: ['city'],
            } as any,
        },
    ];

    processQuery = async (query: string) => {
        // 第一步：检测工具
        const tools = await this.detectTools(query);

        // 第二步：并行调用工具
        const toolResults = {} as any;
        for (const { serverType, toolName, params } of tools) {
            toolResults[toolName] = await this.client.callTools(serverType, toolName, params);
        }

        // 第三步：生成最终响应
        return this.generateFinalResponse(query, toolResults);
    };

    detectTools = async (query: string) => {
        const response = await this.openai.chat.completions.create({
            model: config.model,
            messages: [
                {
                    role: 'user',
                    content: `
                        分析用户问题"${query}"需要调用哪些工具？可选工具：
                        1. read_file - 读取文件
                        2. list_dir - 列出目录
                        3. get_weather - 查询天气
                        返回JSON数组，格式：[{serverType: "file|weather", toolName: string, params: object}]
                    `,
                },
            ],
            temperature: 0,
            tools: this.tools,
            tool_choice: 'auto',
        });

        return JSON.parse(response.choices[0].message.content as any);
    };

    generateFinalResponse = async (query: any, toolResults: any) => {
        // 使用 OpenAI 生成友好响应
        const response = await this.openai.chat.completions.create({
            model: config.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        //
                        `基于以下数据回答用户问题：\n`,
                        `用户问题：${query}\n`,
                        `工具结果：${JSON.stringify(toolResults)}`,
                    ].join(''),
                },
            ],
            tools: this.tools,
            // tool_choice: 'auto',
        });

        // console.log('log----------------------------2', response.choices[0].message.content);

        return response.choices[0].message.content;
    };

    start() {
        this.rl.question('> 请输入问题：', async (query) => {
            let err = null;

            try {
                if (query.toLowerCase() === 'exit') {
                    console.log('');
                    console.log('~~~ 用户退出 ~~~');
                    process.exit(0);
                }

                const answer = await this.processQuery(query);
                console.log('AI 回答：', answer);

                this.start();
            } catch (error: any) {
                err = error;
                console.error('处理出错：', error.message);
            } finally {
                if (err) {
                    this.rl.close();
                }
            }
        });
    }
}

export {
    //
    MCPHost,
};

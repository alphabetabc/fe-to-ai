import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const transport = new StdioClientTransport({
    command: 'pnpm start-mcp-server-sampling-del-file',
    args: [],
});
const client = new Client(
    {
        name: 'example-client',
        version: '1.0.0',
    },
    {
        capabilities: {
            // 服务端如果使用了sampling，这里也需要使用sampling
            sampling: {},
        },
    }
);

/**
 * 接收服务端的消息 createMessage/sampling 请求，返回一个 Promise，用于返回服务端的响应
 */
client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
    const {
        params: { messages },
    } = request;
    return new Promise((resolve) => {
        rl.question(`${messages[0].content.text}`, (answer) => {
            // 这里格式有严格要求
            resolve({ model: '', role: 'user', content: { type: 'text', text: answer } });
        });
    });
});

const main = async () => {
    await client.connect(transport);

    const tools = await client.listTools();
    console.log('[log----tools]', tools);

    // 等待用户输入文件路径
    const input = await new Promise<string>((resolve) => {
        rl.question('请输入文件路径：', (answer) => {
            resolve(answer);
        });
    });

    const response = await client.callTool({ name: 'deleteFile', arguments: { input } });

    // @ts-ignore
    const result = response.content[0];
    if (result.status === 'success') {
        console.log(result.text);
        process.exit(0);
    } else {
        console.error('[文件删除异常：]', result.text);
        process.exit(1);
    }
};

main();

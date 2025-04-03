import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const main = async () => {
    const mcp = new Client({ name: 'mcp-simple-client', version: '0.0.1' });

    // 通常用于实现基于标准输入输出（stdin/stdout）的客户端与服务器之间的通信
    const transport = new StdioClientTransport({
        // 这块直接调用了我的命令行，实际就是动态传入命令以及参数，启动服务
        command: 'pnpm start-mcp-server',
        args: [],
    });

    await mcp.connect(transport);

    const listTools = await mcp.listTools();
    const tools = listTools.tools.map((tool) => {
        return { name: tool.name, description: tool.description };
    });

    console.log('Available tools:', tools);

    const response = await mcp.callTool({ name: 'webSearch', arguments: { input: '北京天气' } });

    console.log('Response:', response);
};

main();

# 客户端
import asyncio

from mcp.client.stdio import stdio_client
from mcp import ClientSession, StdioServerParameters
from mcp.shared.context import RequestContext
from mcp.types import (
    TextContent,
    CreateMessageRequestParams,
    CreateMessageResult,
)

server_params = StdioServerParameters(
    command='python',
    args=["mcp-server-sampling-del-file.py"],
)


async def sampling_callback(
        context: RequestContext[ClientSession, None],
        params: CreateMessageRequestParams,
):
    # 获取工具发送的消息并显示给用户
    input_message = input(params.messages[0].content.text)
    # 将用户输入发送回工具
    return CreateMessageResult(
        role='user',
        content=TextContent(
            type='text',
            text=input_message.strip().upper() or 'Y'
        ),
        model='user-input',
        stopReason='endTurn'
    )


async def main():
    async with stdio_client(server_params) as (stdio, write):
        async with ClientSession(
                stdio, write,
                # 设置 sampling_callback 对应的方法
                sampling_callback=sampling_callback
        ) as session:
            await session.initialize()
            res = await session.call_tool(
                'delete_file',
                {'file_path': 'F:/xxx.txt'}
            )
            # 获取工具最后执行完的返回结果
            print(res)


if __name__ == '__main__':
    asyncio.run(main())

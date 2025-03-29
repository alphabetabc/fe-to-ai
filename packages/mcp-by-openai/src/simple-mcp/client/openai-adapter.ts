import { OpenAI } from 'openai';

const config = {
    apiKey: process.env.ALI_TONGYI_API_KEY,
    baseURL: process.env.ALI_TONGYI_BASE_URL,
    model: process.env.ALI_TONGYI_MODEL as string,
};

class OpenAIAdapter {
    openai: OpenAI;
    constructor() {
        this.openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
        });
    }

    async generate(prompt: any, tools: any[]) {
        const messages: any = [
            {
                role: 'user',
                content: prompt,
            },
        ];

        // 转换为 OpenAI 的 function calling 格式
        const functions = tools.map((tool) => ({
            type: 'function' as const,
            function: {
                name: tool.name as string,
                description: tool.description as any,
                parameters: tool.parameters as any,
            } as any,
        }));

        try {
            const response = await this.openai.chat.completions.create({
                model: config.model,
                messages,
                tools: functions,
                tool_choice: 'auto',
                // function_call: 'auto',
            });

            return response.choices[0].message;
        } catch (error) {
            console.error('log-----------------Error:', error);
            return { content: 'error--666' } as any;
        }
    }
}

export {
    //
    OpenAIAdapter,
};

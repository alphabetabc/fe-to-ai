import axios from 'axios';

class MCPClient {
    servers: any;
    maxRetries: number;
    constructor(config: { servers: any; maxRetries?: number }) {
        this.servers = config.servers;
        this.maxRetries = config.maxRetries || 3;
    }

    callTools = async (toolName: string, params: any) => {
        let lastError: any = null;

        for (let i = 0; i < this.maxRetries; i++) {
            for (let serverUrl of this.servers) {
                try {
                    const response = await axios.post(`${serverUrl}/tools/${toolName}`, params, { timeout: 5000 });

                    if (response.data.error) {
                        console.error(`[Error calling ${toolName} on ${serverUrl}]:`, response.data.error);
                        throw new Error(response.data.error.message);
                    }

                    return response.data.result;
                } catch (error) {
                    lastError = error;
                    console.error(`Error calling ${toolName} on ${serverUrl}:`, error);
                }
            }
        }

        throw lastError;
    };
}

export {
    //
    MCPClient,
};

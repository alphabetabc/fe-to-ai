import axios from 'axios';

class MCPClient {
    constructor(private servers: { [x: string]: any }, private maxRetries?: number) {
        // { file: 'http://localhost:3001', weather: 'http://localhost:3002' }
        this.servers = servers;
    }

    callTools = async (serverType: string | number, toolName: any, params: any) => {
        const baseUrl = this.servers[serverType];
        if (!baseUrl) {
            throw new Error(`Invalid server type: ${serverType}`);
        }

        try {
            const response = await axios.post(`${baseUrl}/tools/${toolName}`, params, { timeout: 5000 });
            return response.data.result;
        } catch (error: any) {
            throw new Error(`Error calling ${toolName} on ${baseUrl}: ${error.message}`);
        }
    };
}

export {
    //
    MCPClient,
};

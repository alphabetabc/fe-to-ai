import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

serve({
    fetch: app.fetch,
    port: 3001,
});

app.post('/tools/read_file', async (c) => {
    const { path }: { path: string } = await c.req.json();

    try {
        const content = await readFile(path, 'utf-8');
        return c.json({ result: content });
    } catch (error) {
        c.status(500);
        return c.json({
            error: { code: 'FILE_READ_ERROR', message: `Failed to read file: ${error}` },
        });
    }
});

app.post('/tools/list_dir', async (c) => {
    const { path }: { path: string } = await c.req.json();

    try {
        const fullPath = join(process.cwd(), `${path}`);
        const files = await readdir(fullPath, { recursive: true });
        return c.json({ result: files });
    } catch (error) {
        // console.log('log--------------------list_dir', error);
        c.status(500);
        return c.json({
            error: { code: 'DIR_LIST_ERROR', message: `Failed to list directory: ${error}` },
        });
    }
});

console.log('Weather Server running on port 3001');

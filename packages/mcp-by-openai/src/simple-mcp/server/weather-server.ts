import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// 天气数据存储
const weatherDB: any = {
    北京: { temp: 22, condition: 'Sunny' },
    上海: { temp: 25, condition: 'Cloudy' },
};

app.get('/json', async (c) => {
    return c.json({ ok: true });
});

// 暴露天气查询工具
app.post('/tools/get_weather', async (c) => {
    const { city }: { city: string } = await c.req.json();
    if (!weatherDB[city]) {
        c.status(404);
        return c.json({
            error: { code: 'CITY_NOT_FOUND', message: `No data for ${city}` },
        });
    }
    return c.json({ result: weatherDB[city] });
});

serve({
    fetch: app.fetch,
    port: 3000,
});

console.log('Weather Server running on port 3000');

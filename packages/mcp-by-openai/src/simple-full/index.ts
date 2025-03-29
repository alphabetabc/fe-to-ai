import { MCPHost } from './host';

// 启动服务
console.log('');
console.log('=====================================');
require('./server/file-server');
require('./server/weather-server');
console.log('=====================================');
console.log('');

// 启动宿主程序
const host = new MCPHost();

host.start();

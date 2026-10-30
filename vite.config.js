import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{main:resolve('index.html'),company:resolve('company/index.html'),recruit:resolve('recruit/index.html'),admin:resolve('admin/index.html')}}}});

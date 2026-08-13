import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'save-initial-problems-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-initial-problems' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const problems = JSON.parse(body);
                const fileContent = `// src/data/initialProblems.js\n// 초기 상태 및 문제 데이터 세트\n\nexport const initialProblems = ${JSON.stringify(problems, null, 2)};\n`;
                const filePath = path.resolve(process.cwd(), 'src/data/initialProblems.js');
                fs.writeFileSync(filePath, fileContent, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
          next();
        });
      },
    },
  ],
});

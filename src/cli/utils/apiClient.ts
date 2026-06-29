import http from 'http';

const BASE_URL_HOST = '127.0.0.1';
const BASE_URL_PORT = parseInt(process.env.AFEN_RUNTIME_PORT ?? '8787', 10);

export function apiClient<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    const bodyStr = body !== undefined ? JSON.stringify(body) : '';
    const options: http.RequestOptions = {
      hostname: BASE_URL_HOST,
      port: BASE_URL_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        // Enforce clean socket teardown
        'Connection': 'close',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data) as T);
          } catch {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        }
      });
    });

    // 🛡️ CRITICAL FIX: Catch actual socket/TCP drops instead of swallowing them
    req.on('error', (err) => {
      reject(new Error(`Network/Socket Error: ${err.message}`));
    });

    // 10s fallback timeout if the server holds the socket hostage without responding
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out: Server accepted connection but never responded.'));
    });

    req.write(bodyStr);
    req.end();
  });
}
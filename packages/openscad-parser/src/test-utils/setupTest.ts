import createFetchMock from 'vitest-fetch-mock';
import { readFileSync } from 'node:fs';
import {join} from 'node:path';
const __dirname = import.meta.dirname;

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mocked(fetch).mockImplementation(url => {
  console.log('using local fetch mock', url);
  console.log('__dirname', join(__dirname, '../../', url));
  // Handle both string and URL objects
  let urlPath: string;
  if (typeof url === 'string') {
    urlPath = url;
  } else if (url instanceof URL) {
    urlPath = url.pathname;
  } else {
    // Handle other URL-like objects
    urlPath = String(url);
  }

  // Normalize the path
  urlPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;

  try {
    // read file in urlPath as Uint8Array
    const localFile = readFileSync(join(__dirname, '../../', urlPath));
    const uint8Array = new Uint8Array(localFile);
    return Promise.resolve({
      ok: true,
      bytes: () => Promise.resolve(uint8Array),
    } as unknown as Response);
  } catch (error) {
    console.error('Failed to read WASM file:', urlPath, error);
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response);
  }
});

import createFetchMock from 'vitest-fetch-mock';
import { readFileSync } from 'node:fs';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mocked(fetch).mockImplementation(url => {
  console.log('using local fetch mock', url);
  if (typeof url === 'string') {
    const urlPath = url.startsWith('/') ? url.slice(1) : url;
    // read file in urlPath as Uint8Array
    const localFile = readFileSync(urlPath);
    const uint8Array = new Uint8Array(localFile);
    return Promise.resolve({
      ok: true,
      bytes: () => Promise.resolve(uint8Array),
    } as any);
  }

  return Promise.resolve({
    json: vi.fn().mockResolvedValue({}),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  } as any);
});

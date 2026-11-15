import { NextResponse } from 'next/server';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { extractRecipeFromHtml } from '@/lib/importRecipe';

export const runtime = 'nodejs';

const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isPrivateIpv4(ip: string, fromDns = false): boolean {
  const parts = ip.split('.').map((part) => parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local (cloud metadata etc.)
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT shared address space
  if (a === 192 && b === 0) return true; // 192.0.0.0/24, 192.0.2.0/24 (TEST-NET-1)
  // 198.18.0.0/15 (benchmarking) is blocked for IP literals typed by the user,
  // but tolerated as a DNS answer: fake-IP proxies (Clash/Surge style) return
  // 198.18.x.x for *every* public hostname, so blocking it there would break
  // imports entirely on such networks while protecting nothing (the range is
  // never a real internal service address).
  if (a === 198 && (b === 18 || b === 19) && !fromDns) return true;
  if (a === 198 && b === 51) return true; // TEST-NET-2
  if (a === 203 && b === 0) return true; // TEST-NET-3
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIp(ip: string, fromDns = false): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip, fromDns);
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // fe80::/10
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // fc00::/7 unique local
    if (lower.startsWith('ff')) return true; // multicast
    if (lower.startsWith('::ffff:')) {
      const mapped = lower.slice('::ffff:'.length);
      if (isIP(mapped) === 4) return isPrivateIpv4(mapped, fromDns);
    }
    return false;
  }
  return true;
}

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.intranet'];

/**
 * Validate a URL for server-side fetching: http/https only, and the host
 * must not be (or resolve to) a private / reserved address.
 * Note: DNS is checked at validation time; a hostile DNS could still
 * rebind between check and fetch, which is accepted for this local app.
 */
async function validateFetchUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('URLの形式が正しくありません。');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('http / https のURLだけ取り込めます。');
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname || hostname === 'localhost' || BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error('このURLは取り込めません。');
  }
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error('このURLは取り込めません。');
    }
    return url;
  }
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new Error('サイトに接続できませんでした。');
  }
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIp(address, true))) {
    throw new Error('このURLは取り込めません。');
  }
  return url;
}

async function readBodyWithCap(response: Response, cap: number): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    if (text.length > cap) throw new Error('ページが大きすぎて取り込めませんでした。');
    return text;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let received = 0;
  let html = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > cap) {
      await reader.cancel().catch(() => undefined);
      throw new Error('ページが大きすぎて取り込めませんでした。');
    }
    html += decoder.decode(value, { stream: true });
  }
  html += decoder.decode();
  return html;
}

async function fetchPage(startUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let current = await validateFetchUrl(startUrl);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const response = await fetch(current.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml'
        }
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || hop === MAX_REDIRECTS) {
          throw new Error('リダイレクトが多すぎて取り込めませんでした。');
        }
        const next = new URL(location, current);
        current = await validateFetchUrl(next.toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(`サイトからページを取得できませんでした（${response.status}）。`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType && !/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
        throw new Error('このURLはレシピページではないようです。');
      }

      return await readBodyWithCap(response, MAX_BODY_BYTES);
    }
    throw new Error('ページを取得できませんでした。');
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('サイトの応答が遅くて取り込めませんでした。');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません。' }, { status: 400 });
  }

  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return NextResponse.json({ error: 'URLを入力してください。' }, { status: 400 });
  }

  try {
    const html = await fetchPage(url);
    const draft = extractRecipeFromHtml(html, url);
    return NextResponse.json(draft);
  } catch (error: any) {
    const message = error?.message ?? '取り込みに失敗しました。';
    const status = /取り込めません|形式が正しく|だけ取り込めます/.test(message) ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const secretBytes = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: Record<string, unknown>, secret: string, expiresInSeconds = 28800): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  
  const fullPayload = { ...payload, iat, exp };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerBase64 = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const payloadBase64 = btoa(JSON.stringify(fullPayload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${headerBase64}.${payloadBase64}`)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let signatureBinaryString = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    signatureBinaryString += String.fromCharCode(signatureBytes[i]);
  }
  const signatureBase64 = btoa(signatureBinaryString)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
}

export async function verifyToken(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerBase64, payloadBase64, signatureBase64] = parts;
    const key = await getCryptoKey(secret);
    const dataBytes = encoder.encode(`${headerBase64}.${payloadBase64}`);
    
    const signatureBinaryString = atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBytes = new Uint8Array(signatureBinaryString.length);
    for (let i = 0; i < signatureBinaryString.length; i++) {
      signatureBytes[i] = signatureBinaryString.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBytes
    );
    
    if (!isValid) return null;
    
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    
    if (payload.exp && typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

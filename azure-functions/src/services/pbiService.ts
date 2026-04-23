import { ConfidentialClientApplication } from '@azure/msal-node';

const PBI_RESOURCE = 'https://analysis.windows.net/powerbi/api';
const PBI_BASE     = 'https://api.powerbi.com/v1.0/myorg';

// ---------------------------------------------------------------------------
// MSAL client — lazy singleton
// ---------------------------------------------------------------------------

let _msalClient: ConfidentialClientApplication | null = null;

function getMsalClient(): ConfidentialClientApplication {
  if (!_msalClient) {
    _msalClient = new ConfidentialClientApplication({
      auth: {
        clientId:     process.env['CLIENT_ID']!,
        clientSecret: process.env['CLIENT_SECRET']!,
        authority:    `https://login.microsoftonline.com/${process.env['TENANT_ID']!}`,
      },
    });
  }
  return _msalClient;
}

async function getAccessToken(): Promise<string> {
  const result = await getMsalClient().acquireTokenByClientCredential({
    scopes: [`${PBI_RESOURCE}/.default`],
  });
  if (!result?.accessToken) {
    throw new Error('MSAL: failed to acquire Power BI access token');
  }
  return result.accessToken;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function pbiGet<T>(path: string): Promise<T> {
  const token    = await getAccessToken();
  const response = await fetch(`${PBI_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Power BI API GET ${path} → HTTP ${response.status}: ${body}`);
  }
  const json = (await response.json()) as { value: T };
  return json.value;
}

async function pbiPost<T>(path: string, body: unknown): Promise<T> {
  const token    = await getAccessToken();
  const response = await fetch(`${PBI_BASE}${path}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Power BI API POST ${path} → HTTP ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface PBIReport {
  id:        string;
  name:      string;
  embedUrl:  string;
  datasetId: string;
  webUrl:    string;
}

export interface EmbedTokenResult {
  token:      string;
  tokenId:    string;
  expiration: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function listReports(workspaceId: string): Promise<PBIReport[]> {
  return pbiGet<PBIReport[]>(`/groups/${workspaceId}/reports`);
}

export function generateEmbedToken(
  workspaceId: string,
  reportId:    string,
  datasetId:   string
): Promise<EmbedTokenResult> {
  return pbiPost<EmbedTokenResult>(
    `/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    { accessLevel: 'view', datasetId }
  );
}

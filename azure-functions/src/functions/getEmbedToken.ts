import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateEmbedToken } from '../services/pbiService';

interface EmbedTokenRequest {
  reportId:  string;
  datasetId: string;
}

async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const workspaceId = process.env['WORKSPACE_ID'];
  if (!workspaceId) {
    return { status: 500, body: 'WORKSPACE_ID env var not configured' };
  }

  let body: Partial<EmbedTokenRequest>;
  try {
    body = (await request.json()) as Partial<EmbedTokenRequest>;
  } catch {
    return { status: 400, body: 'Invalid JSON body' };
  }

  const { reportId, datasetId } = body;
  if (!reportId || !datasetId) {
    return { status: 400, body: 'reportId and datasetId are required' };
  }

  try {
    const result = await generateEmbedToken(workspaceId, reportId, datasetId);
    return {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(result),
    };
  } catch (err) {
    context.error('getEmbedToken error:', err);
    return { status: 500, body: String(err) };
  }
}

app.http('getEmbedToken', {
  methods:   ['POST'],
  authLevel: 'anonymous',
  route:     'embed-token',
  handler,
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { listReports } from '../services/pbiService';

async function handler(
  _request: HttpRequest,
  context:  InvocationContext
): Promise<HttpResponseInit> {
  const workspaceId = process.env['WORKSPACE_ID'];
  if (!workspaceId) {
    return { status: 500, body: 'WORKSPACE_ID env var not configured' };
  }

  try {
    const reports = await listReports(workspaceId);
    return {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(reports),
    };
  } catch (err) {
    context.error('getReports error:', err);
    return { status: 500, body: String(err) };
  }
}

app.http('getReports', {
  methods:   ['GET'],
  authLevel: 'anonymous',
  route:     'reports',
  handler,
});

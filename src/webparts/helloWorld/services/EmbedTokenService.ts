import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { IPowerBIReport, IPowerBIGroup } from './PowerBIService';

// Re-export so consumers only need one import
export { IPowerBIReport, IPowerBIGroup };

export type EmbedMode = 'user' | 'app';

// ---------------------------------------------------------------------------
// Shared service interface — implemented by both PowerBIService and
// EmbedTokenService so ReportPicker stays agnostic of the embed mode.
// ---------------------------------------------------------------------------

export interface IPowerBIDataService {
  listMyReports():                                Promise<IPowerBIReport[]>;
  listGroups():                                   Promise<IPowerBIGroup[]>;
  listReportsInGroup(groupId: string):            Promise<IPowerBIReport[]>;
}

// ---------------------------------------------------------------------------
// Embed token shape returned by the Azure Function
// ---------------------------------------------------------------------------

export interface IEmbedToken {
  token:      string;
  tokenId:    string;
  expiration: string;
}

// ---------------------------------------------------------------------------
// EmbedTokenService — App-Owns-Data via Azure Function backend
// ---------------------------------------------------------------------------

export class EmbedTokenService implements IPowerBIDataService {

  constructor(
    private readonly _httpClient:      HttpClient,
    private readonly _functionBaseUrl: string
  ) {}

  private get _base(): string {
    return this._functionBaseUrl.replace(/\/+$/, '');
  }

  private async _get<T>(path: string): Promise<T> {
    const response: HttpClientResponse = await this._httpClient.get(
      `${this._base}${path}`,
      HttpClient.configurations.v1
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[EmbedTokenService] GET ${path} → HTTP ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  private async _post<T>(path: string, body: unknown): Promise<T> {
    const response: HttpClientResponse = await this._httpClient.post(
      `${this._base}${path}`,
      HttpClient.configurations.v1,
      {
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[EmbedTokenService] POST ${path} → HTTP ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  // IPowerBIDataService — App-Owns-Data returns only the configured workspace's reports
  public listMyReports(): Promise<IPowerBIReport[]> {
    return this._get<IPowerBIReport[]>('/api/reports');
  }

  // Groups are managed server-side via WORKSPACE_ID env var; expose empty list
  public listGroups(): Promise<IPowerBIGroup[]> {
    return Promise.resolve([]);
  }

  public listReportsInGroup(_groupId: string): Promise<IPowerBIReport[]> {
    return Promise.resolve([]);
  }

  // App-Owns-Data specific — called by PowerBIViewer to get per-session embed token
  public getEmbedToken(reportId: string, datasetId: string): Promise<IEmbedToken> {
    return this._post<IEmbedToken>('/api/embed-token', { reportId, datasetId });
  }
}

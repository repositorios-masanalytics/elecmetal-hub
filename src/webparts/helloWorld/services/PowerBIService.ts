import { AadHttpClient, AadHttpClientFactory } from '@microsoft/sp-http';

const PBI_RESOURCE = 'https://analysis.windows.net/powerbi/api';
const PBI_BASE     = 'https://api.powerbi.com/v1.0/myorg';

export interface IPowerBIReport {
  id:        string;
  name:      string;
  embedUrl:  string;
  datasetId: string;
  webUrl:    string;
}

export interface IPowerBIGroup {
  id:         string;
  name:       string;
  isReadOnly: boolean;
}

export class PowerBITokenExpiredError extends Error {
  constructor() {
    super(
      'Sin acceso a Power BI API (401). ' +
      'Verificá: (1) licencia Power BI Pro asignada, ' +
      '(2) permisos aprobados en SharePoint Admin → API Access.'
    );
    this.name = 'PowerBITokenExpiredError';
  }
}

export class PowerBIConsentMissingError extends Error {
  constructor() {
    super(
      'Permiso "Report.Read.All" no otorgado. ' +
      'Pedí al admin: SharePoint Admin Center → API Access → ' +
      'aprobar "Power BI Service / Report.Read.All".'
    );
    this.name = 'PowerBIConsentMissingError';
  }
}

export class PowerBIApiError extends Error {
  constructor(public readonly status: number) {
    super(`Power BI API respondió HTTP ${status}.`);
    this.name = 'PowerBIApiError';
  }
}

export class PowerBIService {
  private _clientPromise: Promise<AadHttpClient>;

  constructor(factory: AadHttpClientFactory) {
    this._clientPromise = factory.getClient(PBI_RESOURCE);
  }

  private async _get<T>(path: string): Promise<T> {
    const client   = await this._clientPromise;
    const response = await client.get(
      `${PBI_BASE}${path}`,
      AadHttpClient.configurations.v1
    );

    if (response.status === 401) throw new PowerBITokenExpiredError();
    if (response.status === 403) throw new PowerBIConsentMissingError();
    if (!response.ok)            throw new PowerBIApiError(response.status);

    const json = await response.json();
    return json.value as T;
  }

  public listMyReports(): Promise<IPowerBIReport[]> {
    return this._get<IPowerBIReport[]>('/reports');
  }

  public listGroups(): Promise<IPowerBIGroup[]> {
    return this._get<IPowerBIGroup[]>('/groups');
  }

  public listReportsInGroup(groupId: string): Promise<IPowerBIReport[]> {
    return this._get<IPowerBIReport[]>(`/groups/${groupId}/reports`);
  }
}

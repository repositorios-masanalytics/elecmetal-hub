import { AadHttpClientFactory, HttpClient } from '@microsoft/sp-http';
import { EmbedMode } from '../services/EmbedTokenService';

export { EmbedMode };

export interface IGraphUserProfile {
  displayName:    string;
  jobTitle:       string;
  department:     string;
  officeLocation: string;
}

export interface IHelloWorldProps {
  title:                string;
  graphProfile:         IGraphUserProfile | undefined;
  aadHttpClientFactory: AadHttpClientFactory;
  httpClient:           HttpClient;
  tenantId:             string;
  embedMode:            EmbedMode;
  azureFunctionUrl:     string;
}

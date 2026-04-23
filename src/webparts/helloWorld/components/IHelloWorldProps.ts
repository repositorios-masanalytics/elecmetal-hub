import { AadHttpClientFactory } from '@microsoft/sp-http';

export interface IGraphUserProfile {
  displayName: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
}

export interface IHelloWorldProps {
  title:                 string;
  graphProfile:          IGraphUserProfile | undefined;
  aadHttpClientFactory:  AadHttpClientFactory;
  tenantId:              string;
}

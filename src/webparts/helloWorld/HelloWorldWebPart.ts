import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3, AadHttpClientFactory, HttpClient } from '@microsoft/sp-http';

import './_diag'; // DIAGNOSTIC checkpoint 2 — remove after debugging
import HelloWorld from './components/HelloWorld'; // SCSS chain loads here
import { IHelloWorldProps, IGraphUserProfile, EmbedMode } from './components/IHelloWorldProps';

export interface IHelloWorldWebPartProps {
  title:            string;
  embedMode:        EmbedMode;
  azureFunctionUrl: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  private _graphProfile: IGraphUserProfile | undefined;

  protected async onInit(): Promise<void> {
    this._hideSharePointChrome();

    try {
      const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
      this._graphProfile = await client
        .api('/me')
        .select('displayName,jobTitle,department,officeLocation')
        .get();
    } catch (_e) {
      // Graph no disponible (ej. workbench local) → perfil queda undefined
      this._graphProfile = undefined;
    }
    return super.onInit();
  }

  private _hideSharePointChrome(): void {
    if (document.getElementById('mas-hub-chrome-hide')) return;

    const style = document.createElement('style');
    style.id = 'mas-hub-chrome-hide';
    style.textContent = `
      [data-automationid="SiteHeader"]      { display: none !important; }
      [data-automationid="SiteNav"]         { display: none !important; }
      [data-automationid="PageHeader"]      { display: none !important; }
      [data-automationid="pageCommandBar"]  { display: none !important; }
      [data-automationid="SiteFooter"]      { display: none !important; }
      .CanvasZone                           { padding: 0 !important; }
      .CanvasSection                        { padding: 0 !important; }
      .ms-CanvasSection-fullWidth           { padding: 0 !important; }
      #workbenchPageContent                 { padding: 0 !important; }
      #O365_NavHeader                       { display: none !important; }
      #SuiteNavPlaceholder                  { display: none !important; }
      #sp-appBar                            { display: none !important; }
      [data-automationid="ShellHubBar"]     { display: none !important; }
      [data-automationid="GlobalNavBar"]    { display: none !important; }
      .sp-App-Bar                           { display: none !important; }
      #spLeftNav                            { display: none !important; }
      #sp-clnav                             { display: none !important; }
      .ms-HiddenExample                     { display: none !important; }
      [data-automation-id="pageBeingEdited"]{ display: none !important; }
      .editToolbar                          { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  public render(): void {
    const embedMode: EmbedMode = this.properties.embedMode || 'user';

    const element: React.ReactElement<IHelloWorldProps> = React.createElement(
      HelloWorld,
      {
        title:                this.properties.title,
        graphProfile:         this._graphProfile,
        aadHttpClientFactory: this.context.aadHttpClientFactory as AadHttpClientFactory,
        httpClient:           this.context.httpClient as HttpClient,
        tenantId:             this.context.pageContext.aadInfo.tenantId.toString(),
        embedMode:            embedMode,
        azureFunctionUrl:     this.properties.azureFunctionUrl || 'http://localhost:7071',
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configuración del Web Part' },
          groups: [
            {
              groupName: 'General',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Título del Web Part',
                }),
                PropertyPaneDropdown('embedMode', {
                  label: 'Modo de embed',
                  options: [
                    { key: 'user', text: 'User-Owns-Data (delegado)' },
                    { key: 'app',  text: 'App-Owns-Data (Service Principal)' },
                  ],
                }),
                PropertyPaneTextField('azureFunctionUrl', {
                  label:       'URL de Azure Function (solo modo App)',
                  placeholder: 'http://localhost:7071',
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}

// DIAGNOSTIC checkpoint 3 — remove after debugging
try { console.log('[wp:3] AMD factory completed; HelloWorldWebPart class defined'); } catch (_e) { /* */ }

import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3, AadHttpClientFactory, HttpClient } from '@microsoft/sp-http';

import * as strings from 'HelloWorldWebPartStrings';
import HelloWorld from './components/HelloWorld';
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

  // Oculta el chrome de SharePoint (header del sitio, nav, footer, command bar y márgenes
  // del canvas) para que el webpart ocupe toda la pantalla como una app standalone.
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
        azureFunctionUrl:     this.properties.azureFunctionUrl || '',
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
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                }),
                PropertyPaneDropdown('embedMode', {
                  label: strings.EmbedModeFieldLabel,
                  options: [
                    { key: 'user', text: strings.EmbedModeUser },
                    { key: 'app',  text: strings.EmbedModeApp  },
                  ],
                }),
                PropertyPaneTextField('azureFunctionUrl', {
                  label:       strings.AzureFunctionUrlFieldLabel,
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

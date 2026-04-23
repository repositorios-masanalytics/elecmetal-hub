import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3, AadHttpClientFactory } from '@microsoft/sp-http';

import * as strings from 'HelloWorldWebPartStrings';
import HelloWorld from './components/HelloWorld';
import { IHelloWorldProps, IGraphUserProfile } from './components/IHelloWorldProps';

export interface IHelloWorldWebPartProps {
  title: string;
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
      // Si Graph no está disponible (ej. workbench local), el perfil queda undefined
      this._graphProfile = undefined;
    }
    return super.onInit();
  }

  // Oculta el chrome de SharePoint (header del sitio, nav, footer, command bar y márgenes
  // del canvas) para que el webpart ocupe toda la pantalla como una app standalone.
  // La suite bar de Microsoft 365 (barra negra superior) requiere configuración de admin:
  //   PowerShell → Set-SPOTenant -HideSuiteBar $true
  //   o bien: SharePoint Admin Center → Settings → Hide the suite bar
  private _hideSharePointChrome(): void {
    if (document.getElementById('mas-hub-chrome-hide')) return;

    const style = document.createElement('style');
    style.id = 'mas-hub-chrome-hide';
    style.textContent = `
      /* Header del sitio (logo, nombre del sitio, nav horizontal) */
      [data-automationid="SiteHeader"]      { display: none !important; }
      /* Navegación izquierda / vertical */
      [data-automationid="SiteNav"]         { display: none !important; }
      /* Área del título de página */
      [data-automationid="PageHeader"]      { display: none !important; }
      /* Barra de comandos (Editar, Compartir, etc.) */
      [data-automationid="pageCommandBar"]  { display: none !important; }
      /* Footer del sitio */
      [data-automationid="SiteFooter"]      { display: none !important; }
      /* Márgenes que SharePoint agrega alrededor de los webparts */
      .CanvasZone                           { padding: 0 !important; }
      .CanvasSection                        { padding: 0 !important; }
      .ms-CanvasSection-fullWidth           { padding: 0 !important; }
      /* Workbench local */
      #workbenchPageContent                 { padding: 0 !important; }
      /* Suite bar de Microsoft 365 (barra negra superior con waffle, búsqueda, avatar) */
      #O365_NavHeader                       { display: none !important; }
      #SuiteNavPlaceholder                  { display: none !important; }
      /* Global App Bar (barra vertical izquierda de accesos rápidos de M365) */
      #sp-appBar                            { display: none !important; }
      [data-automationid="ShellHubBar"]     { display: none !important; }
      [data-automationid="GlobalNavBar"]    { display: none !important; }
      .sp-App-Bar                           { display: none !important; }
      #spLeftNav                            { display: none !important; }
      #sp-clnav                             { display: none !important; }
      /* Barra flotante de "Editar página" en modo vista */
      .ms-HiddenExample                     { display: none !important; }
      [data-automation-id="pageBeingEdited"]{ display: none !important; }
      .editToolbar                          { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  public render(): void {
    const element: React.ReactElement<IHelloWorldProps> = React.createElement(
      HelloWorld,
      {
        title:                this.properties.title,
        graphProfile:         this._graphProfile,
        aadHttpClientFactory: this.context.aadHttpClientFactory as AadHttpClientFactory,
        tenantId:             this.context.pageContext.aadInfo.tenantId.toString(),
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
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

import * as React from 'react';
import { IHelloWorldProps } from './IHelloWorldProps';
import { PowerBIService, IPowerBIReport } from '../services/PowerBIService';
import { EmbedTokenService, IPowerBIDataService } from '../services/EmbedTokenService';
import Header from './Header';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import PowerBIViewer from './PowerBIViewer';
import Sidebar, { ISidebarNavItem } from './Sidebar';
import ReportPicker from './ReportPicker';
import styles from './Sidebar.module.scss';

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

interface IHelloWorldState {
  activeKey:      string;
  selectedReport: IPowerBIReport | undefined;
}

// ---------------------------------------------------------------------------
// Items de navegación estáticos
// ---------------------------------------------------------------------------

const NAV_TOP: ISidebarNavItem[]    = [{ key: 'home',     label: 'Inicio',         iconName: 'Home'     }];
const NAV_BOTTOM: ISidebarNavItem[] = [{ key: 'settings', label: 'Configuración',  iconName: 'Settings' }];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default class HelloWorld extends React.Component<IHelloWorldProps, IHelloWorldState> {

  private _dataService:       IPowerBIDataService;
  private _embedTokenService: EmbedTokenService | undefined;

  constructor(props: IHelloWorldProps) {
    super(props);

    if (props.embedMode === 'app' && props.azureFunctionUrl) {
      const svc               = new EmbedTokenService(props.httpClient, props.azureFunctionUrl);
      this._dataService       = svc;
      this._embedTokenService = svc;
    } else {
      this._dataService = new PowerBIService(props.aadHttpClientFactory);
    }

    this.state = { activeKey: 'home', selectedReport: undefined };
  }

  private _navigate = (key: string): void => {
    this.setState({ activeKey: key, selectedReport: undefined });
  }

  private _onReportSelect = (report: IPowerBIReport): void => {
    this.setState({ activeKey: report.id, selectedReport: report });
  }

  private _buildTopItems(): ISidebarNavItem[] {
    return NAV_TOP.map(item => ({ ...item, onClick: () => this._navigate(item.key) }));
  }

  private _buildBottomItems(): ISidebarNavItem[] {
    return NAV_BOTTOM.map(item => ({ ...item, onClick: () => this._navigate(item.key) }));
  }

  public render(): React.ReactElement<IHelloWorldProps> {
    const { activeKey, selectedReport } = this.state;

    return (
      <FluentProvider theme={webLightTheme}>

        <Header graphProfile={this.props.graphProfile} />

        <div className={styles.appShell}>

          <Sidebar
            graphProfile={this.props.graphProfile}
            topItems={this._buildTopItems()}
            bottomItems={this._buildBottomItems()}
            activeKey={activeKey}
          >
            <ReportPicker
              service={this._dataService}
              onSelect={this._onReportSelect}
            />
          </Sidebar>

          <main className={styles.mainContent}>
            {selectedReport ? (
              <PowerBIViewer
                reportId={selectedReport.id}
                embedUrl={selectedReport.embedUrl}
                datasetId={selectedReport.datasetId}
                tenantId={this.props.tenantId}
                title={selectedReport.name}
                embedMode={this.props.embedMode}
                embedTokenService={this._embedTokenService}
              />
            ) : (
              <div style={{ padding: '40px 24px' }}>
                <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 600 }}>{this.props.title}</h1>
                <p style={{ margin: 0, fontSize: 16, color: '#605e5c' }}>
                  Seleccioná un reporte en el menú lateral para comenzar.
                </p>
              </div>
            )}
          </main>

        </div>
      </FluentProvider>
    );
  }
}

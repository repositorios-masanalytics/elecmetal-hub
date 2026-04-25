import * as React from 'react';
// DIAGNOSTIC: import { Spinner } from '@fluentui/react-components';
// DIAGNOSTIC: import { DataBarVertical20Regular, ErrorCircle20Regular, ChevronRight20Regular, ChevronDown20Regular } from '@fluentui/react-icons';
import {
  IPowerBIReport,
  IPowerBIGroup,
  PowerBIConsentMissingError,
} from '../services/PowerBIService';
import { IPowerBIDataService } from '../services/EmbedTokenService';

export interface IReportPickerProps {
  service:  IPowerBIDataService;
  onSelect: (report: IPowerBIReport) => void;
}

interface IGroup {
  key:         string;
  name:        string;
  startIndex:  number;
  count:       number;
  isCollapsed: boolean;
}

interface IReportPickerState {
  status:         'loading' | 'error' | 'loaded';
  items:          IPowerBIReport[];
  groups:         IGroup[];
  errorMessage?:  string;
  isConsentError: boolean;
}

export default class ReportPicker extends React.Component<IReportPickerProps, IReportPickerState> {

  constructor(props: IReportPickerProps) {
    super(props);
    this.state = {
      status:         'loading',
      items:          [],
      groups:         [],
      isConsentError: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    const { service } = this.props;
    try {
      const pMyReports = service.listMyReports();
      const pGroups    = service.listGroups();

      let myReports: IPowerBIReport[];
      try {
        myReports = await pMyReports;
      } catch (err) {
        const e = err as Error;
        this.setState({
          status:         'error',
          errorMessage:   e.message,
          isConsentError: e instanceof PowerBIConsentMissingError,
        });
        return;
      }

      let apiGroups: IPowerBIGroup[] = [];
      try {
        apiGroups = await pGroups;
      } catch (err) {
        console.warn('[ReportPicker] listGroups failed, showing Mi workspace only:', err);
      }

      const groupReports: IPowerBIReport[][] =
        await Promise.all(apiGroups.map(g => service.listReportsInGroup(g.id)));

      const flatItems: IPowerBIReport[] = [...myReports];
      const iGroups:   IGroup[]         = [];

      if (myReports.length > 0) {
        iGroups.push({ key: '__my', name: 'Mi workspace', startIndex: 0, count: myReports.length, isCollapsed: false });
      }

      apiGroups.forEach((g, i) => {
        const reports = groupReports[i];
        if (reports.length === 0) return;
        iGroups.push({ key: g.id, name: g.name, startIndex: flatItems.length, count: reports.length, isCollapsed: false });
        flatItems.push(...reports);
      });

      this.setState({ status: 'loaded', items: flatItems, groups: iGroups });
    } catch (err) {
      const e = err as Error;
      this.setState({
        status:         'error',
        errorMessage:   e.message,
        isConsentError: e instanceof PowerBIConsentMissingError,
      });
    }
  }

  private _toggleGroup = (key: string): void => {
    this.setState(prev => ({
      groups: prev.groups.map(g => g.key === key ? { ...g, isCollapsed: !g.isCollapsed } : g),
    }));
  }

  public render(): React.ReactElement<IReportPickerProps> {
    const { status, items, groups, errorMessage, isConsentError } = this.state;

    if (status === 'loading') {
      return (
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>...</span>
          <span style={{ color: '#a8c0e0', fontSize: 13 }}>Cargando reportes...</span>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div style={{ padding: '12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
            {/* DIAGNOSTIC: <ErrorCircle20Regular /> */}<span style={{ color: '#ffa07a', marginTop: 2, flexShrink: 0 }}>✕</span>
            <span style={{ color: '#ffa07a', fontSize: 13 }}>{errorMessage}</span>
          </div>
          {isConsentError && (
            <span style={{ color: '#a8c0e0', fontSize: 12, display: 'block', paddingLeft: 20 }}>
              Pasos: SharePoint Admin Center → API Access → aprobar "Power BI Service / Report.Read.All"
            </span>
          )}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div style={{ padding: 12, color: '#a8c0e0', fontSize: 13 }}>
          No se encontraron reportes.
        </div>
      );
    }

    return (
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {groups.map(group => {
          const groupItems = items.slice(group.startIndex, group.startIndex + group.count);
          return (
            <div key={group.key}>
              <button
                onClick={() => this._toggleGroup(group.key)}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           8,
                  width:         '100%',
                  padding:       '6px 12px',
                  background:    'rgba(255,255,255,0.07)',
                  border:        'none',
                  borderBottom:  '1px solid rgba(255,255,255,0.05)',
                  color:         '#a8c0e0',
                  cursor:        'pointer',
                  fontSize:      11,
                  fontWeight:    600,
                  textTransform: 'uppercase' as 'uppercase',
                  letterSpacing: '0.06em',
                  boxSizing:     'border-box' as 'border-box',
                }}
              >
                {/* DIAGNOSTIC: ChevronRight/Down */}
                <span style={{ fontSize: 10 }}>{group.isCollapsed ? '▶' : '▼'}</span>
                {group.name}
              </button>
              {!group.isCollapsed && groupItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => this.props.onSelect(item)}
                  title={item.name}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        8,
                    width:      '100%',
                    padding:    '8px 12px 8px 20px',
                    background: 'transparent',
                    border:     'none',
                    color:      '#dce8fa',
                    cursor:     'pointer',
                    textAlign:  'left' as 'left',
                    fontSize:   14,
                    boxSizing:  'border-box' as 'border-box',
                  }}
                >
                  {/* DIAGNOSTIC: <DataBarVertical20Regular /> */}
                  <span style={{ color: '#a8c0e0', flexShrink: 0 }}>▪</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
}

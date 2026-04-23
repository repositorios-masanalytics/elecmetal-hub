import * as React from 'react';
import { GroupedList, IGroup } from 'office-ui-fabric-react/lib/GroupedList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';
import {
  PowerBIService,
  IPowerBIReport,
  IPowerBIGroup,
  PowerBIConsentMissingError,
} from '../services/PowerBIService';

export interface IReportPickerProps {
  service:  PowerBIService;
  onSelect: (report: IPowerBIReport) => void;
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

  private _renderCell = (_depth: number | undefined, item?: IPowerBIReport): React.ReactNode => {
    if (!item) return null;
    return (
      <button
        onClick={() => this.props.onSelect(item)}
        title={item.name}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          width:          '100%',
          padding:        '8px 12px 8px 20px',
          background:     'transparent',
          border:         'none',
          color:          '#dce8fa',
          cursor:         'pointer',
          textAlign:      'left',
          fontSize:       14,
          boxSizing:      'border-box',
        }}
      >
        <Icon iconName="BarChart4" style={{ color: '#a8c0e0', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </span>
      </button>
    );
  }

  public render(): React.ReactElement<IReportPickerProps> {
    const { status, items, groups, errorMessage, isConsentError } = this.state;

    if (status === 'loading') {
      return (
        <div style={{ padding: 16 }}>
          <Spinner
            size={SpinnerSize.small}
            label="Cargando reportes..."
            labelPosition="right"
            styles={{ label: { color: '#a8c0e0' }, circle: { borderTopColor: '#a8c0e0' } }}
          />
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div style={{ padding: '12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
            <Icon iconName="Error" style={{ color: '#ffa07a', marginTop: 2, flexShrink: 0 }} />
            <Text style={{ color: '#ffa07a', fontSize: 13 }}>{errorMessage}</Text>
          </div>
          {isConsentError && (
            <Text style={{ color: '#a8c0e0', fontSize: 12, display: 'block', paddingLeft: 20 }}>
              Pasos: SharePoint Admin Center → API Access → aprobar "Power BI Service / Report.Read.All"
            </Text>
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
        <GroupedList
          items={items}
          groups={groups}
          onRenderCell={this._renderCell}
          compact={true}
          groupProps={{
            onRenderHeader: (props) => {
              if (!props || !props.group) return null;
              const { group, onToggleCollapse } = props;
              return (
                <button
                  onClick={() => onToggleCollapse && onToggleCollapse(group)}
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
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    boxSizing:     'border-box',
                  }}
                >
                  <Icon iconName={group.isCollapsed ? 'ChevronRight' : 'ChevronDown'} style={{ fontSize: 10 }} />
                  {group.name}
                </button>
              );
            },
          }}
        />
      </div>
    );
  }
}

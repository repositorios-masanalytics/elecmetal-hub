import * as React from 'react';
import { useState } from 'react';
import {
  Home20Regular,
  Settings20Regular,
  Navigation20Regular,
  ArrowLeft20Regular,
} from '@fluentui/react-icons';
import { Avatar } from '@fluentui/react-components';
import { IGraphUserProfile } from './IHelloWorldProps';
import styles from './Sidebar.module.scss';

export interface ISidebarNavItem {
  key: string;
  label: string;
  iconName: string;
  onClick?: () => void;
}

export interface ISidebarProps {
  graphProfile:  IGraphUserProfile | undefined;
  topItems:      ISidebarNavItem[];
  bottomItems:   ISidebarNavItem[];
  activeKey?:    string;
  children?:     React.ReactNode;
}

const ICON_MAP: Record<string, React.ComponentType<React.SVGAttributes<SVGSVGElement>>> = {
  'Home':            Home20Regular,
  'Settings':        Settings20Regular,
  'GlobalNavButton': Navigation20Regular,
  'Back':            ArrowLeft20Regular,
};

const Sidebar: React.FC<ISidebarProps> = ({ graphProfile, topItems, bottomItems, activeKey, children }) => {

  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarClass = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : styles.expanded,
  ].join(' ');

  const renderItem = (item: ISidebarNavItem): JSX.Element => {
    const isActive = activeKey === item.key;
    const itemClass = [
      styles.navItem,
      isActive ? styles.navItemActive : '',
    ].join(' ');
    const IconComponent = ICON_MAP[item.iconName];

    return (
      <li key={item.key} role="listitem">
        <button
          className={itemClass}
          onClick={item.onClick}
          title={item.label}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className={styles.navIcon} aria-hidden="true">
            {IconComponent && <IconComponent />}
          </span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      </li>
    );
  };

  const ToggleIcon = isCollapsed ? Navigation20Regular : ArrowLeft20Regular;

  return (
    <nav className={sidebarClass} aria-label="Navegación principal">

      {/* ── Botón toggle ── */}
      <button
        className={styles.toggleBtn}
        onClick={() => setIsCollapsed(prev => !prev)}
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <ToggleIcon />
      </button>

      {/* ── Ítems estáticos superiores (ej. Inicio) ── */}
      {topItems.length > 0 && (
        <ul className={styles.navList} role="list">
          {topItems.map(renderItem)}
        </ul>
      )}

      {/* ── Contenido dinámico (ReportPicker) ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </div>

      {/* ── Ítems estáticos inferiores (ej. Configuración) ── */}
      {bottomItems.length > 0 && (
        <ul className={styles.navList} role="list">
          {bottomItems.map(renderItem)}
        </ul>
      )}

      {/* ── Avatar al fondo ── */}
      <div className={styles.avatarSection}>
        <Avatar
          name={graphProfile?.displayName ?? undefined}
          size={isCollapsed ? 24 : 32}
          color="colorful"
          title={graphProfile?.displayName ?? 'Cargando...'}
        />
        {!isCollapsed && graphProfile && (
          <div style={{ overflow: 'hidden', marginLeft: 8 }}>
            <div style={{
              color: '#dce8fa', fontSize: 13, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {graphProfile.displayName}
            </div>
            {graphProfile.jobTitle && (
              <div style={{
                color: '#a8c0e0', fontSize: 11,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {graphProfile.jobTitle}
              </div>
            )}
          </div>
        )}
      </div>

    </nav>
  );
};

export default Sidebar;

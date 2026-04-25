import * as React from 'react';
import { useState } from 'react';
// DIAGNOSTIC: import { Home20Regular, Settings20Regular, Navigation20Regular, ArrowLeft20Regular } from '@fluentui/react-icons';
// DIAGNOSTIC: import { Avatar } from '@fluentui/react-components';
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

// DIAGNOSTIC: icons removed
const ICON_MAP: Record<string, React.ComponentType<React.SVGAttributes<SVGSVGElement>>> = {};

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

  // DIAGNOSTIC: const ToggleIcon = isCollapsed ? Navigation20Regular : ArrowLeft20Regular;

  return (
    <nav className={sidebarClass} aria-label="Navegación principal">

      {/* ── Botón toggle ── */}
      <button
        className={styles.toggleBtn}
        onClick={() => setIsCollapsed(prev => !prev)}
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {/* DIAGNOSTIC: <ToggleIcon /> */}
        <span>{isCollapsed ? '☰' : '←'}</span>
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
        <div style={{ width: isCollapsed ? 24 : 32, height: isCollapsed ? 24 : 32, borderRadius: '50%', background: '#3a5a8b' }} title={graphProfile?.displayName ?? 'Cargando...'} />
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

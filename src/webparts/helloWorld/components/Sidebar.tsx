import * as React from 'react';
import { useState } from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { IGraphUserProfile } from './IHelloWorldProps';
import styles from './Sidebar.module.scss';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

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

    return (
      <li key={item.key} role="listitem">
        <button
          className={itemClass}
          onClick={item.onClick}
          title={item.label}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className={styles.navIcon} aria-hidden="true">
            <Icon iconName={item.iconName} />
          </span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <nav className={sidebarClass} aria-label="Navegación principal">

      {/* ── Botón toggle ── */}
      <button
        className={styles.toggleBtn}
        onClick={() => setIsCollapsed(prev => !prev)}
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <Icon iconName={isCollapsed ? 'GlobalNavButton' : 'Back'} />
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

      {/* ── Persona / Avatar al fondo ── */}
      <div className={styles.avatarSection}>
        <Persona
          text={graphProfile ? graphProfile.displayName : undefined}
          secondaryText={graphProfile ? graphProfile.jobTitle : undefined}
          size={isCollapsed ? PersonaSize.size32 : PersonaSize.size40}
          hidePersonaDetails={isCollapsed}
          title={graphProfile ? graphProfile.displayName : 'Cargando...'}
          styles={{
            root:          { overflow: 'hidden', maxWidth: '100%' },
            primaryText:   { color: '#dce8fa' },
            secondaryText: { color: '#a8c0e0' },
          }}
        />
      </div>

    </nav>
  );
};

export default Sidebar;

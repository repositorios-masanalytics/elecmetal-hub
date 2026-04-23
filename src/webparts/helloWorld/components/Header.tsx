import * as React from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IGraphUserProfile } from './IHelloWorldProps';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IHeaderProps {
  graphProfile: IGraphUserProfile | undefined;
}

// ---------------------------------------------------------------------------
// Estilos de botón reutilizables para el tema corporativo oscuro
// ---------------------------------------------------------------------------

const BRAND_BTN_STYLES = {
  root:         { backgroundColor: '#1b3a6b', cursor: 'default' },
  rootHovered:  { backgroundColor: '#1b3a6b' },
  rootPressed:  { backgroundColor: '#1b3a6b' },
  label:        { color: '#ffffff', fontWeight: '700' as '700', fontSize: '15px' },
  icon:         { color: '#c8d8f0' },
};

const ACTION_BTN_STYLES = {
  root:         { backgroundColor: '#1b3a6b' },
  rootHovered:  { backgroundColor: '#254d8f' },
  rootPressed:  { backgroundColor: '#1a2e52' },
  icon:         { color: '#c8d8f0' },
  label:        { color: '#dce8fa' },
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

const Header: React.FC<IHeaderProps> = ({ graphProfile }) => {

  const items: ICommandBarItemProps[] = [
    {
      key: 'brand',
      text: 'ME Elecmetal HUB',
      iconProps: { iconName: 'Globe' },
      buttonStyles: BRAND_BTN_STYLES,
    },
  ];

  const farItems: ICommandBarItemProps[] = [
    {
      key: 'user-info',
      // onRender permite un bloque de dos líneas que CommandBar no ofrece nativamente
      onRender: () => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 16px',
          cursor: 'default',
          height: '100%',
        }}>
          <span style={{ color: '#dce8fa', fontSize: '13px', fontWeight: 600, lineHeight: '18px' }}>
            {graphProfile
              ? `Hola, ${graphProfile.displayName}`
              : 'Cargando perfil...'}
          </span>
          {graphProfile && (graphProfile.jobTitle || graphProfile.department) && (
            <span style={{ color: '#a8c0e0', fontSize: '11px', lineHeight: '16px' }}>
              {[graphProfile.jobTitle, graphProfile.department].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'help',
      text: 'Ayuda',
      iconProps: { iconName: 'Help' },
      buttonStyles: ACTION_BTN_STYLES,
    },
    {
      key: 'settings',
      text: 'Configuración',
      iconProps: { iconName: 'Settings' },
      buttonStyles: ACTION_BTN_STYLES,
    },
  ];

  return (
    <div style={{
      backgroundColor: '#1b3a6b',
      boxShadow: '0 2px 6px rgba(0,0,0,0.30)',
    }}>
      <CommandBar
        items={items}
        farItems={farItems}
        styles={{ root: { backgroundColor: '#1b3a6b', padding: '0 8px', height: 48 } }}
      />
    </div>
  );
};

export default Header;

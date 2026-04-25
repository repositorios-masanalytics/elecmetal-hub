import * as React from 'react';
// DIAGNOSTIC: import { Globe20Regular, QuestionCircle20Regular, Settings20Regular } from '@fluentui/react-icons';
import { IGraphUserProfile } from './IHelloWorldProps';

export interface IHeaderProps {
  graphProfile: IGraphUserProfile | undefined;
}

const BTN_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '0 12px', height: '100%',
  background: 'transparent', border: 'none',
  color: '#dce8fa', cursor: 'pointer', fontSize: 13,
};

const Header: React.FC<IHeaderProps> = ({ graphProfile }) => {
  return (
    <header style={{
      backgroundColor: '#1b3a6b',
      boxShadow: '0 2px 6px rgba(0,0,0,0.30)',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', height: '100%' }}>
        {/* DIAGNOSTIC: <Globe20Regular style={{ color: '#c8d8f0' }} /> */}
        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>ME Elecmetal HUB</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 16px', height: '100%',
      }}>
        <span style={{ color: '#dce8fa', fontSize: 13, fontWeight: 600, lineHeight: '18px' }}>
          {graphProfile ? `Hola, ${graphProfile.displayName}` : 'Cargando perfil...'}
        </span>
        {graphProfile && (graphProfile.jobTitle || graphProfile.department) && (
          <span style={{ color: '#a8c0e0', fontSize: 11, lineHeight: '16px' }}>
            {[graphProfile.jobTitle, graphProfile.department].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      <button style={BTN_STYLE}>
        {/* DIAGNOSTIC: <QuestionCircle20Regular /> */}
        <span>Ayuda</span>
      </button>

      <button style={BTN_STYLE}>
        {/* DIAGNOSTIC: <Settings20Regular /> */}
        <span>Configuración</span>
      </button>
    </header>
  );
};

export default Header;

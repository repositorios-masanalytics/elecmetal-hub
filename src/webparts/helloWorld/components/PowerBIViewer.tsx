import * as React from 'react';

export interface IPowerBIViewerProps {
  reportId: string;
  embedUrl: string;
  tenantId: string;
  title?: string;
}

const PowerBIViewer: React.FC<IPowerBIViewerProps> = ({ embedUrl, tenantId, title }) => {
  if (!embedUrl) return null;

  const src = `${embedUrl}&autoAuth=true&ctid=${tenantId}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {title && (
        <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #edebe9' }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: '#1b3a6b' }}>
            {title}
          </span>
        </div>
      )}

      <iframe
        src={src}
        allowFullScreen={true}
        frameBorder="0"
        style={{ flex: 1, width: '100%', minHeight: '75vh', border: 'none' }}
        title={title}
      />

    </div>
  );
};

export default PowerBIViewer;

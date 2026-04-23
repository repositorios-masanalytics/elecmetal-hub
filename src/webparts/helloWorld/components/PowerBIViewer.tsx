import * as React from 'react';
import { useState, useEffect } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { Spinner } from '@fluentui/react-components';
import { EmbedMode, EmbedTokenService } from '../services/EmbedTokenService';

export interface IPowerBIViewerProps {
  reportId:           string;
  embedUrl:           string;
  datasetId:          string;
  tenantId:           string;
  title?:             string;
  embedMode:          EmbedMode;
  embedTokenService?: EmbedTokenService;
}

type TokenStatus = 'loading' | 'ready' | 'error';

const PowerBIViewer: React.FC<IPowerBIViewerProps> = ({
  reportId, embedUrl, datasetId, tenantId, title,
  embedMode, embedTokenService,
}) => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [accessToken, setAccessToken] = useState('');
  const [errorMsg,    setErrorMsg]    = useState('');

  useEffect(() => {
    if (embedMode !== 'app') return;

    if (!embedTokenService) {
      setErrorMsg('EmbedTokenService no configurado. Verificá "URL de Azure Function" en la config del webpart.');
      setTokenStatus('error');
      return;
    }

    setTokenStatus('loading');
    embedTokenService.getEmbedToken(reportId, datasetId)
      .then(result => {
        setAccessToken(result.token);
        setTokenStatus('ready');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setTokenStatus('error');
      });
  }, [reportId, datasetId, embedMode]);

  if (!embedUrl) return null;

  const titleBar = title ? (
    <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #edebe9' }}>
      <span style={{ fontSize: 20, fontWeight: 600, color: '#1b3a6b' }}>{title}</span>
    </div>
  ) : null;

  // ── User-Owns-Data: iframe con autoAuth (comportamiento original intacto) ──

  if (embedMode === 'user') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {titleBar}
        <iframe
          src={`${embedUrl}&autoAuth=true&ctid=${tenantId}`}
          allowFullScreen={true}
          frameBorder="0"
          style={{ flex: 1, width: '100%', minHeight: '75vh', border: 'none' }}
          title={title}
        />
      </div>
    );
  }

  // ── App-Owns-Data: powerbi-client-react con EmbedToken ──

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {titleBar}

      {tokenStatus === 'loading' && (
        <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Spinner size="small" />
          <span style={{ fontSize: 14, color: '#605e5c' }}>Generando embed token...</span>
        </div>
      )}

      {tokenStatus === 'error' && (
        <div style={{ padding: 24, color: '#d13438', fontSize: 14 }}>
          Error al obtener embed token: {errorMsg}
        </div>
      )}

      {tokenStatus === 'ready' && (
        <div style={{ flex: 1, width: '100%', minHeight: '75vh' }}>
          {/* Inyectar clase CSS para que PowerBIEmbed llene el contenedor */}
          <style>{'.pbi-embed-fill { width: 100%; height: 75vh; }'}</style>
          <PowerBIEmbed
            embedConfig={{
              type:        'report',
              id:          reportId,
              embedUrl:    embedUrl,
              accessToken: accessToken,
              tokenType:   models.TokenType.Embed,
              settings: {
                panes: {
                  filters:        { expanded: false, visible: false },
                  pageNavigation: { visible: false },
                },
              },
            }}
            cssClassName="pbi-embed-fill"
          />
        </div>
      )}
    </div>
  );
};

export default PowerBIViewer;

import React, { useState, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import './PlantUMLRenderer.css';

// PlantUML custom Base64 character mapping
const PUML_ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function encode6bit(b) {
  if (b >= 0 && b < 64) {
    return PUML_ALPHA[b];
  }
  return '?';
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return (
    encode6bit(c1 & 0x3F) +
    encode6bit(c2 & 0x3F) +
    encode6bit(c3 & 0x3F) +
    encode6bit(c4 & 0x3F)
  );
}

function encode64(data) {
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data[i], data[i + 1], 0);
    } else if (i + 1 === data.length) {
      r += append3bytes(data[i], 0, 0);
    } else {
      r += append3bytes(data[i], data[i + 1], data[i + 2]);
    }
  }
  return r;
}

/** Wrap raw markup with matching @start/@end tags when authors omit them. */
function normalizePlantUmlSource(code) {
  let puml = code.trim();
  const startMatch = puml.match(/@start(\w+)/i);
  const endMatch = puml.match(/@end(\w+)/i);

  if (!startMatch) {
    puml = `@startuml\n${puml}`;
    if (!endMatch) {
      puml = `${puml}\n@enduml`;
    }
    return puml;
  }

  if (!endMatch) {
    const kind = startMatch[1].toLowerCase();
    puml = `${puml}\n@end${kind}`;
  }

  return puml;
}

export function PlantUMLRenderer({ code }) {
  const [imgUrl, setImgUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function generateUrl() {
      try {
        setLoading(true);
        setError(null);
        
        const puml = normalizePlantUmlSource(code);

        // 1. Text to UTF-8 Bytes
        const encoder = new TextEncoder();
        const data = encoder.encode(puml);

        let rawDeflate;
        // 2. Compress via Web API CompressionStream
        if (typeof CompressionStream !== 'undefined') {
          try {
            // First try raw deflate (supported in modern browsers)
            const stream = new Blob([data]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream('deflate-raw'));
            const response = new Response(compressedStream);
            const buffer = await response.arrayBuffer();
            rawDeflate = new Uint8Array(buffer);
          } catch (e) {
            // Fallback to standard deflate (zlib format) and slice zlib header/footer
            const stream = new Blob([data]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
            const response = new Response(compressedStream);
            const buffer = await response.arrayBuffer();
            const compressedData = new Uint8Array(buffer);
            // Slice off 2-byte zlib header (0x78 0x9c etc.) and 4-byte Adler32 checksum
            rawDeflate = compressedData.slice(2, -4);
          }
        } else {
          // If browser is extremely old, use a simple hex representation or fail gracefully
          throw new Error('Web CompressionStream API not supported in this browser.');
        }

        // 3. Custom Base64 Encoding
        const encoded = encode64(rawDeflate);

        if (active) {
          setImgUrl(`https://www.plantuml.com/plantuml/svg/${encoded}`);
        }
      } catch (err) {
        console.error('PlantUML rendering error:', err);
        if (active) {
          setError(err.message || 'Failed to render UML diagram');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    generateUrl();
    return () => {
      active = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="puml-container puml-container--loading">
        <div className="puml-spinner"></div>
        <span className="puml-loading-text">Generating system architecture diagram...</span>
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className="puml-container puml-container--error">
        <div className="puml-error-header">
          <strong>⚠️ Diagram Render Fallback</strong>
          <span className="puml-badge">Source</span>
        </div>
        <p className="puml-error-hint">
          Offline or CompressionStream error. You can still view the raw architecture markup below:
        </p>
        <pre className="puml-raw-code"><code>{code}</code></pre>
      </div>
    );
  }

  return (
    <div className="puml-container">
      <div className="puml-header">
        <div className="puml-header-left">
          <div className="puml-indicator-dot"></div>
          <strong>Interactive Architecture Flow</strong>
        </div>
        <div className="puml-header-right">
          <span className="puml-badge">PlantUML Vector SVG</span>
          <a
            href={imgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="puml-zoom-btn"
            title="Open SVG in new tab to zoom/inspect"
          >
            <Maximize2 size={14} /> Zoom
          </a>
        </div>
      </div>

      <div className="puml-diagram-canvas">
        <img
          src={imgUrl}
          alt="System Architecture Diagram"
          className="puml-image"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default PlantUMLRenderer;

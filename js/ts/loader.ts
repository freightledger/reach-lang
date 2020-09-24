import { Connector } from "./shared";

export type ConnectorMode =
  'ETH-test-dockerized-geth' |
  'ETH-test-embedded-ganache' |
  'FAKE-test-embedded-mock' |
  'ALGO-test-dockerized-algod';

// Order is significant, earlier = default for shared prefix
// e.g. ETH defaults to ETH-test-dockerized-geth
const knownConnectorModes: Array<ConnectorMode> = [
  'ETH-test-dockerized-geth',
  'ETH-test-embedded-ganache',
  'FAKE-test-embedded-mock',
  'ALGO-test-dockerized-algod',
];

function isKnownConnector(s: string): s is Connector {
  return (s === 'ETH' || s === 'ALGO' || s === 'FAKE');
}

const connectorModeDefaults: {[key: string]: ConnectorMode} = {};

// Populate connectorModeDefaults
for (const knownConnectorMode of knownConnectorModes) {
  let prefix: string | null = null;
  for (const piece of knownConnectorMode.split('-')) {
    prefix = prefix ? `${prefix}-${piece}` : piece;
    if (!connectorModeDefaults[prefix]) {
      connectorModeDefaults[prefix] = knownConnectorMode;
    }
  }
}

export function canonicalizeConnectorMode(connectorMode: string): ConnectorMode {
  const canonicalized = connectorModeDefaults[connectorMode];
  if (canonicalized) {
    return canonicalized;
  } else {
    throw Error(`Unrecognized REACH_CONNECTOR_MODE=${connectorMode}`);
  }
}

export function getConnectorMode(): ConnectorMode {
  const connectorMode = process.env.REACH_CONNECTOR_MODE || 'ETH';
  return canonicalizeConnectorMode(connectorMode);
}

// The connectorMode arg is optional;
// It will use REACH_CONNECTOR_MODE if 0 args.
export function getConnector(connectorMode?: string): Connector {
  connectorMode = connectorMode || getConnectorMode();
  const connector = connectorMode.split('-')[0];
  if (isKnownConnector(connector)) {
    return connector;
  } else {
    throw Error(`impossible: unknown connector: ${connector}`);
  }
}

// XXX make an interface for Stdlib, return Promise<Stdlib>
// The connectorMode arg is optional;
// It will use REACH_CONNECTOR_MODE if 0 args.
export async function loadStdlib(connectorMode?: string): Promise<any> {
  connectorMode = connectorMode ?
    canonicalizeConnectorMode(connectorMode) :
    getConnectorMode();
  const connector = getConnector(connectorMode);
  const module = `./${connector}`;
  try {
    return await import(module);
  } catch (e) {
    try {
      return await import(`${module}.js`);
    } catch (e) {
      return await import(`${module}.mjs`);
    }
  }
}
import React, { useState, useEffect } from 'react';
import { AqlTerminal } from './components/AqlTerminal';
import { TraceGraph } from './components/TraceGraph';
import { ClusteringEngine } from './utils/ClusteringEngine';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'terminal'>('graph');
  const [graphData, setGraphData] = useState<any>(null);
  const clusteringEngine = new ClusteringEngine();

  useEffect(() => {
    fetch('/api/trace?fingerprint=latest')
      .then(res => res.json())
      .then(data => {
        const clustered = clusteringEngine.cluster(data.nodes || [], data.edges || []);
        setGraphData(clustered);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="nav-bar" style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="nav-brand" style={{ fontSize: '14px', fontWeight: 800, color: '#22d3ee' }}>
          AFEN <small style={{ fontWeight: 700, fontSize: '11px', color: '#d4d4d4' }}>Universal Debugging Intelligence</small>
        </div>
        <div className="nav-tabs" style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setActiveTab('graph')} style={{ background: activeTab === 'graph' ? '#1e2a2a' : 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}>Error Graph</button>
          <button onClick={() => setActiveTab('terminal')} style={{ background: activeTab === 'terminal' ? '#1e2a2a' : 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}>AQL Terminal</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '22px' }}>
        {activeTab === 'graph' && graphData && <TraceGraph nodes={graphData.nodes} edges={graphData.edges} />}
        {activeTab === 'terminal' && <AqlTerminal />}
        {activeTab === 'graph' && !graphData && <div style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Loading trace data...</div>}
      </div>
    </div>
  );
};

export default App;
import React, { useState, useRef, useEffect } from 'react';

export const AqlTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    const executeQuery = async (query: string) => {
        setOutput((prev: string[]) => [...prev, `> ${query}`]);
        try {
            const res = await fetch('/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setOutput((prev: string[]) => [...prev, JSON.stringify(data, null, 2)]);
        } catch (err: any) {
            setOutput((prev: string[]) => [...prev, `Error: ${err.message}`]);
        }
        setHistory((prev: string[]) => [...prev, query]);
        setHistoryIndex(-1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        executeQuery(input.trim());
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div style={{ background: '#0d0d0d', border: '1px solid #242424', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #242424', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>
                <i className="codicon codicon-terminal" style={{ marginRight: '8px' }}></i> AQL REPL
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.6 }}>
                {output.map((line: string, i: number) => (
                    <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: '4px', color: line.startsWith('>') ? '#22d3ee' : '#d4d4d4' }}>{line}</div>
                ))}
            </div>
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #242424', padding: '12px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#22d3ee', fontFamily: 'monospace' }}>$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="SELECT * FROM errors LIMIT 10"
                    style={{ flex: 1, background: '#0f0f0f', border: 'none', color: '#d4d4d4', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#171717', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '4px 12px', color: '#d4d4d4', cursor: 'pointer' }}>Execute</button>
            </form>
        </div>
    );
};
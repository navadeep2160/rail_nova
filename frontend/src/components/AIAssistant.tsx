import { useState, useEffect } from 'react';
import { Bot, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface Suggestion {
    id: string;
    train_id: string;
    action: string;
    reason: string;
    confidence: number;
    predicted_effect?: string;
    actions?: string[];
}

import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

export default function AIAssistant() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        socket.on('state_update', (data: any) => {
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        });

        return () => {
            socket.off('state_update');
        };
    }, []);

    const handleAction = (sugId: string, action: string) => {
        console.log(`Applying action ${action} for suggestion ${sugId}`);
        // In real app, emit back to server
        // socket.emit('apply_action', { id: sugId, action });
    };

    return (
        <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden flex-1 min-h-0">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-sm">AI Copilot</h3>
                </div>
                {suggestions.length > 0 && (
                    <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full animate-pulse">
                        {suggestions.length} Active
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {suggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center gap-2">
                        <Sparkles className="w-8 h-8 opacity-20" />
                        <p className="text-sm">System Normal. <br />AI Monitoring Active...</p>
                    </div>
                ) : (
                    suggestions.map(s => (
                        <div key={s.id} className="bg-background border border-border rounded-lg p-3 shadow-sm relative overflow-hidden group">
                            {/* Confidence Stripe */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ backgroundColor: s.confidence > 0.9 ? '#ef4444' : s.confidence > 0.8 ? '#f97316' : '#3b82f6' }}
                            />

                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-foreground">{s.action}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{Math.round(s.confidence * 100)}% Conf</span>
                                </div>

                                <p className="text-xs text-muted-foreground mb-2">{s.reason}</p>

                                {s.predicted_effect && (
                                    <div className="flex items-start gap-1.5 text-xs text-blue-400/90 bg-blue-950/30 p-2 rounded mb-3">
                                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span>{s.predicted_effect}</span>
                                    </div>
                                )}

                                {s.actions && s.actions.length > 0 ? (
                                    <div className="grid gap-2">
                                        {s.actions.map((act, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAction(s.id, act)}
                                                className="flex items-center justify-between w-full text-xs bg-muted hover:bg-muted/80 p-2 rounded transition-colors text-left"
                                            >
                                                <span>{act}</span>
                                                <ArrowRight className="w-3 h-3 opacity-50" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white p-2 rounded font-medium flex items-center justify-center gap-2"
                                        onClick={() => handleAction(s.id, s.action)}
                                    >
                                        <CheckCircle className="w-3 h-3" /> Execute
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

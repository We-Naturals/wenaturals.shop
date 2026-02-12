import React, { useState, useEffect } from 'react';
import { History, Save, RotateCcw, Trash2, Clock, Check } from "lucide-react";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface HistoryManagerProps {
    onClose?: () => void;
}

export const HistoryManager = ({ onClose }: HistoryManagerProps) => {
    const {
        snapshots,
        loadSnapshots,
        saveSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        isSnapshotLoading
    } = useThemeEditorStore();

    const [newSnapshotName, setNewSnapshotName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadSnapshots();
    }, []);

    const handleCreateSnapshot = async () => {
        if (!newSnapshotName.trim()) return;
        setIsCreating(true);
        await saveSnapshot(newSnapshotName);
        setNewSnapshotName('');
        setIsCreating(false);
    };

    const handleRestore = async (snapshot: any) => {
        if (confirm(`Are you sure you want to restore "${snapshot.snapshot_name}"? This will overwrite your current unsaved changes.`)) {
            await restoreSnapshot(snapshot);
            if (onClose) onClose();
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this snapshot?')) {
            await deleteSnapshot(id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white w-full max-w-md border-l border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Version History</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-xs text-zinc-500 hover:text-white transition-colors">
                        Close
                    </button>
                )}
            </div>

            {/* Create Snapshot */}
            <div className="p-4 border-b border-white/10 space-y-3 bg-zinc-900/30">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Create New Version</label>
                <div className="flex gap-2">
                    <input
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        placeholder="e.g. 'Before Sales Update'"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                    />
                    <button
                        onClick={handleCreateSnapshot}
                        disabled={!newSnapshotName.trim() || isCreating || isSnapshotLoading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px]"
                    >
                        {isCreating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Snapshot List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isSnapshotLoading && snapshots.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
                    </div>
                ) : snapshots.length === 0 ? (
                    <div className="text-center py-12 text-zinc-600">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No snapshots yet.</p>
                        <p className="text-[10px] mt-1">Create one to backup your theme.</p>
                    </div>
                ) : (
                    snapshots.map((snapshot) => (
                        <div
                            key={snapshot.id}
                            className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-200">{snapshot.snapshot_name}</h3>
                                    <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRestore(snapshot)}
                                        className="p-1.5 text-zinc-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                                        title="Restore this version"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(snapshot.id, e)}
                                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                        title="Delete snapshot"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

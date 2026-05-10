import React, { useState, useEffect } from 'react';
import { Network, Plus, FileText, ChevronLeft, Download, Trash2, Brain, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import mindMapService from '../../services/mindMapService';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import MindMapComponent from '../../components/mind-map/MindMapComponent';
import Select from '../../components/common/Select';
import Model from '../../components/common/Model';
import Button from '../../components/common/Button';
import { ReactFlowProvider } from 'reactflow';
import toast from 'react-hot-toast';
import moment from 'moment';

const MindMapPage = () => {
    const [mindMaps, setMindMaps] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMindMap, setSelectedMindMap] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState('');
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mapToDelete, setMapToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mapsRes, docsRes] = await Promise.all([
                mindMapService.getMindMaps(),
                documentService.getDocuments()
            ]);
            setMindMaps(mapsRes.data || []);
            setDocuments(docsRes || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedDoc) {
            toast.error('Please select a document');
            return;
        }

        setGenerating(true);
        try {
            const res = await mindMapService.generateMindMap(selectedDoc);
            toast.success('Mind Map generated!');
            setMindMaps([res.data, ...mindMaps]);
            setSelectedMindMap(res.data);
        } catch (error) {
            toast.error(error.message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const openDeleteModal = (map, e) => {
        e.stopPropagation();
        setMapToDelete(map);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!mapToDelete) return;
        setDeleting(true);
        try {
            await mindMapService.deleteMindMap(mapToDelete._id);
            setMindMaps(mindMaps.filter(m => m._id !== mapToDelete._id));
            if (selectedMindMap?._id === mapToDelete._id) setSelectedMindMap(null);
            toast.success('Deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setDeleting(false);
            setMapToDelete(null);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                            <Network className="text-white" size={24} />
                        </div>
                        Concept Mind Maps
                    </h1>
                    <p className="text-muted-foreground max-w-2xl font-sans">
                        Transform complex documents into interactive visual graphs to understand relationships better.
                    </p>
                </div>
                {!selectedMindMap && mindMaps.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{mindMaps.length} Maps Generated</span>
                    </div>
                )}
            </div>

            {selectedMindMap ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-2xl border border-border">
                        <button 
                            onClick={() => setSelectedMindMap(null)}
                            className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
                        >
                            <ChevronLeft size={18} /> Back to Library
                        </button>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-bold text-foreground">{selectedMindMap.title}</h2>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <FileText size={12} /> {selectedMindMap.document?.title}
                            </p>
                        </div>
                        <div className="w-32" /> {/* Spacer for balance */}
                    </div>
                    
                    <ReactFlowProvider>
                        <MindMapComponent 
                            initialNodes={selectedMindMap.graphData.nodes} 
                            initialEdges={selectedMindMap.graphData.edges} 
                        />
                    </ReactFlowProvider>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Generator Section */}
                    <div className="relative bg-card border-2 border-border rounded-3xl p-6 sm:p-10 shadow-warm hover:border-primary/30 transition-all duration-500 group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Generate New Map</h2>
                                    <p className="text-sm text-muted-foreground font-sans">Choose a document to extract a concept hierarchy</p>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6 items-end">
                                <div className="flex-1 w-full">
                                    <Select 
                                        placeholder="Select a document from your library..."
                                        options={documents.filter(d => d.status === 'ready').map(doc => ({
                                            value: doc._id,
                                            label: doc.title
                                        }))}
                                        value={selectedDoc}
                                        onChange={setSelectedDoc}
                                    />
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={generating || !selectedDoc}
                                    variant="primary"
                                    className="w-full lg:w-auto h-[52px] px-10 shadow-glow-primary"
                                >
                                    {generating ? <><Spinner size="sm" /> Analyzing Document...</> : <><Network size={20} /> Create Mind Map</>}
                                </Button>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full -ml-24 -mb-24 blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />
                    </div>

                    {/* Library Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Brain size={20} className="text-primary" /> Your Map Library
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mindMaps.map(map => (
                                <div 
                                    key={map._id}
                                    onClick={() => setSelectedMindMap(map)}
                                    className="group relative bg-card/60 glass border border-border hover:border-primary/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
                                            <Network size={24} />
                                        </div>
                                        <button 
                                            onClick={(e) => openDeleteModal(map, e)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {map.title}
                                    </h3>
                                    
                                    <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-sans font-medium">
                                            <FileText size={14} className="text-primary/60" />
                                            <span className="truncate">{map.document?.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-sans">
                                            <Clock size={14} />
                                            <span>Created {moment(map.createdAt).fromNow()}</span>
                                        </div>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-transparent group-hover:from-primary/5 transition-all duration-500 pointer-events-none" />
                                </div>
                            ))}

                            {mindMaps.length === 0 && !loading && (
                                <div className="md:col-span-2 lg:col-span-3 py-24 text-center bg-card/30 border-2 border-dashed border-border/50 rounded-3xl">
                                    <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Network className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">No Visual Maps Found</h3>
                                    <p className="text-muted-foreground font-sans max-w-xs mx-auto">
                                        Generate your first mind map above to see a visual breakdown of your documents.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Deletion Confirmation Model */}
            <Model
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Mind Map"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Are you absolutely sure?</h4>
                            <p className="text-xs text-muted-foreground font-sans">This will permanently delete the mind map for <span className="font-bold text-foreground">"{mapToDelete?.title}"</span>. This action cannot be undone.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1"
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmDelete}
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-white shadow-glow-destructive"
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Yes, Delete Map'}
                        </Button>
                    </div>
                </div>
            </Model>
        </div>
    );
};

export default MindMapPage;

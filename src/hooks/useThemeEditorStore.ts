import { create } from 'zustand';
import { createClient } from '@/lib/supabase';

interface ThemeEditorState {
    cmsData: any;
    isSaving: boolean;
    isLoading: boolean;
    activeTab: string;
    snapshots: any[];
    isSnapshotLoading: boolean;

    // Actions
    setCmsData: (data: any) => void;
    setActiveTab: (tab: string) => void;
    updateSection: (sectionKey: string, data: any) => void;
    updateField: (sectionKey: string, fieldKey: string, value: any) => void;
    deepUpdateField: (sectionKey: string, subSectionKey: string, fieldKey: string, value: any) => void;
    moveSection: (index: number, direction: 'up' | 'down') => void;
    toggleSectionVisibility: (sectionKey: string) => void;
    addNavItem: (type: 'header' | 'footer') => void;
    updateNavItem: (type: 'header' | 'footer', index: number, field: string, value: any) => void;
    removeNavItem: (type: 'header' | 'footer', index: number) => void;
    addFaqItem: () => void;
    updateFaqItem: (index: number, field: string, value: any) => void;
    removeFaqItem: (index: number) => void;
    addBlock: (page: string, type: string) => void;
    updateBlock: (page: string, blockId: string, field: string, value: any) => void;
    moveBlock: (page: string, index: number, direction: 'up' | 'down') => void;
    removeBlock: (page: string, blockId: string) => void;
    loadData: () => Promise<void>;
    saveData: () => Promise<{ success: boolean; error?: string }>;
    loadSnapshots: () => Promise<void>;
    saveSnapshot: (name: string) => Promise<{ success: boolean; error?: string }>;
    restoreSnapshot: (snapshot: any) => Promise<void>;
    deleteSnapshot: (id: string) => Promise<void>;
}

export const useThemeEditorStore = create<ThemeEditorState>((set, get) => ({
    cmsData: null,
    isSaving: false,
    isLoading: false,
    activeTab: 'design',
    snapshots: [],
    isSnapshotLoading: false,

    setCmsData: (cmsData) => set({ cmsData }),
    setActiveTab: (activeTab) => set({ activeTab }),

    updateSection: (sectionKey, data) => set((state) => ({
        cmsData: {
            ...state.cmsData,
            [sectionKey]: data
        }
    })),

    updateField: (sectionKey, fieldKey, value) => set((state) => ({
        cmsData: {
            ...state.cmsData,
            [sectionKey]: {
                ...(state.cmsData?.[sectionKey] || {}),
                [fieldKey]: value
            }
        }
    })),

    deepUpdateField: (sectionKey, subSectionKey, fieldKey, value) => set((state) => ({
        cmsData: {
            ...state.cmsData,
            [sectionKey]: {
                ...(state.cmsData?.[sectionKey] || {}),
                [subSectionKey]: {
                    ...(state.cmsData?.[sectionKey]?.[subSectionKey] || {}),
                    [fieldKey]: value
                }
            }
        }
    })),

    moveSection: (index, direction) => set((state) => {
        const newLayout = [...(state.cmsData?.homepage_layout || [])];
        if (direction === 'up' && index > 0) {
            [newLayout[index], newLayout[index - 1]] = [newLayout[index - 1], newLayout[index]];
        } else if (direction === 'down' && index < newLayout.length - 1) {
            [newLayout[index], newLayout[index + 1]] = [newLayout[index + 1], newLayout[index]];
        }
        return {
            cmsData: {
                ...state.cmsData,
                homepage_layout: newLayout
            }
        };
    }),

    toggleSectionVisibility: (sectionKey) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newData = { ...prev };

        if (sectionKey === 'hero') {
            newData.content_homepage = {
                ...prev.content_homepage,
                hero: { ...prev.content_homepage?.hero, visible: prev.content_homepage?.hero?.visible === false ? true : false }
            };
        } else {
            const contentKeyMapping: Record<string, string> = {
                philosophy: 'content_philosophy',
                rituals: 'content_testimonials',
                shorts: 'youtube_shorts',
                featured: 'content_featured',
                journal: 'content_journal',
                categories: 'content_categories',
                marquee_top: 'content_marquee_top',
                marquee_bottom: 'content_marquee_bottom'
            };

            const contentKey = contentKeyMapping[sectionKey];
            if (contentKey) {
                newData[contentKey] = {
                    ...prev[contentKey],
                    visible: prev[contentKey]?.visible === false ? true : false
                };
            }
        }

        return { cmsData: newData };
    }),

    addNavItem: (type) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newNav = { ...(prev.content_navigation || {}) };
        const list = [...(newNav[type] || [])];
        list.push({ label: 'New Link', href: '/', visible: true });
        newNav[type] = list;

        return { cmsData: { ...prev, content_navigation: newNav } };
    }),

    updateNavItem: (type, index, field, value) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newNav = { ...(prev.content_navigation || {}) };
        const list = [...(newNav[type] || [])];
        if (list[index]) {
            list[index] = { ...list[index], [field]: value };
        }
        newNav[type] = list;

        return { cmsData: { ...prev, content_navigation: newNav } };
    }),

    removeNavItem: (type, index) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newNav = { ...(prev.content_navigation || {}) };
        const list = [...(newNav[type] || [])];
        list.splice(index, 1);
        newNav[type] = list;

        return { cmsData: { ...prev, content_navigation: newNav } };
    }),

    addFaqItem: () => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const faq = { ...(newPages.faq || {}) };
        const items = [...(faq.items || [])];
        items.push({ question: 'New Question', answer: '', visible: true });
        faq.items = items;
        newPages.faq = faq;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    updateFaqItem: (index, field, value) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const faq = { ...(newPages.faq || {}) };
        const items = [...(faq.items || [])];
        if (items[index]) {
            items[index] = { ...items[index], [field]: value };
        }
        faq.items = items;
        newPages.faq = faq;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    removeFaqItem: (index) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const faq = { ...(newPages.faq || {}) };
        const items = [...(faq.items || [])];
        items.splice(index, 1);
        faq.items = items;
        newPages.faq = faq;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    addBlock: (page, type) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const pageData = { ...(newPages[page] || {}) };
        const blocks = [...(pageData.blocks || [])];

        const newBlock = {
            id: crypto.randomUUID(),
            type,
            content: type === 'rich_text' ? { html: '' } : type === 'hero' ? { heading: '', subheading: '', image: '' } : { heading: '', text: '', image: '' }
        };

        blocks.push(newBlock);
        pageData.blocks = blocks;
        newPages[page] = pageData;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    updateBlock: (page, blockId, field, value) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const pageData = { ...(newPages[page] || {}) };
        const blocks = [...(pageData.blocks || [])].map(b => {
            if (b.id === blockId) {
                return { ...b, content: { ...b.content, [field]: value } };
            }
            return b;
        });

        pageData.blocks = blocks;
        newPages[page] = pageData;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    moveBlock: (page, index, direction) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const pageData = { ...(newPages[page] || {}) };
        const blocks = [...(pageData.blocks || [])];

        if (direction === 'up' && index > 0) {
            [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        }

        pageData.blocks = blocks;
        newPages[page] = pageData;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    removeBlock: (page, blockId) => set((state) => {
        const prev = state.cmsData;
        if (!prev) return state;

        const newPages = { ...(prev.content_pages || {}) };
        const pageData = { ...(newPages[page] || {}) };
        const blocks = [...(pageData.blocks || [])].filter(b => b.id !== blockId);

        pageData.blocks = blocks;
        newPages[page] = pageData;

        return { cmsData: { ...prev, content_pages: newPages } };
    }),

    loadData: async () => {
        set({ isLoading: true });
        const supabase = createClient();
        const keys = [
            'content_homepage',
            'content_global',
            'content_philosophy',
            'content_featured',
            'content_journal',
            'content_testimonials',
            'content_pages',
            'youtube_shorts',
            'content_categories',
            'content_design_system',
            'content_navigation',
            'content_marketing',
            'homepage_layout',
            'content_system',
            'content_ascension',
            'content_layout_spacing',
            'content_performance',
            'content_marquee_top',
            'content_marquee_bottom'
        ];

        const { data, error } = await supabase
            .from('site_config')
            .select('key, value')
            .in('key', keys);

        if (!error && data) {
            const newData: any = {};
            data.forEach((item: any) => {
                let val = item.value;
                if (!val) return;

                // Migration logic from ThemePage.tsx
                if (item.key === 'youtube_shorts' && Array.isArray(val)) {
                    val = { items: val, visible: true, header_visible: true, marquee_visible: true };
                }
                if (item.key === 'content_testimonials' && Array.isArray(val)) {
                    val = { items: val, visible: true, header_visible: true };
                }
                newData[item.key] = val;
            });
            set({ cmsData: newData });
        }
        set({ isLoading: false });
    },

    saveData: async () => {
        const { cmsData } = get();
        if (!cmsData) return { success: false, error: 'No data to save' };

        set({ isSaving: true });
        const supabase = createClient();

        const updates = Object.entries(cmsData).map(([key, value]) => ({
            key,
            value
        })).filter(u => u.value !== undefined);

        const { error } = await supabase
            .from('site_config')
            .upsert(updates);

        set({ isSaving: false });

        if (error) {
            console.error('Error saving theme:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    loadSnapshots: async () => {
        set({ isSnapshotLoading: true });
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from('site_snapshots')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            set({ snapshots: data || [] });
        } catch (error) {
            console.error('Error loading snapshots:', error);
        } finally {
            set({ isSnapshotLoading: false });
        }
    },

    saveSnapshot: async (name: string) => {
        const { cmsData } = get();
        if (!cmsData) return { success: false, error: 'No data to snapshot' };

        set({ isSnapshotLoading: true });
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('site_snapshots')
                .insert({
                    snapshot_name: name,
                    data: cmsData
                });

            if (error) throw error;

            // Reload snapshots list
            await get().loadSnapshots();
            return { success: true };
        } catch (error: any) {
            console.error('Error saving snapshot:', error);
            return { success: false, error: error.message };
        } finally {
            set({ isSnapshotLoading: false });
        }
    },

    restoreSnapshot: async (snapshot: any) => {
        if (!snapshot.data) return;

        // 1. Update local state
        set({ cmsData: snapshot.data, isLoading: true });

        // 2. Persist to live site_config immediately
        // We reuse the saveData logic but with the new data
        const supabase = createClient();
        const updates = Object.entries(snapshot.data).map(([key, value]) => ({
            key,
            value
        })).filter(u => u.value !== undefined);

        try {
            const { error } = await supabase
                .from('site_config')
                .upsert(updates);

            if (error) throw error;
        } catch (error) {
            console.error('Error restoring snapshot to live site:', error);
            // Optionally revert local state or show error
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSnapshot: async (id: string) => {
        set({ isSnapshotLoading: true });
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('site_snapshots')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            set(state => ({
                snapshots: state.snapshots.filter(s => s.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting snapshot:', error);
        } finally {
            set({ isSnapshotLoading: false });
        }
    }
}));

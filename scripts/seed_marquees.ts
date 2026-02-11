
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing to avoid package issues
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value.trim().replace(/["']/g, '');
            if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value.trim().replace(/["']/g, '');
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting Marquee Migration...');

    // 1. Fetch current layout
    const { data: layoutData, error: layoutError } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'homepage_layout')
        .single();

    if (layoutError && layoutError.code !== 'PGRST116') {
        console.error('Error fetching layout:', layoutError);
    }

    let layout = layoutData?.value || [
        'hero',
        'philosophy',
        'rituals',
        'shorts',
        'featured',
        'journal',
        'testimonials',
        'categories'
    ];

    console.log('Current Layout:', layout);

    let modified = false;

    // 2. Inject marquee_top if missing
    if (!layout.includes('marquee_top')) {
        const heroIndex = layout.indexOf('hero');
        if (heroIndex !== -1) {
            layout.splice(heroIndex + 1, 0, 'marquee_top');
        } else {
            layout.unshift('marquee_top');
        }
        modified = true;
        console.log('Added marquee_top');
    }

    // 3. Inject marquee_bottom if missing
    if (!layout.includes('marquee_bottom')) {
        const testimonialsIndex = layout.indexOf('testimonials');
        if (testimonialsIndex !== -1) {
            layout[testimonialsIndex] = 'marquee_bottom';
        } else {
            const catIndex = layout.indexOf('categories');
            if (catIndex !== -1) {
                layout.splice(catIndex, 0, 'marquee_bottom');
            } else {
                layout.push('marquee_bottom');
            }
        }
        modified = true;
        console.log('Added marquee_bottom');
    }

    if (modified) {
        const { error: updateError } = await supabase
            .from('site_config')
            .upsert({ key: 'homepage_layout', value: layout });

        if (updateError) console.error('Error updating layout:', updateError);
        else console.log('Successfully updated homepage_layout');
    } else {
        console.log('Layout is up to date.');
    }

    // 4. Upsert content configs
    const marqueeTopConfig = {
        visible: true,
        text: "WE NATURALS • PURE • POTENT • PROVEN •",
        duration: 35
    };

    const marqueeBottomConfig = {
        visible: true,
        text: "ORGANIC • SUSTAINABLE • CRUELTY-FREE • CLINICALLY PROVEN •",
        duration: 40
    };

    const { error: topError } = await supabase
        .from('site_config')
        .upsert({ key: 'content_marquee_top', value: marqueeTopConfig });

    if (topError) console.error('Error saving top marquee config:', topError);
    else console.log('Saved content_marquee_top');

    const { error: bottomError } = await supabase
        .from('site_config')
        .upsert({ key: 'content_marquee_bottom', value: marqueeBottomConfig });

    if (bottomError) console.error('Error saving bottom marquee config:', bottomError);
    else console.log('Saved content_marquee_bottom');

    console.log('Migration Complete.');
}

migrate();

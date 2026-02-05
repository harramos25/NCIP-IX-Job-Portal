
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Manually parse .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log('Could not load or parse .env file');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log('🔍 Testing Status Update Permission...');

    // 1. Fetch an application (any)
    const { data: apps, error: fetchError } = await supabase
        .from('applications')
        .select('id, status, full_name')
        .limit(1);

    if (fetchError) {
        console.error('❌ Fetch Error:', fetchError.message);
        return;
    }

    if (!apps || apps.length === 0) {
        console.log('⚠️ No applications found to test.');
        return;
    }

    const app = apps[0];
    console.log(`📝 Found App: ${app.full_name} (Status: ${app.status})`);

    // 2. Try to update it
    const newStatus = app.status === 'Viewed' ? 'Unread' : 'Viewed';
    console.log(`🔄 Attempting to update status to: ${newStatus}...`);

    const { data, error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', app.id)
        .select();

    if (updateError) {
        console.error('❌ UPDATE FAILED:', updateError.message);
    } else {
        // 3. Verify Persistence
        const { data: verifyApps } = await supabase
            .from('applications')
            .select('status')
            .eq('id', app.id)
            .single();

        if (verifyApps && verifyApps.status === newStatus) {
            console.log('✅ UPDATE CONFIRMED! (Status changed in DB)');
        } else {
            console.log('❌ UPDATE SILENTLY FAILED! (DB value did not change)');
            console.log('👉 RLS likely blocking write access.');
        }
    }
}

testUpdate();

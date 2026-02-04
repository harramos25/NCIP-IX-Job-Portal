
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env since we are running in node
const envFile = fs.readFileSync('.env', 'utf8');
const envConfig = envFile.split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
}, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBuckets() {
    console.log('Checking storage buckets...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error fetching buckets:', error.message);
    } else {
        console.log('Buckets found:', data.length);
        data.forEach(b => console.log(`- ${b.name} (public: ${b.public})`));

        const avatarsBucket = data.find(b => b.name === 'avatars');
        if (avatarsBucket) {
            console.log('✅ "avatars" bucket exists.');
        } else {
            console.log('❌ "avatars" bucket NOT found.');
        }
    }
}

checkBuckets();

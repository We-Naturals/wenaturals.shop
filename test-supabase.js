const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  const { data, error } = await supabase.from('site_config').select('key').limit(5);
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful! Found keys:', data);
  }
}

test();

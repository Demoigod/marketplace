
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase-config.js';

async function checkSchema() {
    console.log('Checking profiles table schema...');

    // Attempt to select one row to see structure
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('Profiles data sample:', data);
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot infer columns from data.');
        }
    }
}

checkSchema();

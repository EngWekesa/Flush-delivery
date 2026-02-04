import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://zsrjitljyqohyobszhsu.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImVlMTBmOTk5LTM5ZmUtNDIxNi1hMTdkLWUwMWQ1ZThlM2ZiOCJ9.eyJwcm9qZWN0SWQiOiJ6c3JqaXRsanlxb2h5b2JzemhzdSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4OTM2OTcyLCJleHAiOjIwODQyOTY5NzIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.5jPhGiKCtUR3yOQf4zIANk3UODRZ4CIWL8brUX9Iv2k';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
async function check() {
  const url = 'https://daxhownwlccpjpmnlgmt.supabase.co/rest/v1/products?select=*';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheGhvd253bGNjcGpwbW5sZ210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDg3NTQsImV4cCI6MjA5NTAyNDc1NH0.0Ua6pvyETgHGBtzjNxUEjxsJh0WqeyDOcihlv9LwYK8';
  
  console.log('Fetching products...');
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    
    const data = await res.json();
    console.log(`Success! Found ${data.length} products:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

check();

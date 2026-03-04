import fs from 'fs';
import readline from 'readline';

const locations = [
  { text: 'Downtown District', lat: 37.7749, lng: -122.4194 },
  { text: 'North Hills', lat: 37.8044, lng: -122.2711 },
  { text: 'Eastside Industrial', lat: 37.7337, lng: -122.4467 },
  { text: 'Riverside', lat: 37.7121, lng: -122.4034 },
  { text: 'West End', lat: 37.7833, lng: -122.4817 },
  { text: 'Central Park', lat: 37.7694, lng: -122.4862 },
  { text: 'South Bay', lat: 37.7249, lng: -122.3994 },
];

async function processData() {
  const fileStream = fs.createReadStream('./DisasterTweets.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const results = [];
  let isFirstLine = true;

  // Manual fast CSV parse for quoted text
  let rowStr = '';
  
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    rowStr += line + '\n';
    
    // basic check if we have matching quotes
    const quotesCount = (rowStr.match(/"/g) || []).length;
    if (quotesCount % 2 !== 0) {
      continue; // keep building row
    }

    // Now string is a full row
    const row = rowStr.trim();
    rowStr = '';
    
    if (!row) continue;
    
    // Splitting by comma, ignoring commas inside quotes
    const tokens = [];
    let currentToken = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        tokens.push(currentToken);
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    tokens.push(currentToken);
    
    if (tokens.length >= 13) {
      const username = tokens[1];
      const timestamp = tokens[2];
      const verifiedStr = tokens[3];
      const text = tokens[4].replace(/\n/g, ' ').trim();
      const tweet_id = tokens[11];
      const disaster_type = tokens[12];
      
      const loc = locations[Math.floor(Math.random() * locations.length)];
      
      const lat = loc.lat + (Math.random() * 0.04 - 0.02);
      const lng = loc.lng + (Math.random() * 0.04 - 0.02);

      let predicted_label = disaster_type.replace(/[\n\r]/g, '').trim();
      if (!predicted_label || predicted_label === 'None') predicted_label = 'Other';

      results.push({
        id: tweet_id || Math.random().toString(36).substring(2, 10),
        tweet_text: text,
        username: username,
        timestamp: new Date(timestamp).getTime() || Date.now() - Math.floor(Math.random() * 500000),
        latitude: lat,
        longitude: lng,
        locationName: loc.text,
        predicted_label: predicted_label,
        confidence_score: 80 + Math.random() * 20,
        severity_level: Math.floor(Math.random() * 5) + 1,
        isVerified: verifiedStr.toLowerCase() === 'true'
      });
      
      if (results.length >= 3000) break; // Limit payload
    }
  }

  // Shuffle for variety
  results.sort(() => Math.random() - 0.5);

  fs.mkdirSync('./src/data', { recursive: true });
  fs.writeFileSync('./src/data/tweets.json', JSON.stringify(results, null, 2));
  console.log(`Successfully processed ${results.length} real tweets to src/data/tweets.json`);
}

processData();

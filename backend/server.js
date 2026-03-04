import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Secret for JWT (Usually in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'disastersense-super-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize HTTP Server
const server = http.createServer(app);

// Initialize WebSocket Server for Real-Time Streaming
const wss = new WebSocketServer({ server });

// ==========================================
// 🗄️ IN-MEMORY MOCK DATABASE (Replaces PG for MVP Speed)
// ==========================================
import pool, { initDB } from './db.js';

let isPgConnected = false;
let tweetsData = [];
let usersData = [
    { id: 1, name: 'Admin User', email: 'admin@disastersense.com', password_hash: '123456', role: 'Admin' },
    { id: 2, name: 'Analyst Jane', email: 'jane@disastersense.com', password_hash: '123456', role: 'Analyst' }
];
let alertsData = [];

// Try booting Real PostgreSQL Database first
initDB().then(success => {
    isPgConnected = success;
    
    // Load Real CSV Data from disk for in-memory fallback seeding 
    try {
      const filePath = path.resolve('../src/data/tweets.json');
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        tweetsData = JSON.parse(rawData);
        console.log(`[Memory Fallback] Loaded ${tweetsData.length} tweets from offline storage.`);
      }
    } catch (error) {
      console.error("Failed to load initial tweet data:", error);
    }
});

// ==========================================
// 🔒 AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// ==========================================
// 🚀 REST API ROUTES
// ==========================================

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersData.find(u => u.email === email && u.password_hash === password);
    
    if (user) {
        const token = jwt.sign({ username: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const newUser = { id: usersData.length + 1, name, email, password_hash: password, role: 'Viewer' };
    usersData.push(newUser);
    res.json({ message: "User created" });
});

// --- ANALYTICS ---
// Uses Redis-like fast aggregation principles
app.get('/api/analytics/summary', (req, res) => {
  const totalTweets = tweetsData.length;
  const highSeverityCount = tweetsData.filter(t => t.severity_level >= 4).length;
  const verifiedCount = tweetsData.filter(t => t.isVerified).length;
  
  const typeCounts = tweetsData.reduce((acc, t) => {
    acc[t.predicted_label] = (acc[t.predicted_label] || 0) + 1;
    return acc;
  }, {});

  res.json({
    total_analyzed: totalTweets,
    high_risk_events: highSeverityCount,
    verified_reports: verifiedCount,
    disaster_distribution: typeCounts
  });
});

app.get('/api/analytics/trends', (req, res) => {
    // Mock trend line data for UI
    res.json([
        { time: '10:00', val: 0.1 },
        { time: '10:05', val: 0.4 },
        { time: '10:10', val: 0.8 },
        { time: '10:15', val: 0.5 },
        { time: '10:20', val: 0.9 },
    ]);
});

// --- TWEETS ---
app.get('/api/tweets', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const sorted = [...tweetsData].sort((a, b) => b.timestamp - a.timestamp);
  res.json(sorted.slice(0, limit));
});

app.get('/api/tweets/:id', (req, res) => {
    const tweet = tweetsData.find(t => t.id === req.params.id);
    if(tweet) res.json(tweet);
    else res.status(404).send('Not Found');
});

// --- GEO ---
app.get('/api/geo/markers', (req, res) => {
    // Only return lat/lng and label to save bandwidth
    const mapData = tweetsData.slice(0, 500).map(t => ({
        id: t.id,
        lat: t.latitude,
        lng: t.longitude,
        type: t.predicted_label,
        severity: t.severity_level
    }));
    res.json(mapData);
});

// --- ALERTS ---
app.get('/api/alerts', (req, res) => {
  res.json(alertsData);
});

app.post('/api/alerts/:id/ack', (req, res) => {
    const alertId = req.params.id;
    const alertIndex = alertsData.findIndex(a => a.id === alertId);
    if (alertIndex > -1) {
        alertsData[alertIndex].status = 'acknowledged';
        res.json({ success: true, alert: alertsData[alertIndex] });
    } else {
        res.status(404).send('Alert not found');
    }
});

app.post('/api/alerts/:id/broadcast', (req, res) => {
    const alertId = req.params.id;
    const alertIndex = alertsData.findIndex(a => a.id === alertId);
    if (alertIndex > -1) {
        // Log simulation of SMS Twilio integration / Cell Broadcast to people
        console.log(`[SMS WARNING GATEWAY] Broadcasting EMERGENCY ALERT: ${alertsData[alertIndex].message}`);
        alertsData[alertIndex].broadcasted = true;
        alertsData[alertIndex].broadcasted_at = Date.now();

        EMERGENCY_SERVICES.forEach(dept => {
            sendEmergencySMS(alertsData[alertIndex], dept);
        });

        res.json({ success: true, message: `Disaster SMS warning sent to operators and civilians in affected zone.` });
    } else {
        res.status(404).send('Alert not found');
    }
});


// ==========================================
// 🔌 WEB-SOCKETS (Streaming Gateway Service)
// ==========================================

// Mock ML Inference Pipeline Step
const mockMLInference = (rawTweet) => {
    // In a real env, this hits a Python gRPC/FastAPI microservice
    return {
        ...rawTweet,
        confidence_score: 85 + Math.random() * 15, // between 85-100 high confidence
        severity_level: Math.floor(Math.random() * 5) + 1, // 1-5
        ml_processed_at: Date.now()
    };
};

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Real SMS sending to emergency authorities using Twilio
const sendEmergencySMS = async (alert, contact) => {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}`;
    const smsBody = `🚨 DISASTERSENSE EMERGENCY ALERT 🚨\nAn AI-detected ${alert.severity === 5 ? 'CRITICAL' : 'HIGH'} Severity [${alert.type.toUpperCase()}] event requires immediate response.\nConfidence: ${alert.confidence}%\nLocation: ${alert.locationName}\nMap: ${mapsLink}`;

    console.log(`\n================== EMERGENCY SMS BROADCAST ==================`);
    console.log(`PREPARING TO SEND REAL SMS TO: ${contact.role} Hotline (${contact.phone})`);
    console.log(smsBody);
    console.log(`===========================================================\n`);

    if (twilioClient && process.env.TWILIO_FROM_PHONE) {
        try {
            const message = await twilioClient.messages.create({
                body: smsBody,
                from: process.env.TWILIO_FROM_PHONE,
                to: contact.phone
            });
            console.log(`✅ [TWILIO SUCCESS] Real SMS Sent to ${contact.phone}. Message SID: ${message.sid}`);
        } catch (error) {
            console.error(`❌ [TWILIO ERROR] Failed to send real SMS:`, error.message);
        }
    } else {
        console.log(`⚠️ [TWILIO SKIPPED] Twilio credentials not found in .env. Mock SMS logged instead.`);
    }
};

// Emergency Services Geo-Radius Mock Database
const EMERGENCY_SERVICES = [
    { role: 'Local Police Department Dispatch', phone: '+1-555-0199' },
    { role: 'Fire & Rescue Command', phone: '+1-555-0188' },
    { role: 'EMS & Ambulatory Services', phone: '+1-555-0177' }
];

// WebSocket Handler
wss.on('connection', (ws) => {
  console.log('[Streaming Gateway] New client connected');
  ws.send(JSON.stringify({ type: 'system:status', status: 'connected' }));

  let currentIndex = 0;
  
  // Simulated Ingestion Service fetching stream and pushing to Queue -> Processed by ML
  const streamInterval = setInterval(() => {
    if (currentIndex >= tweetsData.length) currentIndex = 0;
    
    // Simulate Raw Ingestion
    const rawTweet = tweetsData[currentIndex];
    
    // Simulate ML Classification Service
    const processedTweet = mockMLInference({
        ...rawTweet,
        id: Math.random().toString(36).substring(2, 10), // fresh stream ID
        timestamp: Date.now()
    });

    // 1. Broadcast to 'tweet:new' Channel
    ws.send(JSON.stringify({
      type: 'tweet:new',
      payload: processedTweet
    }));

    // Simulate Alerts Engine Service Trigger: 90% confidence + High/Critical severity
    if (processedTweet.severity_level >= 4 && processedTweet.confidence_score >= 90) {
      
      const newAlert = {
         id: 'ALT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
         message: `CRITICAL: ${processedTweet.predicted_label} crisis detected near ${processedTweet.locationName}`,
         type: processedTweet.predicted_label,
         severity: processedTweet.severity_level,
         locationName: processedTweet.locationName,
         lat: processedTweet.latitude,
         lng: processedTweet.longitude,
         confidence: Math.round(processedTweet.confidence_score),
         tweetText: processedTweet.tweet_text,
         tweetId: processedTweet.id,
         status: 'active',
         created_at: Date.now()
      };
      
      alertsData.unshift(newAlert);
      if (alertsData.length > 50) alertsData.pop(); // Keep array small

      // 2. Broadcast to 'alert:new' Channel (real-time UI update)
      ws.send(JSON.stringify({
         type: 'alert:new',
         payload: newAlert
      }));

      // 3. Trigger Automatic SMS Notification to Authorities Pipeline
      EMERGENCY_SERVICES.forEach(dept => {
          sendEmergencySMS(newAlert, dept);
      });
    }

    currentIndex++;
  }, 2500); // Poll rate

  ws.on('close', () => {
    console.log('[Streaming Gateway] Client disconnected');
    clearInterval(streamInterval);
  });
});

server.listen(port, () => {
  console.log(`
🚀 DisasterSense Real-Time Microservice Backend API
- Auth & Analytics REST APIs: http://localhost:${port}
- WebSocket Streaming Gateway: ws://localhost:${port}
  `);
});

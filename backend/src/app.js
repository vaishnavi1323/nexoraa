const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const resourceRoutes = require('./routes/resources.routes');
const bookingRoutes = require('./routes/bookings.routes');
const incidentRoutes = require('./routes/incidents.routes');
const certRoutes = require('./routes/certifications.routes');
const auditRoutes = require('./routes/audit.routes');
const aiRoutes = require('./routes/ai.routes');
const db = require('./db/database');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Direct PDF download & view route
app.get('/report.pdf', (req, res) => {
  const pdfPath = path.join(__dirname, '../../Nexora_Hackathon_Comprehensive_Report.pdf');
  const fallbackPath = path.join(__dirname, '../../NexusEquip_Hackathon_Comprehensive_Report.pdf');
  const target = fs.existsSync(pdfPath) ? pdfPath : fallbackPath;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Nexora_Hackathon_Comprehensive_Report.pdf"');
    fs.createReadStream(target).pipe(res);
  } else {
    res.status(404).send('PDF report not found');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const resourceCount = db.prepare('SELECT COUNT(*) as c FROM resources').get().c;
    const bookingCount = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;

    res.json({
      status: 'healthy',
      system: 'Nexora Platform API',
      version: '1.0.0',
      database: 'connected (SQLite WAL)',
      records: {
        users: userCount,
        resources: resourceCount,
        bookings: bookingCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/certifications', certRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;

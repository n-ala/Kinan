const http = require('http');
const url = require('url');

const appointments = [
    { id: 1, nationalId: '123456789', date: '2025-04-10', time: '10:00 AM' },
    { id: 2, nationalId: '987654321', date: '2025-04-11', time: '2:00 PM' },
    { id: 3, nationalId: '456789123', date: '2025-04-12', time: '9:00 AM' }
];

// Create an HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname.replace(/\/$/, ''); // Remove trailing slash
    const method = req.method;

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Handle GET /api/appointments to retrieve all appointments
    if (pathname === '/api/appointments' && method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify(appointments));
    }
    // Handle POST /api/appointments to schedule an appointment
    else if (pathname === '/api/appointments' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { nationalId, date, time } = JSON.parse(body);

            if (!nationalId || !date || !time) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Missing required fields" }));
            }

            const newAppointment = {
                id: appointments.length + 1,
                nationalId,
                date,
                time
            };

            appointments.push(newAppointment);

            res.statusCode = 200;
            res.end(JSON.stringify({ message: "Villa viewing appointment scheduled successfully", appointmentId: newAppointment.id }));
        });
    }
    // Handle unknown routes
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});

// Start the server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

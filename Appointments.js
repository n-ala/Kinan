const http = require('http');
const url = require('url');

const appointments = [
    { id: 1, date: '2025-04-10', time: '10:00 AM', dateArabic: '١٠ أبريل ٢٠٢٥', timeArabic: '١٠:٠٠ صباحًا', nationalId: null },
    { id: 2, date: '2025-04-11', time: '2:00 PM', dateArabic: '١١ أبريل ٢٠٢٥', timeArabic: '٢:٠٠ مساءً', nationalId: null },
    { id: 3, date: '2025-04-12', time: '9:00 AM', dateArabic: '١٢ أبريل ٢٠٢٥', timeArabic: '٩:٠٠ صباحًا', nationalId: null }
];

// Create an HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname.replace(/\/$/, ''); // Remove trailing slash
    const method = req.method;

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Handle GET /api/appointments to retrieve available appointments
    if (pathname === '/api/appointments' && method === 'GET') {
        const availableAppointments = appointments.filter(app => !app.nationalId);
        res.statusCode = 200;
        res.end(JSON.stringify(availableAppointments));
    }
    // Handle POST /api/appointments to book an appointment
    else if (pathname === '/api/appointments' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { nationalId, appointmentId } = JSON.parse(body);

            if (!nationalId || !appointmentId) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Missing required fields" }));
            }

            const appointment = appointments.find(app => app.id === appointmentId);

            if (!appointment) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: "Appointment not found" }));
            }

            if (appointment.nationalId) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Appointment already booked" }));
            }

            appointment.nationalId = nationalId;

            res.statusCode = 200;
            res.end(JSON.stringify({ message: "Villa viewing appointment booked successfully", appointment }));
        });
    }
    // Handle unknown routes
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

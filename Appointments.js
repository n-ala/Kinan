const http = require('http');
const url = require('url');

const appointments = [
    { id: 1, date: '10 Apr 2025', time: '10 AM', dateArabic: '١٠ أبريل ٢٠٢٥', timeArabic: '١٠ ص', nationalId: null },
    { id: 2, date: '11 Apr 2025', time: '2 PM', dateArabic: '١١ أبريل ٢٠٢٥', timeArabic: '٢ م', nationalId: null },
    { id: 3, date: '12 Apr 2025', time: '9 AM', dateArabic: '١٢ أبريل ٢٠٢٥', timeArabic: '٩ ص', nationalId: null }
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

            const appointment = appointments.find(app => parseInt(app.id) === parseInt(appointmentId));

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

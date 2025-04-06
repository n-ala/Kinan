const http = require('http');
const url = require('url');

const appointments = [
   { id: 1, date: '10 Apr 2025', time: '10 AM', dateArabic: '١٠ أبريل ٢٠٢٥', timeArabic: '١٠ ص', nationalId: null },
    { id: 2, date: '11 Apr 2025', time: '2 PM', dateArabic: '١١ أبريل ٢٠٢٥', timeArabic: '٢ م', nationalId: null },
    { id: 3, date: '12 Apr 2025', time: '9 AM', dateArabic: '١٢ أبريل ٢٠٢٥', timeArabic: '٩ ص', nationalId: null },
    { id: 4, date: '13 Apr 2025', time: '11 AM', dateArabic: '١٣ أبريل ٢٠٢٥', timeArabic: '١١ ص', nationalId: null },
    { id: 5, date: '14 Apr 2025', time: '4 PM', dateArabic: '١٤ أبريل ٢٠٢٥', timeArabic: '٤ م', nationalId: null },
    { id: 6, date: '15 Apr 2025', time: '1 PM', dateArabic: '١٥ أبريل ٢٠٢٥', timeArabic: '١ م', nationalId: null },
    { id: 7, date: '16 Apr 2025', time: '3 PM', dateArabic: '١٦ أبريل ٢٠٢٥', timeArabic: '٣ م', nationalId: null },
    { id: 8, date: '17 Apr 2025', time: '10 AM', dateArabic: '١٧ أبريل ٢٠٢٥', timeArabic: '١٠ ص', nationalId: null },
    { id: 9, date: '18 Apr 2025', time: '5 PM', dateArabic: '١٨ أبريل ٢٠٢٥', timeArabic: '٥ م', nationalId: null },
    { id: 10, date: '19 Apr 2025', time: '12 PM', dateArabic: '١٩ أبريل ٢٠٢٥', timeArabic: '١٢ م', nationalId: null }
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

        // POST to cancel an appointment
    else if (pathname === '/api/appointments/cancel' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { nationalId, appointmentId } = JSON.parse(body);

            if (!nationalId || !appointmentId) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Missing required fields" }));
            }

            const appointment = appointments.find(app => parseInt(app.id) === parseInt(appointmentId) && parseInt(app.nationalId) === parseInt(nationalId));
            if (!appointment) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: "Appointment not found or unauthorized" }));
            }

            appointment.nationalId = null;
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Appointment cancelled successfully" }));
        });
    }

    // POST to reschedule an appointment
    else if (pathname === '/api/appointments/reschedule' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { nationalId, oldAppointmentId, newAppointmentId } = JSON.parse(body);

            if (!nationalId || !oldAppointmentId || !newAppointmentId) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Missing required fields" }));
            }

            const oldAppointment = appointments.find(app => parseInt(app.id) === parseInt(oldAppointmentId) && parseInt(app.nationalId) === parseInt(nationalId));
            const newAppointment = appointments.find(app => parseInt(app.id) === parseInt(newAppointmentId));

            if (!oldAppointment) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: "Current appointment not found or unauthorized" }));
            }

            if (!newAppointment || newAppointment.nationalId) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "New appointment is invalid or already booked" }));
            }

            // Cancel the old one and assign the new one
            oldAppointment.nationalId = null;
            newAppointment.nationalId = nationalId;

            res.statusCode = 200;
            return res.end(JSON.stringify({ message: "Appointment rescheduled successfully", newAppointment }));
        });
    }

else if (pathname.startsWith('/api/appointments/user/') && method === 'GET') {
    const nationalId = pathname.split('/')[4];

    if (!nationalId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "National ID is required" }));
    }

    const today = new Date();

    const userAppointments = appointments.filter(app => {
        if (parseInt(app.nationalId) !== parseInt(nationalId)) return false;

        const dateParts = app.date.split(' '); // e.g., ['10', 'Apr', '2025']
        const parsedDate = new Date(`${dateParts[1]} ${dateParts[0]}, ${dateParts[2]}`);

        return parsedDate >= today;
    });

    res.statusCode = 200;
    res.end(JSON.stringify(userAppointments));
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

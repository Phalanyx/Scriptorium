import { rateBlog } from '@/lib/Rating/createRatingHelper';
import verifyUser from '@/lib/verifyUser';

async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { blogPostId, value } = req.body;

        if (!blogPostId || !value) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        if (parseInt(value) !== 1 && parseInt(value) !== -1) {
            return res.status(400).json({ error: "Invalid rating value" });
        }

        const rating = await rateBlog(req.user.id, value, blogPostId);

        if (!rating) {
            return res.status(400).json({ error: "Bad request" });
        }

        return res.status(201).json({ message: "Rating created or removed" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
    
}

export default verifyUser(handler);
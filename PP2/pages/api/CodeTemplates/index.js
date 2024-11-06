import prisma from '@/lib/prisma';
import verifyUser from '@/lib/verifyUser';

async function handler(req, res) {
    
    if (req.method === "POST") {
        
        try {
            const { title, explanation, code, language, tags } = req.body;

            if (!title || !explanation || !code || !language ) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const tagsLength = tags ? tags.length : 0;

            // Create new code template
            const newCodeTemplate = await prisma.CodeTemplate.create({
                data: {
                    title: title,
                    explanation: explanation,
                    code: code,
                    language: language, 
                    tags: tagsLength > 0 ? {
                        connectOrCreate: tags.map(tag => ({
                            where: { name: tag }, 
                            create: { name: tag } 
                        })),
                    } : undefined,
                    createdUserId: req.user.id,
                },
            });

            return res.status(201).json(newCodeTemplate);
        } 
        
        catch (error) {
            return res.status(500).json({ error: error.message });
        }

    }

    else if (req.method === "GET") {

        try {
            const { title, explanation, language, tags, createdUserId, page, pageSize } = req.query;

            if (!page || !pageSize) {
                return res.status(400).json({ error: "Page or page size missing"});
            }

            const searchFilters = [];

            if (title) {
                searchFilters.push({ title: { contains: title } });
            }
            if (explanation) {
                searchFilters.push({ explanation: { contains: explanation } });
            }
            if (language) {
                searchFilters.push({ language: { contains: language } });
            }
            if (tags) {
                const tagsList = tags.split(",");
                tagsList.forEach(tag => {
                    searchFilters.push({ tags: { some: { name: tag } } });
                });
            }
            if (createdUserId) {
                searchFilters.push({ createdUserId: parseInt(createdUserId) });
            }

            const codeTemplates = await prisma.CodeTemplate.findMany({
                where: { AND: searchFilters },
                include: { tags: true },
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize)
            });

            if (codeTemplates.length === 0) {
                return res.status(404).json({ error: "No code templates found" });
            }

            return res.status(200).json(codeTemplates);
        }

        catch (error) {
            return res.status(500).json({ error: error.message });
        }

    }

    else {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
}

export default verifyUser(handler); 
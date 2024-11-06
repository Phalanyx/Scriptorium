import prisma from '@/lib/prisma';
import verifyUser from '@/lib/verifyUser';

async function handler(req, res) {
    
    if (req.method === "POST") {
        
        try {
            const { title, description, content, tags, codeTemplates } = req.body;

            if (!title || !description || !content) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const tagsLength = tags ? tags.length : 0;
            const codeTemplatesLength = codeTemplates ? codeTemplates.length : 0;

            // Check if all code templates referenced exist
            if (codeTemplatesLength > 0) {
                const existingTemplates = await prisma.CodeTemplate.findMany({
                    where: {
                        id: {
                            in: codeTemplates.filter(templateId => templateId !== undefined)
                        }
                    }
                });
                if (existingTemplates.length !== codeTemplatesLength) {
                    return res.status(400).json({ error: "Some code templates do not exist" });
                }
            }

            // Create new blog post
            const newBlogPost = await prisma.BlogPost.create({
                data: {
                    title: title,
                    description: description,
                    content: content,
                    tags: tagsLength > 0 ? {
                        connectOrCreate: tags.map(tag => ({
                            where: { name: tag }, 
                            create: { name: tag } 
                        })),
                    } : undefined,
                    codeTemplates: codeTemplatesLength > 0 ? {
                        connect: codeTemplates.map(templateId => ({
                            id: templateId
                        }))
                    } : undefined,
                    createdUserId: req.user.id,
                },
            });

            return res.status(201).json(newBlogPost);
        } 
        
        catch (error) {
            return res.status(500).json({ error: error.message });
        }

    }

    else if (req.method === "GET") {

        try {
            const { title, description, content, tags, codeTemplates, createdUserId, order, page, pageSize} = req.query;

            if (!page || !pageSize) {
                return res.status(400).json({ error: "Page or page size missing"});
            }

            if (!order || order !== "asc" && order !== "desc") {
                return res.status(400).json({ error: "Order must be specified as either asc or desc" });
            }

            const searchFilters = [];

            if (title) {
                searchFilters.push({ title: { contains: title } });
            }
            if (description) {
                searchFilters.push({ description: { contains: description } });
            }
            if (content) {
                searchFilters.push({ content: { contains: content } });
            }
            if (tags) {
                const tagsList = tags.split(",");
                tagsList.forEach(tag => {
                    searchFilters.push({ tags: { some: { name: tag } } });
                });
            }
            if (codeTemplates) {
                const codeTemplatesList = codeTemplates.split(",");
                codeTemplatesList.forEach(template => {
                    searchFilters.push({ codeTemplates: { some: { id: parseInt(template) } } });
                });
            }
            if (createdUserId) {
                searchFilters.push({ createdUserId: parseInt(createdUserId) });
            }
            if (req.user && req.user.id) {
                searchFilters.push({
                    OR: [
                        { inappropriate: false },
                        { AND: [{ inappropriate: true }, { createdUserId: req.user.id }] }
                    ]
                });
            }

            const blogPosts = await prisma.BlogPost.findMany({
                where: { AND: searchFilters },
                include: { 
                    tags: {
                        select: { name: true }
                    },
                    codeTemplates: {
                        select: { id: true }
                    },
                },
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize),
                orderBy: { rating: order }
            });

            if (blogPosts.length === 0) {
                return res.status(404).json({ error: "No blog posts found" });
            }
            
            return res.status(200).json(blogPosts);
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
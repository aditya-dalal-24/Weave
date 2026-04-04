const prisma = require('../config/database');

class InternshipService {
  async create(userId, data) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.internship.create({
      data: {
        recruiterId: recruiter.id,
        title: data.title,
        company: recruiter.companyName,
        description: data.description,
        type: data.type || 'REMOTE',
        location: data.location,
        industry: data.industry,
        stipend: data.stipend || 0,
        duration: data.duration,
        skills: data.skills || [],
        requirements: data.requirements,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  }

  async getAll(filters = {}) {
    const where = { isActive: true };
    if (filters.type) where.type = filters.type;
    if (filters.industry) where.industry = filters.industry;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.minStipend) where.stipend = { gte: parseInt(filters.minStipend) };
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [internships, total] = await Promise.all([
      prisma.internship.findMany({
        where,
        include: {
          recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.internship.count({ where }),
    ]);

    return {
      internships,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getById(id) {
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true, about: true, website: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!internship) {
      const error = new Error('Internship not found');
      error.statusCode = 404;
      throw error;
    }

    return internship;
  }

  async getByRecruiter(userId) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.internship.findMany({
      where: { recruiterId: recruiter.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId, internshipId, data) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const internship = await prisma.internship.findFirst({
      where: { id: internshipId, recruiterId: recruiter.id },
    });

    if (!internship) {
      const error = new Error('Internship not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    return prisma.internship.update({
      where: { id: internshipId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        location: data.location,
        industry: data.industry,
        stipend: data.stipend,
        duration: data.duration,
        skills: data.skills,
        requirements: data.requirements,
        deadline: data.deadline ? new Date(data.deadline) : null,
        isActive: data.isActive,
      },
    });
  }

  async delete(userId, internshipId) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const internship = await prisma.internship.findFirst({
      where: { id: internshipId, recruiterId: recruiter.id },
    });

    if (!internship) {
      const error = new Error('Internship not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    await prisma.internship.delete({ where: { id: internshipId } });
  }
}

module.exports = new InternshipService();

const prisma = require('../config/database');

class ApplicationService {
  async apply(userId, internshipId, coverLetter) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: { skills: true, education: true, preferences: true },
    });

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { recruiter: true },
    });

    if (!internship || !internship.isActive) {
      const error = new Error('Internship not found or no longer active');
      error.statusCode = 404;
      throw error;
    }

    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      const error = new Error('Application deadline has passed');
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.application.findUnique({
      where: { candidateId_internshipId: { candidateId: candidate.id, internshipId } },
    });

    if (existing) {
      const error = new Error('Already applied to this internship');
      error.statusCode = 409;
      throw error;
    }

    // Calculate a basic match score locally (fallback if AI service is unavailable)
    let matchScore = 0;
    if (candidate.skills.length > 0 && internship.skills.length > 0) {
      const candidateSkills = candidate.skills.map((s) => s.name.toLowerCase());
      const internshipSkills = internship.skills.map((s) => s.toLowerCase());
      const matchedSkills = internshipSkills.filter((s) => candidateSkills.includes(s));
      matchScore = Math.round((matchedSkills.length / internshipSkills.length) * 100);
    }

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        internshipId,
        coverLetter,
        matchScore,
      },
      include: {
        internship: { select: { title: true, company: true } },
      },
    });

    // Notify recruiter
    await prisma.notification.create({
      data: {
        userId: internship.recruiter.userId,
        title: 'New Application',
        message: `${candidate.firstName} ${candidate.lastName} applied for "${internship.title}".`,
        type: 'application',
      },
    });

    return application;
  }

  async getCandidateApplications(userId, status) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const where = { candidateId: candidate.id };
    if (status) where.status = status;

    return prisma.application.findMany({
      where,
      include: {
        internship: {
          include: {
            recruiter: { select: { companyName: true, companyLogo: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getById(applicationId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          include: {
            skills: true,
            education: true,
            user: { select: { email: true } },
          },
        },
        internship: {
          include: {
            recruiter: { select: { companyName: true } },
          },
        },
      },
    });

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  async withdraw(userId, applicationId) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, candidateId: candidate.id, status: 'APPLIED' },
    });

    if (!application) {
      const error = new Error('Application not found or cannot be withdrawn');
      error.statusCode = 404;
      throw error;
    }

    await prisma.application.delete({ where: { id: applicationId } });
  }
}

module.exports = new ApplicationService();

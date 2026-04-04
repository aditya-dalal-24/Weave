const prisma = require('../config/database');

class CandidateService {
  async getDashboard(userId) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        skills: true,
        education: true,
        preferences: true,
        applications: {
          include: { internship: { select: { id: true, title: true, company: true, type: true } } },
          orderBy: { appliedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const totalApplications = await prisma.application.count({ where: { candidateId: candidate.id } });
    const shortlisted = await prisma.application.count({ where: { candidateId: candidate.id, status: 'SHORTLISTED' } });
    const selected = await prisma.application.count({ where: { candidateId: candidate.id, status: 'SELECTED' } });
    const activeInternships = await prisma.internship.count({ where: { isActive: true } });

    return {
      profile: candidate,
      stats: { totalApplications, shortlisted, selected, activeInternships },
      recentApplications: candidate.applications,
    };
  }

  async getProfile(userId) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        skills: true,
        education: { orderBy: { startDate: 'desc' } },
        preferences: true,
      },
    });

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    return candidate;
  }

  async updateProfile(userId, data) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.candidate.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        bio: data.bio,
        avatar: data.avatar,
        resumeUrl: data.resumeUrl,
      },
    });

    await this.calculateProfileStrength(candidate.id);
    return updated;
  }

  async addEducation(userId, data) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const education = await prisma.education.create({
      data: {
        candidateId: candidate.id,
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        grade: data.grade,
      },
    });

    await this.calculateProfileStrength(candidate.id);
    return education;
  }

  async updateEducation(userId, educationId, data) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const education = await prisma.education.findFirst({
      where: { id: educationId, candidateId: candidate.id },
    });
    if (!education) {
      const error = new Error('Education record not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.education.update({
      where: { id: educationId },
      data: {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        grade: data.grade,
      },
    });
  }

  async deleteEducation(userId, educationId) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.education.deleteMany({
      where: { id: educationId, candidateId: candidate.id },
    });

    await this.calculateProfileStrength(candidate.id);
  }

  async addSkill(userId, data) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = await prisma.skill.findFirst({
      where: { candidateId: candidate.id, name: data.name },
    });
    if (existing) {
      const error = new Error('Skill already added');
      error.statusCode = 409;
      throw error;
    }

    const skill = await prisma.skill.create({
      data: {
        candidateId: candidate.id,
        name: data.name,
        proficiency: data.proficiency || 'Intermediate',
      },
    });

    await this.calculateProfileStrength(candidate.id);
    return skill;
  }

  async deleteSkill(userId, skillId) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.skill.deleteMany({
      where: { id: skillId, candidateId: candidate.id },
    });

    await this.calculateProfileStrength(candidate.id);
  }

  async updatePreferences(userId, data) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const preferences = await prisma.preference.upsert({
      where: { candidateId: candidate.id },
      create: {
        candidateId: candidate.id,
        locations: data.locations || [],
        types: data.types || [],
        industries: data.industries || [],
        minStipend: data.minStipend || 0,
      },
      update: {
        locations: data.locations || [],
        types: data.types || [],
        industries: data.industries || [],
        minStipend: data.minStipend || 0,
      },
    });

    await this.calculateProfileStrength(candidate.id);
    return preferences;
  }

  async calculateProfileStrength(candidateId) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { skills: true, education: true, preferences: true },
    });

    let strength = 0;

    // Basic info
    if (candidate.firstName && candidate.lastName) strength += 15;
    if (candidate.phone) strength += 5;
    if (candidate.bio) strength += 10;
    if (candidate.resumeUrl) strength += 10;

    // Education
    if (candidate.education.length > 0) strength += 20;

    // Skills
    if (candidate.skills.length >= 3) strength += 20;
    else if (candidate.skills.length > 0) strength += 10;

    // Preferences
    if (candidate.preferences) {
      if (candidate.preferences.locations.length > 0) strength += 5;
      if (candidate.preferences.types.length > 0) strength += 5;
      if (candidate.preferences.industries.length > 0) strength += 5;
      if (candidate.preferences.minStipend > 0) strength += 5;
    }

    strength = Math.min(strength, 100);

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { profileStrength: strength },
    });

    return strength;
  }

  async getProfileSuggestions(userId) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: { skills: true, education: true, preferences: true },
    });

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const suggestions = [];

    if (!candidate.bio) suggestions.push({ field: 'bio', message: 'Add a professional bio to stand out to recruiters' });
    if (!candidate.phone) suggestions.push({ field: 'phone', message: 'Add your phone number for direct contact' });
    if (!candidate.resumeUrl) suggestions.push({ field: 'resume', message: 'Upload your resume to increase visibility' });
    if (candidate.education.length === 0) suggestions.push({ field: 'education', message: 'Add your educational background' });
    if (candidate.skills.length < 3) suggestions.push({ field: 'skills', message: 'Add at least 3 skills to get better recommendations' });
    if (!candidate.preferences) suggestions.push({ field: 'preferences', message: 'Set your internship preferences for personalized matches' });

    return { profileStrength: candidate.profileStrength, suggestions };
  }
}

module.exports = new CandidateService();

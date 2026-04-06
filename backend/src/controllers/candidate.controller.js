const candidateService = require('../services/candidate.service');
const fs = require('fs');
const pdfParse = require('pdf-parse');

class CandidateController {
  async getDashboard(req, res, next) {
    try {
      const data = await candidateService.getDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await candidateService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await candidateService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) throw new Error('No image file provided');
      const avatarUrl = `/uploads/${req.file.filename}`;
      const data = await candidateService.updateProfile(req.user.id, { avatar: avatarUrl });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req, res, next) {
    try {
      if (!req.file) throw new Error('No PDF file provided');
      const resumeUrl = `/uploads/${req.file.filename}`;
      
      let extractedSkills = [];
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();
        
        const commonSkills = ['javascript', 'react', 'react js', 'node', 'node.js', 'python', 'java', 'c++', 'html', 'css', 'sql', 'mongodb', 'docker', 'aws', 'typescript', 'figma', 'git', 'express', 'angular', 'vue'];
        
        extractedSkills = commonSkills.filter(skill => text.includes(skill.toLowerCase()));
        
        if (extractedSkills.length > 0) {
          for (const skill of extractedSkills) {
            try {
              let displaySkill = skill === 'node.js' ? 'Node.js' : skill === 'react js' ? 'React JS' : skill.charAt(0).toUpperCase() + skill.slice(1);
              await candidateService.addSkill(req.user.id, { name: displaySkill, proficiency: 'Intermediate' });
            } catch (ignore) {}
          }
        }
      } catch (parseError) {
        console.error('PDF parsing failed:', parseError);
      }

      const data = await candidateService.updateProfile(req.user.id, { resumeUrl });
      res.json({ success: true, data, extractedSkills });
    } catch (error) {
      next(error);
    }
  }

  async addEducation(req, res, next) {
    try {
      const data = await candidateService.addEducation(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateEducation(req, res, next) {
    try {
      const data = await candidateService.updateEducation(req.user.id, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteEducation(req, res, next) {
    try {
      await candidateService.deleteEducation(req.user.id, req.params.id);
      res.json({ success: true, message: 'Education deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addSkill(req, res, next) {
    try {
      const data = await candidateService.addSkill(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      await candidateService.deleteSkill(req.user.id, req.params.id);
      res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const data = await candidateService.updatePreferences(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfileSuggestions(req, res, next) {
    try {
      const data = await candidateService.getProfileSuggestions(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CandidateController();

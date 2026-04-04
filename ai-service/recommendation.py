import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


# Predefined skill universe for vectorization
SKILL_UNIVERSE = [
    "javascript", "react", "node.js", "python", "sql", "git", "java", "c++",
    "typescript", "html/css", "figma", "adobe photoshop", "ui/ux design",
    "illustration", "digital marketing", "content writing", "seo",
    "social media", "machine learning", "tensorflow", "r", "tableau",
    "docker", "linux", "react native", "flutter", "rest apis", "mongodb",
    "aws", "azure", "kubernetes", "data analysis", "statistics",
    "natural language processing", "computer vision", "deep learning",
    "agile", "scrum", "project management", "communication",
    "problem solving", "teamwork", "leadership", "excel", "powerpoint",
    "google analytics", "a/b testing", "copywriting", "video editing",
    "photography", "3d modeling", "blender", "unity", "unreal engine",
    "swift", "kotlin", "go", "rust", "php", "ruby", "django", "flask",
    "spring boot", "express.js", "next.js", "vue.js", "angular",
    "sass", "tailwind css", "bootstrap", "material ui", "redux",
    "graphql", "redis", "elasticsearch", "kafka", "rabbitmq",
    "ci/cd", "jenkins", "github actions", "terraform", "ansible",
    "prometheus", "grafana", "new relic", "datadog",
    "software engineering", "data science", "computer science",
    "graphic design", "marketing", "business", "engineering",
]

PROFICIENCY_WEIGHTS = {
    "beginner": 0.4,
    "intermediate": 0.7,
    "advanced": 1.0,
}

DEGREE_RELEVANCE = {
    "phd": 1.0,
    "master's": 0.9,
    "bachelor's": 0.7,
    "associate": 0.5,
    "diploma": 0.4,
    "certification": 0.3,
}


def skill_to_vector(skills: list[dict], universe: list[str] = SKILL_UNIVERSE) -> np.ndarray:
    """Convert skill list to a weighted vector based on proficiency."""
    vector = np.zeros(len(universe))
    for skill in skills:
        name = skill["name"].lower().strip()
        proficiency = skill.get("proficiency", "intermediate").lower()
        weight = PROFICIENCY_WEIGHTS.get(proficiency, 0.7)
        # Check for exact match or substring match in universe
        for i, u_skill in enumerate(universe):
            if name == u_skill or name in u_skill or u_skill in name:
                vector[i] = weight
                break
    return vector


def internship_skill_to_vector(skills: list[str], universe: list[str] = SKILL_UNIVERSE) -> np.ndarray:
    """Convert internship required skills to a binary vector."""
    vector = np.zeros(len(universe))
    for skill in skills:
        name = skill.lower().strip()
        for i, u_skill in enumerate(universe):
            if name == u_skill or name in u_skill or u_skill in name:
                vector[i] = 1.0
                break
    return vector


def calculate_skill_score(candidate_skills: list[dict], internship_skills: list[str]) -> float:
    """Calculate skill match score using cosine similarity (0-50)."""
    if not candidate_skills or not internship_skills:
        return 0.0

    c_vec = skill_to_vector(candidate_skills).reshape(1, -1)
    i_vec = internship_skill_to_vector(internship_skills).reshape(1, -1)

    # Check if either vector is all zeros
    if np.sum(c_vec) == 0 or np.sum(i_vec) == 0:
        return 0.0

    similarity = cosine_similarity(c_vec, i_vec)[0][0]
    return round(similarity * 50, 2)


def calculate_preference_score(preferences: dict | None, internship: dict) -> float:
    """Calculate preference match score (0-30)."""
    if not preferences:
        return 0.0

    score = 0.0
    total_weight = 0.0

    # Type match (weight: 10)
    if preferences.get("types") and len(preferences["types"]) > 0:
        total_weight += 10
        if internship.get("type") in preferences["types"]:
            score += 10

    # Location match (weight: 10)
    if preferences.get("locations") and len(preferences["locations"]) > 0:
        total_weight += 10
        intern_location = (internship.get("location") or "").lower()
        for loc in preferences["locations"]:
            if loc.lower() in intern_location or intern_location in loc.lower():
                score += 10
                break

    # Industry match (weight: 5)
    if preferences.get("industries") and len(preferences["industries"]) > 0:
        total_weight += 5
        intern_industry = (internship.get("industry") or "").lower()
        for ind in preferences["industries"]:
            if ind.lower() in intern_industry or intern_industry in ind.lower():
                score += 5
                break

    # Stipend match (weight: 5)
    if preferences.get("minStipend") and preferences["minStipend"] > 0:
        total_weight += 5
        if internship.get("stipend", 0) >= preferences["minStipend"]:
            score += 5

    if total_weight == 0:
        return 0.0

    return round((score / total_weight) * 30, 2)


def calculate_education_score(education: list[dict], internship: dict) -> float:
    """Calculate education relevance score (0-20)."""
    if not education:
        return 0.0

    best_score = 0.0
    intern_desc = (internship.get("description", "") or "").lower()
    intern_skills = [s.lower() for s in (internship.get("skills") or [])]
    intern_industry = (internship.get("industry") or "").lower()

    for edu in education:
        edu_score = 0.0
        field = (edu.get("field") or "").lower()
        degree = (edu.get("degree") or "").lower()

        # Degree level relevance
        degree_weight = 0.5
        for deg_key, deg_val in DEGREE_RELEVANCE.items():
            if deg_key in degree:
                degree_weight = deg_val
                break

        # Field relevance to internship
        field_relevance = 0.0

        # Check if field matches industry
        if field and intern_industry and (field in intern_industry or intern_industry in field):
            field_relevance = 1.0
        # Check if field is mentioned in description
        elif field and field in intern_desc:
            field_relevance = 0.8
        # Check if field relates to required skills
        elif field:
            for skill in intern_skills:
                if field in skill or skill in field:
                    field_relevance = 0.6
                    break

        edu_score = degree_weight * field_relevance * 20
        best_score = max(best_score, edu_score)

    return round(best_score, 2)


def calculate_recommendations(candidate: dict, internships: list[dict]) -> list[dict]:
    """
    Calculate recommendation scores for all internships.

    Weights:
    - Skills: 50%
    - Preferences: 30%
    - Education: 20%
    """
    results = []

    for internship in internships:
        skill_score = calculate_skill_score(
            candidate.get("skills", []),
            internship.get("skills", [])
        )
        pref_score = calculate_preference_score(
            candidate.get("preferences"),
            internship
        )
        edu_score = calculate_education_score(
            candidate.get("education", []),
            internship
        )

        total_score = round(skill_score + pref_score + edu_score, 1)
        total_score = min(total_score, 100.0)

        results.append({
            "internship_id": internship["id"],
            "match_score": total_score,
            "breakdown": {
                "skills": skill_score,
                "preferences": pref_score,
                "education": edu_score,
            },
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

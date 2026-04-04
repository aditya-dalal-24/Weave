from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recommendation import calculate_recommendations


app = FastAPI(
    title="InternMatch AI Service",
    description="AI-powered internship recommendation engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class SkillInput(BaseModel):
    name: str
    proficiency: str = "Intermediate"


class EducationInput(BaseModel):
    degree: str
    field: str
    institution: str = ""


class PreferencesInput(BaseModel):
    locations: list[str] = []
    types: list[str] = []
    industries: list[str] = []
    minStipend: int = 0


class CandidateInput(BaseModel):
    skills: list[SkillInput] = []
    education: list[EducationInput] = []
    preferences: PreferencesInput | None = None


class InternshipInput(BaseModel):
    id: str
    title: str
    company: str
    skills: list[str] = []
    type: str = "REMOTE"
    location: str | None = None
    industry: str | None = None
    stipend: int = 0
    description: str = ""


class RecommendationRequest(BaseModel):
    candidate: CandidateInput
    internships: list[InternshipInput]


class BreakdownOutput(BaseModel):
    skills: float
    preferences: float
    education: float


class RecommendationOutput(BaseModel):
    internship_id: str
    match_score: float
    breakdown: BreakdownOutput


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationOutput]


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-recommendation"}


@app.post("/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):
    if not request.internships:
        return RecommendationResponse(recommendations=[])

    candidate_data = {
        "skills": [{"name": s.name, "proficiency": s.proficiency} for s in request.candidate.skills],
        "education": [{"degree": e.degree, "field": e.field, "institution": e.institution} for e in request.candidate.education],
        "preferences": request.candidate.preferences.model_dump() if request.candidate.preferences else None,
    }

    internship_data = [
        {
            "id": i.id,
            "title": i.title,
            "company": i.company,
            "skills": i.skills,
            "type": i.type,
            "location": i.location,
            "industry": i.industry,
            "stipend": i.stipend,
            "description": i.description,
        }
        for i in request.internships
    ]

    try:
        results = calculate_recommendations(candidate_data, internship_data)
        return RecommendationResponse(recommendations=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

"""FastAPI Main Application Entrypoint for CA2.
Configures CORS, registers modular routers, and provides interactive Swagger/OpenAPI documentation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import data, mining, compare, sensitivity, recommend, insights

app = FastAPI(
    title="Market Basket Analysis & Product Recommendation API (DMBI CA2)",
    description=(
        "Decision-support backend for Association Rule Mining on UCI Online Retail transaction data. "
        "Implements FP-Growth, Apriori comparative benchmarks, sensitivity grids, and product recommender engines."
    ),
    version="1.0.0"
)

# Enable CORS for Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(data.router)
app.include_router(mining.router)
app.include_router(compare.router)
app.include_router(sensitivity.router)
app.include_router(recommend.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {
        "message": "Market Basket Analysis & Product Recommendation Decision-Support API",
        "documentation": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


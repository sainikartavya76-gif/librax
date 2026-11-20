from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import (
    auth_router,
    books_router,
    users_router,
    transactions_router,
    reservations_router,
    fines_router,
    notifications_router,
    analytics_router,
    dsa_router,
    activity_router,
)

app = FastAPI(
    title="LIBRAX API",
    description="Professional Library Management System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(books_router)
app.include_router(users_router)
app.include_router(transactions_router)
app.include_router(reservations_router)
app.include_router(fines_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(dsa_router)
app.include_router(activity_router)

@app.get("/")
def root():
    return {"message": "Welcome to LIBRAX API", "version": "1.0.0", "docs": "/docs"}

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ActivityLogItem(BaseModel):
    id: str
    action: str
    entity_type: str
    description: str
    created_at: str
    user_name: Optional[str] = None

class OverdueBookItem(BaseModel):
    transaction_id: str
    book_title: str
    user_name: str
    due_date: str
    days_overdue: int

class PopularBookItem(BaseModel):
    book_id: str
    title: str
    issue_count: int

class CategoryStatItem(BaseModel):
    category_id: str
    category_name: str
    count: int

class DashboardStats(BaseModel):
    total_books: int
    total_users: int
    books_issued_today: int
    books_returned_today: int
    overdue_count: int
    active_reservations: int
    fines_collected_today: float
    books_added_this_month: int
    new_members_this_month: int
    recent_activity: List[ActivityLogItem]
    overdue_books: List[OverdueBookItem]
    popular_books: List[PopularBookItem]
    popular_categories: List[CategoryStatItem]

class ChartData(BaseModel):
    labels: List[str]
    data: List[float]

from pydantic import BaseModel
from typing import Any, List, Optional, Dict


class SearchResult(BaseModel):
    results: List[Any]
    algorithm_used: str
    execution_time_ms: float
    complexity_info: str
    comparisons: int = 0


class SortResult(BaseModel):
    sorted_data: List[Any]
    algorithm_used: str
    execution_time_ms: float
    comparisons: int = 0
    swaps: int = 0
    time_complexity: str = "O(N²)"
    space_complexity: str = "O(1)"
    steps: Optional[int] = None


class QueueVisualization(BaseModel):
    type: str
    algorithm: str
    description: str
    queue_length: int
    items: List[Dict[str, Any]]


class StackVisualization(BaseModel):
    type: str
    algorithm: str
    description: str
    stack_size: int
    items: List[Dict[str, Any]]

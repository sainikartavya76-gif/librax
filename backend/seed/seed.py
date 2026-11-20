import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings
from app.models.user import User, RoleEnum
from app.models.book import Book
from app.models.category import Category
from app.models.author import Author
from app.models.publisher import Publisher
from app.models.transaction import Transaction, TransactionStatus
from app.models.reservation import Reservation
from app.models.fine import Fine
from app.models.notification import Notification
from app.models.activity_log import ActivityLog
from app.core.security import get_password_hash
from faker import Faker
import random
from datetime import date, timedelta

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

fake = Faker()

import os
from app.database.connection import Base

async def clear_data(session: AsyncSession):
    # In SQLite, we can just let create_all handle it, but we can't easily TRUNCATE CASCADE.
    pass

async def seed_data():
    db_path = "librax.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:

        # Users
        admin = User(
            email="admin@librax.com",
            username="admin",
            full_name="System Admin",
            hashed_password=get_password_hash("Admin@123"),
            role=RoleEnum.ADMIN
        )
        librarian = User(
            email="librarian@librax.com",
            username="librarian",
            full_name="Chief Librarian",
            hashed_password=get_password_hash("Librarian@123"),
            role=RoleEnum.LIBRARIAN
        )
        session.add_all([admin, librarian])
        
        students = []
        for _ in range(28):
            students.append(User(
                email=fake.email(),
                username=fake.user_name(),
                full_name=fake.name(),
                hashed_password=get_password_hash("Student@123"),
                role=RoleEnum.STUDENT
            ))
        session.add_all(students)
        await session.commit()

        # Authors
        authors = [Author(name=fake.name(), bio=fake.text()) for _ in range(15)]
        session.add_all(authors)
        
        # Categories
        categories = [
            Category(name="Science Fiction", color_code="#FF5733"),
            Category(name="Fantasy", color_code="#33FF57"),
            Category(name="Mystery", color_code="#3357FF"),
            Category(name="Biography", color_code="#F333FF"),
            Category(name="History", color_code="#FF33A8"),
            Category(name="Programming", color_code="#33FFF6"),
            Category(name="Business", color_code="#FFC133"),
            Category(name="Self-Help", color_code="#8D33FF"),
            Category(name="Philosophy", color_code="#FF5733"),
            Category(name="Poetry", color_code="#83FF33"),
        ]
        session.add_all(categories)

        # Publishers
        publishers = [Publisher(name=fake.company(), address=fake.address(), website=fake.url()) for _ in range(5)]
        session.add_all(publishers)
        await session.commit()

        # Books
        books = []
        for i in range(100):
            book = Book(
                isbn=fake.isbn13(),
                title=fake.catch_phrase(),
                description=fake.text(),
                total_copies=random.randint(2, 10),
                available_copies=0,
                category_id=random.choice(categories).id,
                publisher_id=random.choice(publishers).id
            )
            book.available_copies = book.total_copies
            book.authors.append(random.choice(authors))
            books.append(book)
        session.add_all(books)
        await session.commit()

        # Transactions & Fines
        transactions = []
        for _ in range(100):
            book = random.choice(books)
            if book.available_copies > 0:
                book.available_copies -= 1
                issue_date = date.today() - timedelta(days=random.randint(1, 30))
                due_date = issue_date + timedelta(days=14)
                status = random.choice(list(TransactionStatus))
                
                tx = Transaction(
                    book_id=book.id,
                    user_id=random.choice(students).id,
                    issued_by=librarian.id,
                    issue_date=issue_date,
                    due_date=due_date,
                    status=status
                )
                if status == TransactionStatus.RETURNED:
                    tx.return_date = due_date - timedelta(days=random.randint(-5, 5))
                    book.available_copies += 1
                
                session.add(tx)
                transactions.append(tx)
        
        await session.commit()
        print("Seeding completed successfully")

if __name__ == "__main__":
    asyncio.run(seed_data())

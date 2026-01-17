from app import db, create_app
from app.models.user import User
from sqlalchemy import text

app = create_app()
app.app_context().push()

print("=" * 50)
print("CAMPUS DATA DEBUG")
print("=" * 50)

# Check if campus column exists
try:
    result = db.session.execute(text("SELECT campus FROM users LIMIT 1"))
    print("✅ Campus column exists in database")
except Exception as e:
    print(f"❌ Campus column does NOT exist: {e}")
    print("Run: flask db upgrade")
    exit()

# Check all users and their campus
users = User.query.all()
print(f"\nTotal users: {len(users)}")
print("\nUser Campus Data:")
print("-" * 50)

campus_count = {}
for user in users:
    print(f"ID: {user.id} | Name: {user.full_name} | Campus: {user.campus}")
    if user.campus:
        campus_count[user.campus] = campus_count.get(user.campus, 0) + 1

print("\n" + "=" * 50)
print("CAMPUS DISTRIBUTION:")
print("=" * 50)
if campus_count:
    for campus, count in campus_count.items():
        print(f"{campus}: {count} users")
else:
    print("⚠️  NO CAMPUS DATA FOUND!")
    print("\nPossible reasons:")
    print("1. Migration didn't run - Run: flask db upgrade")
    print("2. Users registered before campus field was added")
    print("3. Frontend not sending campus data during registration")

# Test the query used in analytics
print("\n" + "=" * 50)
print("TESTING ANALYTICS QUERY:")
print("=" * 50)
from sqlalchemy import func
campus_stats = db.session.query(
    User.campus,
    func.count(User.id).label('user_count')
).filter(
    User.campus.isnot(None),
    User.campus != ''
).group_by(User.campus).all()

print(f"Query result: {campus_stats}")
campus_distribution = {campus: count for campus, count in campus_stats if campus}
print(f"Campus distribution dict: {campus_distribution}")
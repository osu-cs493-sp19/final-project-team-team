db.courses.insertMany([
  {
  "subject": "CS",
  "number": 493,
  "title": "Cloud Application Development",
  "term": "sp19",
  "instructorId": "123"
  },
  {
  "subject": "CS",
  "number": 429,
  "title": "Mobile App Development",
  "term": "wn19",
  "instructorId": "123"
  }
]);
db.users.insertMany([
  {
    "name": "Jane Doe",
    "email": "doej@oregonstate.edu",
    "password": "hunter2",
    "role": "student"
  },
  {
    "name": "John Doe",
    "email": "doejo@oregonstate.edu",
    "password": "hunter2",
    "role": "admin"
  },
  {
    "name": "Rob Hess",
    "email": "hessro@oregonstate.edu",
    "password": "hunter2",
    "role": "instructor"
  }
]);

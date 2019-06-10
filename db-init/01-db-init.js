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
    "password": "$2a$08$Y2IHnr/PU9tzG5HKrHGJH.zH3HAvlR5i5puD5GZ1sHA/mVrHKci72",
    "role": "student"
  },
  {
    "name": "John Doe",
    "email": "doejo@oregonstate.edu",
    "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
    "role": "admin"
  },
  {
    "name": "Rob Hess",
    "email": "hessro@oregonstate.edu",
    "password": "$2a$08$bAKRXPs6fUPhqjZy55TIeO1e.aXud4LD81awrYncaCKJoMsg/s0c.",
    "role": "instructor"
  }
]);

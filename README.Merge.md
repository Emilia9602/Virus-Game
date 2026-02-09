# 📌 1. På feature-branchen

git add .
git commit -m "text"
git push -u origin (branch)

# 🔁 2. Merga in i dev

git checkout dev
git pull
git merge (branch) -m "text" # konflikter kan uppstå
git push origin dev

# 🚀 3. Merga dev in i main

git checkout main
git pull
git merge dev -m "text"
git push origin main

Liten guide till att pusha branchen som jag tycker är jättesmidig att följa 🙂
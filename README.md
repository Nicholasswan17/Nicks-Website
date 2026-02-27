# The Dachshund Dynasty - React Version

## Setup Instructions

### 1. Copy your image files
Copy all your image files into the `public/` folder:
- Bruno1.jpg
- Bruno2.jpg
- Dog1.png
- HappyBruno.jpg
- OldDogs.jpg
- Types.jpg
- DennistheDog.PNG

### 2. Install dependencies
Open terminal in this folder and run:
```
npm install
```

### 3. Run locally
```
npm run dev
```
Then open http://localhost:5173 in your browser.

### 4. Deploy to Netlify (free hosting)
1. Run: `npm run build`
2. Go to https://netlify.com and sign up free
3. Drag and drop the `dist/` folder onto Netlify
4. Your site is live instantly with a free URL!

### Optional: Deploy to GitHub Pages
1. Push this project to a GitHub repo
2. Run: `npm install --save-dev gh-pages`
3. Add to package.json scripts: `"deploy": "gh-pages -d dist"`
4. Run: `npm run build && npm run deploy`

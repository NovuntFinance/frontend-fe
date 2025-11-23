const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add the rotation logic and currentBgImage right after the parallax useEffect before the return statement
const rotationCode = `
  // Background image rotation every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 60000); // 60 seconds = 1 minute

    return () => clearInterval(interval);
  }, []);

  // Get current background image safely
  const currentBgImage = BACKGROUND_IMAGES[currentImageIndex] || BACKGROUND_IMAGES[0];
`;

// Find the line number before return statement and insert
const lines = content.split('\n');
const returnIndex = lines.findIndex(line => line.trim() === 'return (');

if (returnIndex > 0) {
  lines.splice(returnIndex, 0, rotationCode);
  content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added rotation logic and currentBgImage!');
} else {
  console.log('Could not find return statement');
}

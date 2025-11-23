const fs = require('fs');
const path = require('path');

// Read the original file
const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Check if rotation logic already exists
if (content.includes('Background image rotation')) {
  console.log('Rotation logic already exists, skipping...');
} else {
  // Add rotation effect and currentBgImage before return statement
  content = content.replace(
    '  }, []);\n\n  return (',
    `  }, []);\n\n  // Background image rotation every 60 seconds\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);\n    }, 60000); // 60 seconds = 1 minute\n\n    return () => clearInterval(interval);\n  }, []);\n\n  // Get current background image safely\n  const currentBgImage = BACKGROUND_IMAGES[currentImageIndex] || BACKGROUND_IMAGES[0];\n\n  return (`
  );
  
  console.log('Added rotation logic and currentBgImage variable');
}

// Write the modified content
fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully!');

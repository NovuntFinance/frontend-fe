const fs = require('fs');
const path = require('path');

// Read the original file
const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Background images array
const BGI_ARRAY = `
// Background images array for rotation
const BACKGROUND_IMAGES = [
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI8_exyk9p.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI3_x9oels.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI5_zg9vpl.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI6_giqtce.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819597/Novunt_BGI4_h4hlrn.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819597/Novunt_BGI7_wh2trj.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819596/Novunt_BGI2_qkjznq.jpg',
];
`;

// Add BG array after ChatWidget import
content = content.replace(
  "const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), { ssr: false });",
  "const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), { ssr: false });" + BGI_ARRAY
);

// Add currentImageIndex state
content = content.replace(
  'const [mounted, setMounted] = useState(false);',
  `const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);`
);

// Add rotation effect after parallax effect
content = content.replace(
  '  }, []);\n\n  return (',
  `  }, []);\n\n  // Background image rotation every 60 seconds\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);\n    }, 60000); // 60 seconds = 1 minute\n\n    return () => clearInterval(interval);\n  }, []);\n\n  // Get current background image safely\n  const currentBgImage = BACKGROUND_IMAGES[currentImageIndex] || BACKGROUND_IMAGES[0];\n\n  return (`
);

// Update Image component
content = content.replace(
 '<Image src="/vault-bg.jpg" alt="Vault background" fill className="object-cover" priority quality={75} />',
  `<Image 
              src={currentBgImage} 
              alt="Novunt background" 
              fill 
              className="object-cover transition-opacity duration-1000" 
              priority 
              quality={75}
              key={currentImageIndex}
            />`
);

// Write the modified content
fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully!');

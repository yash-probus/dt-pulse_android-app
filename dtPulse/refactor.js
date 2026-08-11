const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) results.push(filePath);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace expo-router
  content = content.replace(/['"]expo-router['"]/g, "'@/utils/router'");

  // Replace expo-haptics
  if (content.includes('expo-haptics')) {
    content = content.replace(/import\s+\*\s+as\s+Haptics\s+from\s+['"]expo-haptics['"];?/g, "import Haptics from 'react-native-haptic-feedback';");
    content = content.replace(/Haptics\.impactAsync\(Haptics\.ImpactFeedbackStyle\.Light\)/g, "Haptics.trigger('impactLight')");
  }

  // Replace expo-blur
  if (content.includes('expo-blur')) {
    content = content.replace(/import\s+{([^}]*BlurView[^}]*)}\s+from\s+['"]expo-blur['"];?/g, "import { BlurView } from '@react-native-community/blur';");
    content = content.replace(/intensity=\{([0-9]+)\}/g, "blurAmount={10}");
    content = content.replace(/tint=(['"])(dark|light)(['"])/g, "blurType=$1$2$3");
  }

  // Replace expo vector icons
  if (content.includes('@expo/vector-icons')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]@expo\/vector-icons['"];?/g, (match, imports) => {
      return `import { ${imports} } from '@/utils/icons';`;
    });
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});

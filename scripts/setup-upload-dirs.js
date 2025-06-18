// scripts/setup-upload-dirs.js
const fs = require('fs')
const path = require('path')

const directories = [
  'public/images',
  'public/images/news',
  'public/images/rallies',
  'public/images/avatars'
]

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  } else {
    console.log(`📁 Directory already exists: ${dir}`)
  }
})

// Create a .gitkeep file to ensure directories are tracked in git
directories.forEach(dir => {
  const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep')
  
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '')
    console.log(`📌 Created .gitkeep in: ${dir}`)
  }
})

console.log('\n🎉 Upload directories setup complete!')
console.log('\nNext steps:')
console.log('1. Run: npm run setup-dirs')
console.log('2. Create the API route: src/app/api/upload/image/route.ts')
console.log('3. Update your NewsFormModal component')
console.log('4. Test image uploads!')
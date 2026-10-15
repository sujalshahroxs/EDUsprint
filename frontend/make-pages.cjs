const fs = require('fs');
const path = require('path');

const pages = ['Projects', 'Sprints', 'Timeline', 'Analytics', 'Reports', 'Settings'];

pages.forEach(p => {
  const file = path.join(__dirname, 'src/pages', `${p}.tsx`);
  fs.writeFileSync(file, `export default function ${p}() { return <div className="p-8"><h1 className="text-3xl font-bold dark:text-white mb-4">${p}</h1><div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 text-gray-500">Content coming soon for college presentation...</div></div>; }`);
});

const fs = require('fs');

let c = fs.readFileSync('src/app/admin/users/page.tsx', 'utf8');

const interfaces = `interface User { id: string; username: string; name?: string; role?: string; group?: string; createdAt?: number; [key: string]: unknown; }\ninterface Group { id: string; name: string; }\n`;
if (!c.includes('interface User')) {
  c = interfaces + c;
}

c = c.replace(/useState<any\[\]>\(\[\]\)/, 'useState<User[]>([])').replace(/useState<any\[\]>\(\[\]\)/, 'useState<Group[]>([])');
c = c.replace(/const openEditModal = \(user: any\) =>/g, 'const openEditModal = (user: User) =>');
c = c.replace(/\(g: any\)/g, '(g: Group)');

fs.writeFileSync('src/app/admin/users/page.tsx', c);
console.log('Fixed admin/users/page.tsx');

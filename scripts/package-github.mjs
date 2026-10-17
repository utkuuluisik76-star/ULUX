import {readdir,lstat,mkdir,copyFile,readFile,mkdtemp,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join,relative,basename,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const source=fileURLToPath(new URL('..',import.meta.url));
const scratch=await mkdtemp(join(tmpdir(),'ulux-github-'));
const stage=join(scratch,'source');await mkdir(stage);
const excluded=new Set(['node_modules','.next','out','qa','.git','.claude','.codex','.agents','.wrangler','.vercel','.netlify','starter-reference','coverage']);
const skipFile=name=>name.startsWith('.env')||['AGENTS.md','PROJECT.md','README.md','GITHUB-LEESMIJ.md','.npmrc','.DS_Store','Thumbs.db','desktop.ini','next-env.d.ts','inspect-recording.mjs'].includes(name)||/\.(zip|log|tsbuildinfo|pem|key|p12|pfx)$/i.test(name);
const secretPatterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{35,}\b/,/\bsk-(?:proj-|svcacct-)[A-Za-z0-9_-]{25,}\b/,/\bAKIA[A-Z0-9]{16}\b/];
let count=0,total=0;const large=[];
async function copyTree(folder){
 for(const entry of await readdir(folder,{withFileTypes:true})){
  if(excluded.has(entry.name)||skipFile(entry.name))continue;
  const path=join(folder,entry.name),rel=relative(source,path),target=join(stage,rel);
  const details=await lstat(path);if(details.isSymbolicLink())continue;
  if(entry.isDirectory()){await mkdir(target,{recursive:true});await copyTree(path);continue;}
  if(!entry.isFile())continue;
  if(details.size>=100*1024*1024)large.push(rel);
  if(['.ts','.tsx','.js','.mjs','.json','.yml','.yaml','.toml','.md','.txt','.html','.css'].includes(extname(path))&&details.size<5*1024*1024){
   const text=await readFile(path,'utf8');if(secretPatterns.some(pattern=>pattern.test(text)))throw new Error(`Potential secret in ${rel}; export stopped.`);
  }
  await mkdir(dirname(target),{recursive:true});await copyFile(path,target);count++;total+=details.size;
 }
}
await copyTree(source);if(large.length)throw new Error(`Files exceed GitHub's 100MB limit: ${large.join(', ')}`);
await copyFile(join(source,'GITHUB-LEESMIJ.md'),join(stage,'README.md'));count++;
const base=join(dirname(source),'ULUX-GitHub-2026-10-17');let zip=`${base}.zip`,version=2;
while(await stat(zip).then(()=>true,()=>false))zip=`${base}-${version++}.zip`;
const archive=spawnSync('tar.exe',['-a','-c','-f',zip,'-C',stage,'.'],{encoding:'utf8',maxBuffer:16*1024*1024});
if(archive.status!==0)throw new Error(archive.stderr||'Archive creation failed');
const listing=spawnSync('tar.exe',['-t','-f',zip],{encoding:'utf8',maxBuffer:16*1024*1024});
if(listing.status!==0)throw new Error('Archive cannot be read');
const names=listing.stdout.split(/\r?\n/).filter(Boolean);
if(names.some(name=>name.includes('\\')||name.split('/').some(part=>excluded.has(part)||part.startsWith('.env'))))throw new Error('Unexpected archive paths');
for(const name of ['package.json','package-lock.json','src/components/LeafIntro.tsx','public/images/cap-v2/inside-green-large-720.avif']){
 const extracted=spawnSync('tar.exe',['-xOf',zip,`./${name}`],{maxBuffer:16*1024*1024});
 const original=await readFile(join(stage,name));
 if(extracted.status!==0||!original.equals(extracted.stdout))throw new Error(`Archive integrity check failed: ${name}`);
}
const buffer=await readFile(zip);
console.log(JSON.stringify({zip,files:count,sizeMB:+(buffer.length/1024/1024).toFixed(1),sourceSizeMB:+(total/1024/1024).toFixed(1),sha256:createHash('sha256').update(buffer).digest('hex'),verified:true,excluded:[...excluded,'environment files','private keys','personal project notes']},null,2));

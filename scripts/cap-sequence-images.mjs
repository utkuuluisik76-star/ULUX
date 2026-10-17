import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const root=new URL('../public/images/cap-sequence/',import.meta.url);
for(const name of ['side','rear-quarter','rear','tilt','inside']){
 for(const width of [720,1200])for(const format of ['avif','webp']){
  await sharp(fileURLToPath(new URL(`${name}-source.png`,root)))
   .resize({width}).toFormat(format,{quality:format==='avif'?68:85})
   .toFile(fileURLToPath(new URL(`${name}-${width}.${format}`,root)));
 }
 console.log(`${name}: AVIF + WebP, 720 / 1200 px`);
}

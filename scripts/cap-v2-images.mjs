import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const folder=new URL('../public/images/cap-v2/',import.meta.url);
for(const name of ['front','side','rear-center','rear-quarter','tilt','inside-green-large']){
 const widths=name==='front'?[640,1200,1600]:[720,1200];
 for(const width of widths)for(const format of ['avif','webp']){
  await sharp(fileURLToPath(new URL(`${name}-source.png`,folder))).resize({width}).toFormat(format,{quality:format==='avif'?68:85}).toFile(fileURLToPath(new URL(`${name}-${width}.${format}`,folder)));
 }
 console.log(`${name}: responsive AVIF + WebP ready`);
}

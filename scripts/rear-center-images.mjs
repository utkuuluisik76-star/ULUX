import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const folder=new URL('../public/images/cap-sequence/',import.meta.url);
for(const name of ['rear-center','inside-green','inside-green-large'])for(const width of [720,1200])for(const format of ['avif','webp']){
 await sharp(fileURLToPath(new URL(`${name}-source.png`,folder))).resize({width}).toFormat(format,{quality:format==='avif'?68:85}).toFile(fileURLToPath(new URL(`${name}-${width}.${format}`,folder)));
}

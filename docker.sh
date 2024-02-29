pbase=$(pwd)
pbuild=$(pwd)/build;

rm -rf build
mkdir $pbuild;


cd $pbase/packages/backend

pnpm i &&  
pnpm run build:base &&  
cp -rf dist/* $pbuild &&  
cp source/example.env $pbuild/.env &&  
cp package*.json $pbuild &&  
cd $pbuild && 
npm i --omit=dev;

mkdir $pbuild/build;

cp -rf $pbase/packages/link $pbuild/build;

cd $pbase/packages/bashlike

bun run build
wait $!

cd $pbase/packages/frontend
pnpm i;
pnpm run build;
wait $!
cp -rf out $pbuild/build/frontend

mkdir $pbuild/build/cdn;
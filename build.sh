if [ -d "thumus.eu" ]; then
    cd thumus.eu && git pull origin main && git submodule update --recursive --remote;
    wait $!
elif [ ! -d ".git" ]; then
    git clone --recurse-submodules -j8 https://github.com/Thumuss/thumus.eu thumus.eu && cd thumus.eu;
    wait $!
else
    git pull origin main && git submodule update --recursive --remote;
    wait $!
fi

pbase=$(pwd)
pbuild=$(pwd)/build;

rm -rf build
mkdir $pbuild;


cd $pbase/packages/backend

bun i &&  
bun run build:base &&  
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
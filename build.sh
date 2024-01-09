if [ ! -d ".git" ]; then
    git clone --recurse-submodules -j8 https://github.com/Thumuss/thumus.eu thumus.eu && cd thumus.eu;
    wait $!
fi

pbase=$(pwd)
pbuild=$(pwd)/build;

rm -rf build
mkdir $pbuild;

# cd packages/frontend
# pnpm i && pnpm run build;
# cp -rf dist $pbuild/frontend

cd $pbase;

cd packages/backend

pnpm i &&  
pnpm run build:base &&  
cp -rf dist $pbuild/backend &&  
cp source/example.env $pbuild/backend/.env &&  
cp package*.json $pbuild/backend &&  
cd $pbuild/backend && 
npm i --omit=dev;

cd $pbase;


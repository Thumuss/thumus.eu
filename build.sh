if [ ! -d ".git" ]; then
    git clone https://github.com/Thumuss/thumus.eu thumus.eu && cd thumus.eu;
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
pnpm i && pnpm run build:base && cp -rf dist $pbuild/backend && cd $pbuild/backend && npm i;

cd $pbase;


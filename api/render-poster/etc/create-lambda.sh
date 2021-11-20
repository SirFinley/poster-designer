SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="${SCRIPT_DIR}/.."

docker build -t render-lambda .
docker run \
 --mount type=bind,source=c:/misc/.aws,target=/root/.aws \
 --mount type=bind,source="${ROOT_DIR}",target=/app-src \
 render-lambda bash -c "cd /app && npm run create && cp claudia.json /app-src"
# -it render-lambda bash
#  render-lambda npm run create
# docker run -it render-lambda bash
# (
# echo "Starting the embedding model server..."
# lsof -i :3004 | awk 'NR>1 {print $2}' | xargs kill -9
# cd OpenLLM && ./ss.sh

# ) & 

# (
# echo "Starting the main model server..."
# lsof -i :3003 | awk 'NR>1 {print $2}' | xargs kill -9
# cd llama-cpp-python && ./ss.sh
# ) & 

# (
# echo "Starting the backend server..."
# lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9
# lsof -i :3001 | awk 'NR>1 {print $2}' | xargs kill -9
# cd anything-llm/server/  && yarn dev
# ) & 

# (
# echo "Starting the frontend ..."
# cd anything-llm/frontend/  && yarn start
# ) & 

(
echo "Starting the docs processor...(hotdir watch)"
cd anything-llm/ && ./start_docs_proc.sh 
) &


wait
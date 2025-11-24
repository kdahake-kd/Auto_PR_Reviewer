#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AI PR Review System${NC}\n"

# Check if Redis is running
echo -e "${YELLOW}Checking Redis...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is running${NC}\n"
else
    echo -e "${RED}✗ Redis is not running. Please start Redis first:${NC}"
    echo -e "  ${YELLOW}redis-server${NC}\n"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv env
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source env/bin/activate

# Install dependencies if needed
if [ ! -f "env/.dependencies_installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    touch env/.dependencies_installed
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo -e "\n${GREEN}All dependencies are ready!${NC}\n"
echo -e "${YELLOW}Please run the following commands in separate terminals:${NC}\n"
echo -e "${GREEN}Terminal 1 (Redis):${NC}"
echo -e "  redis-server\n"
echo -e "${GREEN}Terminal 2 (Celery Worker):${NC}"
echo -e "  source env/bin/activate"
echo -e "  cd django_app"
echo -e "  celery -A django_app worker -l info\n"
echo -e "${GREEN}Terminal 3 (Django Backend):${NC}"
echo -e "  source env/bin/activate"
echo -e "  cd django_app"
echo -e "  python manage.py runserver 8080\n"
echo -e "${GREEN}Terminal 4 (FastAPI Gateway):${NC}"
echo -e "  source env/bin/activate"
echo -e "  cd fastapi_app"
echo -e "  uvicorn main:app --reload --port 8000\n"
echo -e "${GREEN}Terminal 5 (React Frontend):${NC}"
echo -e "  cd frontend"
echo -e "  npm run dev\n"
echo -e "${GREEN}Then open: http://localhost:3000${NC}\n"


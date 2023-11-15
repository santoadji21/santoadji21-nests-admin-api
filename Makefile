app: 
    docker-compose up -d

build-app:
	docker-compose up --build -d
	
down: 
	docker-compose down
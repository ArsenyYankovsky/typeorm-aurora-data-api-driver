We're really glad you're reading this, because we need volunteer developers to help this project come to fruition. 👏

## Instructions

These steps will guide you through contributing to this project:

- Fork the repo
- Clone it and install dependencies

	-	`git clone https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver`
	- `yarn install`
	- Before running any functional tests run the following commands:
	  - `yarn build`
		- `yarn link`
		- `yarn link typeorm-aurora-data-api-driver`
	- To run functional tests for Postgres `docker-compose -f docker/pg.yml -d`
		- `docker-compose -f docker/pg.yml -d`
		- `yarn test:pg-func`
	- To run functional tests for MySQL run the following commands:
		- `docker-compose -f docker/mysql.yml -d`
		- `yarn test:mysql-func`

- Make sure to lint before committing
  - `yarn lint`

Finally, send a [GitHub Pull Request](https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/compare?expand=1) with a clear list of what you've done (read more [about pull requests](https://help.github.com/articles/about-pull-requests/)). 
Make sure all of your commits are atomic (one feature per commit) and conventional (https://www.conventionalcommits.org/en/v1.0.0/).

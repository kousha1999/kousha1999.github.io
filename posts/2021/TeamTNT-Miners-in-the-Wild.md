# TeamTNT Miners in the Wild

Last night Me and My friend were Looking for some Redis NOSQL (Ofcourse Most of them does not have any aunthetication 😆) in Shodan and Censys for Bug Hunting.

I've found some interested which led me to write this blog post.

Most of the Redis seemed to be exploited and infected with a Miner by TeamTNT.

I used shodan query `port:6379` to find Redis services.
![](../../images/shodan.png)

Redis has a tool called `redis-cli` which let you interact with Redis servers.
I used it to connect Redis servers to find vulnerabilities and sensitive data for bug hunting report.
To connect a Redis server you can use `redis-cli -h [Redis Server IP]`.
![](../../images/redis-cli-connection.png)

Redis is a Key-Value NOSQL Database that store data in memory, We can find information about Redis state and OS with `info` command.

# TeamTNT Miners in the Wild

Last night Me and My friend were Looking for some Redis NOSQL (Because Most of them does not have any aunthetication 😆) in Shodan and Censys for Bug Hunting.

I've found some interested which led me to write this blog post.

Most of the Redis seemed to be exploited and infected with a Miner by TeamTNT.

I used shodan query `port:6379` to find Redis services.
![](../../images/shodan.png)


Redis has a tool called `redis-cli` which let you interact with Redis servers.
I used it to connect Redis servers to find vulnerabilities and sensitive data for bug hunting report.
To connect a Redis server you can use `redis-cli -h [Redis Server IP]`.
![](../../images/redis-cli-connection.png)


Redis is a **Key-Value** NOSQL Database that store data **in-memory**, We can find information about Redis state and OS with `info` command.
If you want to see just the Keyspace part (Information about Keys and DBs), Use `info Keyspace`.
![](../../images/redis-cli-info.png)
![](../../images/redis-cli-info-keyspace.png)


It has a **db0** and **4 Key**. We can dump keys with `DUMP`, Also you can use `MGET` if `DUMP` didn't work. (Bypass Technique?!😃)
![](../../images/redis-cli-dump.png)


We can see there is a URL that requested by **cURL**. I've downloaded the file and used `file` command to determine what kind of file this is.
![](../../images/malware-sh.png)
![](../../images/malware-sh-content.png)

It as 1488 lines of code 😐. I've analyzed some parts of this bash script and I'll explain some functionalities of it.
In the last image you can see line 4 send output of `id` command to Hackers C2. Also in the next few lines you can see **miner** word multiple times which can be a good indicator we dealing with a CryptoMiner.

After all these, It checks if **Alibaba Cloud Monitoring Service** enabled or not (till line 140). After that it disable **SELINUX**, **AppArmor** and **Aliyun**.
This Bash Malware actually use [THIS SCRIPT](https://github.com/leitbogioro/Fuck_Aliyun/blob/master/Fuck_Aliyun.sh) for disabling **Alibaba Cloud Monitoring Service**.

![malware-sh-disablefunc1](https://user-images.githubusercontent.com/36133745/134326008-41e7b387-aebe-4cac-9fb3-80a01fdce3e4.png)
![malware-sh-disablefunc2](https://user-images.githubusercontent.com/36133745/134326017-23d16c44-d0ad-4de7-8df0-27555a1b5355.png)
![malware-sh-disablefunc3](https://user-images.githubusercontent.com/36133745/134326047-4ff2d7c7-a812-4c4b-8a1e-4e3d192243cb.png)

After all these functions, There are some URLs with **jpg** extension which are configs and miner and etc.
![malware-sh-urls](https://user-images.githubusercontent.com/36133745/134329743-eaf3e08e-604d-4177-b83f-6850c12d2100.png)

The first URL (mid.jpg) downloaded and it's a **gzip** file. I've renamed and extracted it, It's compressed by **tar** again, So again decompressed it.
![](https://user-images.githubusercontent.com/36133745/134333023-0d8de1e9-11cf-4622-b39c-d59e7856ca5f.png)

It gives us 2 file named (**[ext4]** and **[ext4.pid]**). The main file is an ELF file and pid file is a json configuration file.
![](https://user-images.githubusercontent.com/36133745/134333352-96f183d6-95c4-48a2-9f80-462cd67fd5cf.png)

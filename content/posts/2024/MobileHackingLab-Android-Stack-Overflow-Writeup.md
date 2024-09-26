---
title: "Android Stack Overflow Exploitation (ARMv7) - MobileHackingLab"
date: "2024-09-26T19:00:00+02:00"
author: "Kousha Zanjani"
image: https://github.com/user-attachments/assets/6a598d4e-8425-431d-af16-05b2810a37f8
description: In this post, we explore an Android Stack Overflow vulnerability within a server-client chat messaging application. By analyzing the native code and leveraging vulnerabilities such as format string and stack buffer overflow, we develop an exploit using pwntools to gain control of the target system. Throughout the process, we also examine security features like RELRO, stack canaries, and NX to understand the defenses in place and how to bypass them.
showFullContent: false
tags: ["Android", "Exploitation", "ExploitDevelopment", "ReverseEngineering", "MobileHackingLab"]
keywords: ["Android", "Exploitation", "ExploitDevelopment", "ReverseEngineering", "MobileHackingLab"]
readingTime: true
---
# Android Stack Overflow Exploitation (ARMv7) - MobileHackingLab

In this post, I will be walking through the solution to an Android Stack Overflow vulnerability while keeping security mechanisms enabled. The twist? I won’t be using Frida to bypass protections this time! 😉

Let's dive right in and break things down step by step.

<p align="center">
<img src="https://user-images.githubusercontent.com/36133745/164783235-d8df38a6-e0f3-4e68-9f64-57fa21b98435.gif">
</p>

## Initial Setup and Analysis

I’ve downloaded the target application and begun my analysis by reviewing the Java code. Since we’re dealing with ARM architecture, our approach will focus on analyzing and exploiting the vulnerability within that context.

### Setting Up the AVD (Android Virtual Device)

To start, I installed and ran the app on a **Pixel 3a** device using **API 25** on **Android Studio's AVD**. This setup will allow us to simulate and observe the app's behavior in a controlled environment.

Let's see how the app looks and functions within this AVD before we dive deeper into the vulnerability analysis.

![jadx-initialize](https://github.com/user-attachments/assets/75997cf2-c843-4388-8dc6-3552af0905ce)

## Application Overview

It appears that the application is a **Server/Client Chat Messaging Application** running on **port 6000**, as indicated by the line:

```Java
public static final int SERVERPORT = 6000;
```

The app also loads a native binary library called **"native-lib"**, which contains three interesting functions:

* `leakMemory()`
* `overFlow()`
* `stringFromJNI()`

These functions are defined in the following snippet:

```Java
public native String leakMemory(byte[] bArr);

public native void overFlow(byte[] bArr, int i);

public native String stringFromJNI();

static {
    System.loadLibrary("native-lib");
}
```

## Vulnerabilities in Native Functions

Upon further inspection, we can see that the `memoryLeak()` function is vulnerable to a **Format String vulnerability**, while the `overFlow()` function leverages the `cp()` function, which is vulnerable to a **Stack Buffer Overflow**.

![ghidra-decompiled](https://github.com/user-attachments/assets/c8bad8cb-06fa-4187-a1c9-0b321b8cdb34)

Here’s the vulnerable `cp()` function:

```c
/* cp(char const*, int) */
void cp(char *param_1, int param_2) {
  undefined auStack_d8[200];
  int local_10;
  char *local_c;

  local_10 = param_2;
  local_c = param_1;
  __aeabi_memclr(auStack_d8, 200);
  
  if (0 < local_10) {
    __aeabi_memcpy(auStack_d8, local_c, local_10);
  }
  return;
}
```

The buffer `auStack_d8` has a fixed size of 200 bytes, and the function copies data into it without sufficient boundary checks, making it vulnerable to Stack Buffer Overflow when `param_2` exceeds the buffer size.

## Analyzing Behavior with Frida

To better understand the behavior, we can connect to **port 6000**, send some crafted data, and observe how the application responds. While doing this, I used **Frida** to trace which functions are called and in what order.

### Steps to Run the Application and Attach Frida

First, launch the application via ADB:

```sh
adb shell am start -n com.example.mynativetest/.MainActivity
```

Next, execute the Frida server on the target device:

```sh
/data/local/tmp/frida-server-16.4.10-android-arm
```

Finally, attach to the application using **Frida-Trace** to monitor native function calls:

```sh
frida-trace -U -i "Java_*" mynativetest
```

At this point, we can start sending data to the server on port 6000 and monitor how the vulnerable functions (`memoryLeak()` and `cp()`) behave in real-time.

With **Frida-Trace** now ready to instrument the called functions, the next step is to connect to the server on **port 6000**. To make things easier for local analysis, I performed a little trick by using **ADB port forwarding** to map the server's port to my localhost.

Here’s the command to forward **port 6000** from the device to localhost:

```sh
adb forward tcp:6000 tcp:6000
```

By doing this, we can interact with the application locally as if it were running on the same machine, allowing us to send and receive data directly through `localhost:6000`.

![frida-trace](https://github.com/user-attachments/assets/3f11701b-1151-4f55-9574-61aade55f9f2)

## Testing for Vulnerabilities

Now, it's time to conduct some tests to confirm the vulnerabilities in the application. I will use `%x` as input to examine how `snprintf` behaves and to verify if it is indeed vulnerable to format string attacks.

### Verifying Format String Vulnerability

By sending this input, we can observe how the application handles formatted data and if any unintended information is leaked, indicating a format string vulnerability.

![memoryLeak Format String](https://github.com/user-attachments/assets/e4826074-8a35-4d75-a85a-dc5be2982f6d)

### Verifying Stack Overflow Vulnerability

Having confirmed the format string vulnerability, the next step is to check if the application is also vulnerable to stack overflow. 

To do this, I will send a payload that exceeds the buffer size in the `cp()` function. By crafting an input larger than the 200-byte limit, we can observe if the application crashes or behaves unexpectedly, indicating a successful stack overflow.

Let's proceed with this test and analyze the results.

![overFlow Test](https://github.com/user-attachments/assets/a11b40e4-968a-46f3-9a4f-aaf1b01ab59b)

## Analyzing Security Features

To understand the security posture of the application, I ran a check on the native library `libnative-lib.so` to see what kind of security mechanisms are in place. Here are the results:

```sh
$ checksec libnative-lib.so
[*] '/home/kousha/Desktop/tools/frida/bof/blog-files/apktool-out/lib/armeabi-v7a/libnative-lib.so'
    Arch:     arm-32-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```
### Security Features Explained

* Arch: `arm-32-little`
    * This indicates that the architecture of the library is ARM 32-bit, which is commonly used in Android devices.

* RELRO (Read-Only Relocations): `Full RELRO`
    * This means that the library uses full RELRO, making it harder for attackers to exploit memory corruption vulnerabilities related to Global Offset Table (GOT) entries. It prevents modifications to the GOT during runtime.

* Stack Protection: `Canary found`
    * The presence of a stack canary indicates that the application employs stack protection. This mechanism helps to detect stack buffer overflows by placing a known value (the canary) before the return address on the stack. If this value is altered during a buffer overflow, the program can detect the attack and terminate.

* NX (No eXecute): `NX enabled`
    * NX (or DEP - Data Execution Prevention) prevents execution of code in certain regions of memory (like the stack). This mitigates the risk of executing shellcode injected through a buffer overflow.

* PIE (Position Independent Executable): `PIE enabled`
    * PIE allows the application to be loaded at random addresses in memory, making it more difficult for an attacker to predict the location of specific functions or buffers, thus enhancing security against certain types of exploits.

These security features indicate a robust defense against common vulnerabilities, but the presence of vulnerabilities like format string and potential stack overflow suggests that additional care must be taken to secure the application.

## Exploit Development: A Step-by-Step Approach

I developed an exploit using the **pwntools** library to target the vulnerabilities identified in the Android application running on port 6000. The approach involved the following steps:

1. **Establishing Connection**
    * I started by establishing a connection to the application using a client-server model. The application was running locally after forwarding port 6000, which allowed me to communicate with the vulnerable server.

2. **Leaking the Stack Address**
    * Using the format string vulnerability, I was able to leak a stack address. This provided insight into the memory layout and helped me identify key memory addresses necessary for building the exploit.

3. **Leaking the Libc Address**
    * Next, I used the same format string vulnerability to leak a **libc** address. The **libc** base address is crucial for calculating the locations of important functions like `system()`, which I used later in the exploit.

4. **Calculating Gadgets and System Call**
    * Once the **libc** base address was identified, I calculated the offsets for useful gadgets, such as **pop r0, pc**, and determined the address for the `system()` function. Additionally, I prepared the arguments for `system()` to execute a reverse shell.

5. **Crafting the Exploit Payload**
    * I then crafted the payload to exploit the **stack buffer overflow** vulnerability. This payload included the necessary padding, followed by the memory addresses of the gadgets and the `system()` call, along with the arguments.

6. **Executing the Exploit**
    * Finally, I sent the crafted payload to the server, triggering the overflow and executing the reverse shell. I maintained an interactive session with the target, gaining full control over the device.

This approach effectively exploited both the **format string vulnerability** and the **stack buffer overflow**, leading to full remote code execution on the vulnerable application.

### 1. Establishing Connection

For the first step, we are going to connect to port **6000** using **pwntools**. This allows us to interact with the vulnerable application running on the server. Here’s the code snippet for establishing the connection and receiving the welcome message:

```python
from pwn import *

conn = remote('localhost', 6000)

welcome_message = conn.recvuntil(b"Welcome to Damn Exploitable Android App!")
print(f"Received: {welcome_message.decode()}")
```

In this code:
* `remote('localhost', 6000)` establishes the connection to the application running on port 6000.
* We use `recvuntil` to receive and display the welcome message, confirming that the connection is successful and ready for further interaction.

This sets up the initial communication with the server before moving on to exploiting the vulnerabilities.

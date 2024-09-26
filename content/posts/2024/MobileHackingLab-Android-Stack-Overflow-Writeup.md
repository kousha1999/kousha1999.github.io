---
title: "Android Stack Overflow Exploitation (ARMv7) - MobileHackingLab"
date: "2024-09-26T19:00:00+02:00"
author: "Kousha Zanjani"
image: https://github.com/user-attachments/assets/6a598d4e-8425-431d-af16-05b2810a37f8
description: My journey into Android exploitation at the binary level started with a deep passion for the subject. I was determined to simplify the process as much as possible, but it turne>
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

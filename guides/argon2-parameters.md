# Explanation of Argon2 Parameters: `MEMORY_COST`, `TIME_COST`, and `PARALLELISM`

## `MEMORY_COST`

The **memory cost** in Argon2 specifies the amount of memory (in kilobytes) used during the key derivation process. The memory cost is specified as a power of 2, and each increment represents a doubling of the memory requirement. Here's how the values translate into memory sizes:

- `2^16` KB = **65,536 KB** = **64 MB**
- `2^17` KB = **131,072 KB** = **128 MB**
- `2^18` KB = **262,144 KB** = **256 MB**

### Understanding the Calculation:
- `2^16` is 65,536 KB, which is equivalent to **64 MB** (since 1 MB = 1,024 KB).
- `2^17` is 131,072 KB, which is equivalent to **128 MB**.
- `2^18` is 262,144 KB, which is equivalent to **256 MB**.

This exponential growth in memory usage increases the computational difficulty of brute-force attacks, making Argon2 more secure at the cost of higher memory consumption.

## `TIME_COST`

The **`TIME_COST`** parameter in Argon2 determines how many iterations the algorithm performs during the hashing process. Increasing the time cost makes the algorithm take longer to compute the hash, which adds resistance against brute-force attacks.

### How `TIME_COST` Works:
- **`TIME_COST`** specifies the number of iterations (or rounds) of the hash function.
- Each increase in `TIME_COST` makes the hash computation more expensive and time-consuming.
- The value of `TIME_COST` is usually set to 1, 2, or 3, but higher values can be used for stronger security, especially for highly sensitive data.
- A larger `TIME_COST` is more effective against attackers because it increases the time it takes to generate each hash, making brute-force attempts slower.

### Example:
- `TIME_COST: 3` means the algorithm will iterate 3 times for each hash.
- The value should be chosen based on the desired level of security and performance considerations.

#### Recommended Value:
- **3** is a good balance between security and performance. For higher security, you can increase it to **4** or **5**, but it may affect performance, especially on constrained systems.

## `PARALLELISM`

The **`PARALLELISM`** parameter specifies how many parallel threads the Argon2 algorithm uses during hashing. Argon2 can process multiple blocks of data simultaneously, making it faster on multi-core systems.

### How `PARALLELISM` Works:
- **`PARALLELISM`** defines the number of independent threads (or lanes) the algorithm runs in parallel during the hashing process.
- A higher value of `PARALLELISM` uses more CPU cores, making the algorithm faster.
- However, increasing `PARALLELISM` also increases memory usage and could impact performance on systems with fewer cores.

### Example:
- `PARALLELISM: 1` means the algorithm uses a single thread for processing.
- `PARALLELISM: 2` means it will use two threads, and so on.

#### Recommended Value:
- **1** is sufficient for most cases. If you're working on a high-performance server with multiple cores, you can increase this to **2** or higher, depending on the number of cores and the desired performance.

---

### Summary:

- **`MEMORY_COST`**: Specifies the amount of memory used during hashing. Higher memory cost increases security but also memory consumption. Recommended values: **2^16 (64 MB)** or **2^17 (128 MB)**.
- **`TIME_COST`**: Controls how many iterations the hashing function performs. Increasing it improves security but slows down hashing time. Recommended value: **3**.
- **`PARALLELISM`**: Controls how many threads the algorithm uses during the hash computation. It improves speed on multi-core systems but increases memory usage. Recommended value: **1** for most scenarios.

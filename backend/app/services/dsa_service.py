from typing import List, Dict, Any
import time

class BSTNode:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.left = None
        self.right = None

class DsaService:
    @staticmethod
    def _get_val(item, field):
        return str(item.get(field, "")).lower()

    @staticmethod
    def linear_search(data: List[Dict[str, Any]], field: str, query: str):
        comparisons = 0
        results = []
        q = query.lower()
        for item in data:
            comparisons += 1
            if q in DsaService._get_val(item, field):
                results.append(item)
        return results, comparisons

    @staticmethod
    def binary_search(data: List[Dict[str, Any]], field: str, query: str):
        comparisons = 0
        results = []
        low = 0
        high = len(data) - 1
        q = query.lower()
        while low <= high:
            comparisons += 1
            mid = (low + high) // 2
            mid_val = DsaService._get_val(data[mid], field)
            if mid_val == q:
                results.append(data[mid])
                break
            elif mid_val < q:
                low = mid + 1
            else:
                high = mid - 1
        return results, comparisons

    @staticmethod
    def hash_search(data: List[Dict[str, Any]], field: str, query: str):
        comparisons = 0
        hash_map = {}
        for item in data:
            val = DsaService._get_val(item, field)
            if val not in hash_map:
                hash_map[val] = []
            hash_map[val].append(item)
            
        q = query.lower()
        comparisons += 1 # hash lookup
        return hash_map.get(q, []), comparisons

    @staticmethod
    def bst_search(data: List[Dict[str, Any]], field: str, query: str):
        root = None
        for item in data:
            key = DsaService._get_val(item, field)
            if root is None:
                root = BSTNode(key, [item])
            else:
                curr = root
                while True:
                    if key == curr.key:
                        curr.value.append(item)
                        break
                    elif key < curr.key:
                        if curr.left is None:
                            curr.left = BSTNode(key, [item])
                            break
                        curr = curr.left
                    else:
                        if curr.right is None:
                            curr.right = BSTNode(key, [item])
                            break
                        curr = curr.right
        
        comparisons = 0
        q = query.lower()
        curr = root
        while curr:
            comparisons += 1
            if q == curr.key:
                return curr.value, comparisons
            elif q < curr.key:
                curr = curr.left
            else:
                curr = curr.right
        return [], comparisons

    @staticmethod
    def search(data: List[Dict[str, Any]], field: str, query: str, algorithm: str):
        start_time = time.perf_counter()
        comparisons = 0
        complexity = "O(N)"
        
        if algorithm == "binary":
            data.sort(key=lambda x: DsaService._get_val(x, field))
            results, comparisons = DsaService.binary_search(data, field, query)
            complexity = "O(log N)"
        elif algorithm == "hash":
            results, comparisons = DsaService.hash_search(data, field, query)
            complexity = "O(1)"
        elif algorithm == "bst":
            results, comparisons = DsaService.bst_search(data, field, query)
            complexity = "O(h)"
        else:
            results, comparisons = DsaService.linear_search(data, field, query)
            complexity = "O(N)"
            
        end_time = time.perf_counter()
        execution_time_ms = (end_time - start_time) * 1000

        return {
            "results": results,
            "algorithm_used": algorithm,
            "execution_time_ms": execution_time_ms,
            "complexity_info": complexity,
            "comparisons": comparisons
        }
        
    @staticmethod
    def sort(data: List[Dict[str, Any]], field: str, algorithm: str):
        start_time = time.perf_counter()
        comparisons = 0
        swaps = 0
        n = len(data)
        
        if algorithm == "bubble":
            for i in range(n):
                for j in range(0, n-i-1):
                    comparisons += 1
                    if DsaService._get_val(data[j], field) > DsaService._get_val(data[j+1], field):
                        data[j], data[j+1] = data[j+1], data[j]
                        swaps += 1
        elif algorithm == "selection":
            for i in range(n):
                min_idx = i
                for j in range(i+1, n):
                    comparisons += 1
                    if DsaService._get_val(data[j], field) < DsaService._get_val(data[min_idx], field):
                        min_idx = j
                if min_idx != i:
                    data[i], data[min_idx] = data[min_idx], data[i]
                    swaps += 1
        elif algorithm == "insertion":
            for i in range(1, n):
                key = data[i]
                j = i - 1
                comparisons += 1
                while j >= 0 and DsaService._get_val(data[j], field) > DsaService._get_val(key, field):
                    data[j + 1] = data[j]
                    swaps += 1
                    j -= 1
                    comparisons += 1 if j >= 0 else 0
                data[j + 1] = key
        elif algorithm == "merge":
            comparisons, swaps = DsaService._merge_sort(data, field, 0, n - 1, [0, 0])
        elif algorithm == "quick":
            comparisons, swaps = DsaService._quick_sort(data, field, 0, n - 1, [0, 0])
        elif algorithm == "heap":
            comparisons, swaps = DsaService._heap_sort(data, field)
        else:
            for i in range(n):
                for j in range(0, n - i - 1):
                    comparisons += 1
                    if DsaService._get_val(data[j], field) > DsaService._get_val(data[j + 1], field):
                        data[j], data[j + 1] = data[j + 1], data[j]
                        swaps += 1

        complexity_map = {
            "bubble": ("O(N²)", "O(1)"),
            "selection": ("O(N²)", "O(1)"),
            "insertion": ("O(N²)", "O(1)"),
            "merge": ("O(N log N)", "O(N)"),
            "quick": ("O(N log N)", "O(log N)"),
            "heap": ("O(N log N)", "O(1)"),
        }
        time_complexity, space_complexity = complexity_map.get(algorithm, ("O(N²)", "O(1)"))

        end_time = time.perf_counter()
        execution_time_ms = (end_time - start_time) * 1000

        return {
            "sorted_data": data,
            "algorithm_used": algorithm,
            "execution_time_ms": execution_time_ms,
            "comparisons": comparisons,
            "swaps": swaps,
            "time_complexity": time_complexity,
            "space_complexity": space_complexity,
        }

    @staticmethod
    def _merge_sort(data, field, left, right, counters):
        if left >= right:
            return counters[0], counters[1]
        mid = (left + right) // 2
        DsaService._merge_sort(data, field, left, mid, counters)
        DsaService._merge_sort(data, field, mid + 1, right, counters)
        # Merge step
        left_part = data[left:mid + 1]
        right_part = data[mid + 1:right + 1]
        i = j = 0
        k = left
        while i < len(left_part) and j < len(right_part):
            counters[0] += 1
            if DsaService._get_val(left_part[i], field) <= DsaService._get_val(right_part[j], field):
                data[k] = left_part[i]
                i += 1
            else:
                data[k] = right_part[j]
                j += 1
                counters[1] += 1
            k += 1
        while i < len(left_part):
            data[k] = left_part[i]
            i += 1
            k += 1
        while j < len(right_part):
            data[k] = right_part[j]
            j += 1
            k += 1
        return counters[0], counters[1]

    @staticmethod
    def _quick_sort(data, field, low, high, counters):
        if low < high:
            pivot_idx = DsaService._partition(data, field, low, high, counters)
            DsaService._quick_sort(data, field, low, pivot_idx - 1, counters)
            DsaService._quick_sort(data, field, pivot_idx + 1, high, counters)
        return counters[0], counters[1]

    @staticmethod
    def _partition(data, field, low, high, counters):
        pivot = DsaService._get_val(data[high], field)
        i = low - 1
        for j in range(low, high):
            counters[0] += 1
            if DsaService._get_val(data[j], field) <= pivot:
                i += 1
                data[i], data[j] = data[j], data[i]
                counters[1] += 1
        data[i + 1], data[high] = data[high], data[i + 1]
        counters[1] += 1
        return i + 1

    @staticmethod
    def _heap_sort(data, field):
        n = len(data)
        comparisons = 0
        swaps = 0

        def heapify(arr, size, root):
            nonlocal comparisons, swaps
            largest = root
            l, r = 2 * root + 1, 2 * root + 2
            if l < size:
                comparisons += 1
                if DsaService._get_val(arr[l], field) > DsaService._get_val(arr[largest], field):
                    largest = l
            if r < size:
                comparisons += 1
                if DsaService._get_val(arr[r], field) > DsaService._get_val(arr[largest], field):
                    largest = r
            if largest != root:
                arr[root], arr[largest] = arr[largest], arr[root]
                swaps += 1
                heapify(arr, size, largest)

        for i in range(n // 2 - 1, -1, -1):
            heapify(data, n, i)
        for i in range(n - 1, 0, -1):
            data[0], data[i] = data[i], data[0]
            swaps += 1
            heapify(data, i, 0)
        return comparisons, swaps

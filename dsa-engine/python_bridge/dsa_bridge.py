import ctypes
import os
import sys

class SearchResult(ctypes.Structure):
    _fields_ = [
        ("found", ctypes.c_int),
        ("index", ctypes.c_int),
        ("comparisons", ctypes.c_int),
        ("time_ns", ctypes.c_longlong),
        ("algorithm", ctypes.c_char * 50),
        ("complexity", ctypes.c_char * 50)
    ]

class LibraxDSABridge:
    def __init__(self):
        lib_name = "librax_dsa.dll" if os.name == "nt" else "librax_dsa.so"
        search_paths = [".", "..", "src"]
        self.lib = None
        for p in search_paths:
            path = os.path.join(p, lib_name)
            if os.path.exists(path):
                self.lib = ctypes.CDLL(path)
                break
        if not self.lib:
            print(f"Warning: {lib_name} not found. Please compile the C library first.")

    def search_by_isbn(self, isbn):
        if not self.lib: return None
        return {"isbn": isbn, "found": True}

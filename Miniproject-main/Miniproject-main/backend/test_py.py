import sys
print("Python is working")
print(sys.version)
try:
    import pandas
    print("pandas is installed")
except ImportError:
    print("pandas is NOT installed")
try:
    import sklearn
    print("sklearn is installed")
except ImportError:
    print("sklearn is NOT installed")

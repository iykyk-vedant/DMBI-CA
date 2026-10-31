"""Dataset Acquisition Helper.
Attempts to download and extract 'Online Retail.xlsx' from the official UCI repository
if network is available, or provides exact manual download instructions if not.
"""

import sys
import io
import zipfile
from pathlib import Path

# Add backend directory to path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import RAW_DATA_DIR, RAW_DATASET_NAME, RAW_DATASET_PATH

UCI_ZIP_URL = "https://archive.ics.uci.edu/static/public/352/online+retail.zip"
MANUAL_URL = "https://archive.ics.uci.edu/dataset/352/online+retail"


def ensure_dataset() -> bool:
    """Checks if the dataset exists; if not, attempts to download it.
    Returns True if dataset is available, False otherwise.
    """
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    if RAW_DATASET_PATH.exists():
        size_mb = RAW_DATASET_PATH.stat().st_size / (1024 * 1024)
        print(f"Dataset already exists: {RAW_DATASET_PATH} ({size_mb:.2f} MB)")
        return True

    print(f"Dataset not found at {RAW_DATASET_PATH}")
    print(f"Attempting to download from UCI repository ({UCI_ZIP_URL})...")

    try:
        import urllib.request
        req = urllib.request.Request(
            UCI_ZIP_URL,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            content = response.read()

        print(f"Downloaded {len(content) / (1024 * 1024):.2f} MB. Extracting...")
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            namelist = z.namelist()
            xlsx_name = next((n for n in namelist if n.endswith(".xlsx")), None)
            if not xlsx_name:
                raise FileNotFoundError(f"No .xlsx file found inside zip: {namelist}")

            with z.open(xlsx_name) as source, open(RAW_DATASET_PATH, "wb") as target:
                target.write(source.read())

        size_mb = RAW_DATASET_PATH.stat().st_size / (1024 * 1024)
        print(f"Successfully downloaded and saved dataset to: {RAW_DATASET_PATH} ({size_mb:.2f} MB)")
        return True

    except Exception as exc:
        print("\n" + "=" * 70)
        print("DATASET ACQUISITION NOTICE:")
        print(f"Could not automatically download dataset: {exc}")
        print("Please manually download the 'Online Retail.xlsx' file from:")
        print(f"  {MANUAL_URL}")
        print("and place it at:")
        print(f"  {RAW_DATASET_PATH}")
        print("=" * 70 + "\n")
        return False


if __name__ == "__main__":
    success = ensure_dataset()
    sys.exit(0 if success else 1)


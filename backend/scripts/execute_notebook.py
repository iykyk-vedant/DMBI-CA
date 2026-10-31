"""Executes all code cells in ca2_analysis.ipynb and saves the cell outputs."""

import sys
import json
import io
import contextlib
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent.parent
NOTEBOOK_PATH = WORKSPACE_DIR / "notebooks" / "ca2_analysis.ipynb"

def execute_notebook():
    print(f"Loading notebook: {NOTEBOOK_PATH}")
    with open(NOTEBOOK_PATH, "r", encoding="utf-8") as f:
        nb = json.load(f)

    # Shared global namespace for sequential cell execution
    nb_globals = {
        "__name__": "__main__",
        "__file__": str(NOTEBOOK_PATH),
    }

    exec_counter = 1
    for i, cell in enumerate(nb["cells"]):
        if cell["cell_type"] != "code":
            continue

        source_code = "".join(cell.get("source", []))
        print(f"\n--- Executing Code Cell {exec_counter} (Index {i}) ---")

        stdout_buf = io.StringIO()
        stderr_buf = io.StringIO()

        try:
            with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
                exec(source_code, nb_globals)
            out_text = stdout_buf.getvalue()
            err_text = stderr_buf.getvalue()

            outputs = []
            if out_text:
                outputs.append({
                    "name": "stdout",
                    "output_type": "stream",
                    "text": [line + "\n" for line in out_text.rstrip("\n").split("\n")]
                })
            if err_text:
                outputs.append({
                    "name": "stderr",
                    "output_type": "stream",
                    "text": [line + "\n" for line in err_text.rstrip("\n").split("\n")]
                })

            cell["outputs"] = outputs
            cell["execution_count"] = exec_counter
            print(f"Cell {exec_counter} succeeded. Captured {len(out_text)} stdout chars.")
            if out_text:
                first_lines = out_text.strip().split("\n")[:3]
                print("  Sample output: " + " | ".join(first_lines))

        except Exception as e:
            print(f"Error executing cell {exec_counter}: {e}")
            cell["outputs"] = [{
                "ename": type(e).__name__,
                "evalue": str(e),
                "output_type": "error",
                "traceback": [f"{type(e).__name__}: {str(e)}"]
            }]
            cell["execution_count"] = exec_counter
            raise

        exec_counter += 1

    with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)

    print(f"\nSuccessfully executed all {exec_counter - 1} code cells and saved outputs to {NOTEBOOK_PATH}")

if __name__ == "__main__":
    execute_notebook()


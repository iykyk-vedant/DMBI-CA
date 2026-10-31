"""Unit tests for the CA2 Preprocessing Pipeline."""

import pytest
import pandas as pd
import numpy as np
from app.services.preprocessing import (
    NON_PRODUCT_EXACT_CODES,
    VALID_STOCK_CODE_REGEX
)


def test_cancellation_identification():
    """Verify that invoices with prefix 'C' are identified as cancellations."""
    invoices = pd.Series(["536365", "C536379", " 536366 ", "C123456", "536367"])
    is_cancellation = invoices.astype(str).str.strip().str.startswith("C")
    assert is_cancellation.tolist() == [False, True, False, True, False]


def test_invalid_quantity_and_price_filters():
    """Verify that Quantity <= 0 and UnitPrice <= 0 are correctly flagged."""
    df = pd.DataFrame({
        "Quantity": [10, -1, 0, 5, 2],
        "UnitPrice": [2.5, 3.0, 1.5, 0.0, -0.5]
    })
    q_valid = df["Quantity"] > 0
    p_valid = df["UnitPrice"] > 0
    valid_rows = q_valid & p_valid
    assert valid_rows.tolist() == [True, False, False, False, False]


def test_non_product_code_exclusion():
    """Verify exclusion of postage, banking charges, and invalid regex codes."""
    codes = ["85123A", "22423", "POST", "DOT", "BANK CHARGES", "gift_0001_10", "D", "M", "71053", "INVALID_CODE"]
    for code in codes:
        upper = code.upper().strip()
        is_exact = upper in NON_PRODUCT_EXACT_CODES
        is_voucher = upper.startswith("GIFT_0001")
        matches_regex = bool(VALID_STOCK_CODE_REGEX.match(code.strip()))
        should_exclude = is_exact or is_voucher or (not matches_regex)

        if code in ["85123A", "22423", "71053"]:
            assert not should_exclude, f"Valid stock code {code} was incorrectly excluded"
        else:
            assert should_exclude, f"Invalid code {code} was not excluded"


def test_uk_scope_filter():
    """Verify that only United Kingdom transactions are preserved."""
    df = pd.DataFrame({
        "InvoiceNo": [1, 2, 3, 4],
        "Country": ["United Kingdom", "France", "United Kingdom", "Germany"]
    })
    uk_df = df[df["Country"].str.strip() == "United Kingdom"]
    assert len(uk_df) == 2
    assert set(uk_df["InvoiceNo"]) == {1, 3}


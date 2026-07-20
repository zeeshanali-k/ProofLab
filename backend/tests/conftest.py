from __future__ import annotations

import os
import tempfile
from pathlib import Path


_test_database_dir = Path(tempfile.mkdtemp(prefix="prooflab-tests-"))
os.environ.setdefault("PROOFLAB_DATABASE_PATH", str(_test_database_dir / "prooflab.db"))

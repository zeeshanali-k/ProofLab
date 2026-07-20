from __future__ import annotations

import os
from pathlib import Path

from dotenv import dotenv_values


def load_backend_environment(package_dir: Path | None = None) -> None:
    """Load local backend settings without overriding values supplied by the host.

    A shell variable, Docker environment value, or deployment secret always wins.
    For local uv use, the repository ``.env`` is loaded first, then
    ``backend/.env`` and finally a closer ``backend/prooflab_api/.env``.
    """

    process_environment = set(os.environ)
    package_dir = package_dir or Path(__file__).resolve().parent
    for env_path in (package_dir.parent.parent / ".env", package_dir.parent / ".env", package_dir / ".env"):
        if not env_path.is_file():
            continue
        for key, value in dotenv_values(env_path).items():
            if value is not None and key not in process_environment:
                os.environ[key] = value

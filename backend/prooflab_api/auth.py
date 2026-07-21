"""Credential, session, and current-user services for the local demo."""

from __future__ import annotations

import hashlib
import os
import secrets
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from uuid import uuid4

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import Depends, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .database import AuthSession, LearnerProfile, User, get_db, utc_now


SESSION_COOKIE_NAME = "prooflab_session"
SESSION_DAYS = 14
INVALID_CREDENTIALS_MESSAGE = "Invalid email or password."

_password_hasher = PasswordHasher()
_login_failures: defaultdict[tuple[str, str], deque[datetime]] = defaultdict(deque)
_login_lock = Lock()


@dataclass(frozen=True)
class CurrentUser:
    user: User
    profile: LearnerProfile

    @property
    def id(self) -> str:
        return self.user.id


class DuplicateEmailError(Exception):
    pass


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_session(db: Session, user_id: str) -> tuple[str, AuthSession]:
    token = secrets.token_urlsafe(32)
    now = utc_now()
    session = AuthSession(
        id=str(uuid4()),
        user_id=user_id,
        token_digest=hashlib.sha256(token.encode("utf-8")).hexdigest(),
        expires_at=now + timedelta(days=SESSION_DAYS),
        created_at=now,
        updated_at=now,
    )
    db.add(session)
    return token, session


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    goal: str,
    confidence: str,
    active_track: str,
) -> CurrentUser:
    normalized_email = normalize_email(email)
    if db.scalar(select(User.id).where(User.email == normalized_email)):
        raise DuplicateEmailError
    now = utc_now()
    user = User(
        id=str(uuid4()),
        email=normalized_email,
        password_hash=hash_password(password),
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.flush()
    profile = LearnerProfile(
        user_id=user.id,
        goal=goal,
        confidence=confidence,
        active_track=active_track,
        gamification_enabled=active_track != "professional",
        onboarding_completed=True,
        created_at=now,
        updated_at=now,
    )
    db.add(profile)
    db.flush()
    return CurrentUser(user=user, profile=profile)


def find_current_user(db: Session, token: str | None) -> CurrentUser | None:
    if not token:
        return None
    token_digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    session = db.scalar(select(AuthSession).where(AuthSession.token_digest == token_digest))
    if session is None:
        return None
    now = utc_now()
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= now:
        db.delete(session)
        db.commit()
        return None
    user = db.get(User, session.user_id)
    profile = db.get(LearnerProfile, session.user_id)
    if user is None or profile is None:
        return None
    return CurrentUser(user=user, profile=profile)


def revoke_session(db: Session, token: str | None) -> None:
    if not token:
        return
    token_digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    db.execute(delete(AuthSession).where(AuthSession.token_digest == token_digest))
    db.commit()


def _remote_address(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _failure_key(request: Request, normalized_email: str) -> tuple[str, str]:
    return (_remote_address(request), normalized_email)


def login_is_limited(request: Request, normalized_email: str) -> bool:
    cutoff = utc_now() - timedelta(minutes=15)
    with _login_lock:
        attempts = _login_failures[_failure_key(request, normalized_email)]
        while attempts and attempts[0] < cutoff:
            attempts.popleft()
        return len(attempts) >= 5


def record_login_failure(request: Request, normalized_email: str) -> None:
    with _login_lock:
        _login_failures[_failure_key(request, normalized_email)].append(utc_now())


def clear_login_failures(request: Request, normalized_email: str) -> None:
    with _login_lock:
        _login_failures.pop(_failure_key(request, normalized_email), None)


def secure_cookie_enabled() -> bool:
    return os.getenv("PROOFLAB_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes"}


def require_current_user(request: Request, db: Session = Depends(get_db)) -> CurrentUser:
    current_user = find_current_user(db, request.cookies.get(SESSION_COOKIE_NAME))
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication is required.")
    return current_user

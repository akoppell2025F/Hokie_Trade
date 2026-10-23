"""Shared pytest fixtures for the Hokie Trade backend."""

from unittest.mock import MagicMock

import pytest

import email_verification
from email_verification import SmtpConfig


@pytest.fixture
def smtp_config() -> SmtpConfig:
    return SmtpConfig(
        host="smtp.test.local",
        port=587,
        username="hokietrade@test.local",
        password="not-a-real-password",
        sender="hokietrade@test.local",
    )


@pytest.fixture
def fake_smtp(monkeypatch):
    """Replace smtplib.SMTP with a mock so tests never send real email.

    Returns the mock *server* object (what `with smtplib.SMTP(...) as server`
    yields), with the constructor mock attached as `.factory`.
    """
    server = MagicMock(name="smtp_server")
    factory = MagicMock(name="SMTP")
    factory.return_value.__enter__.return_value = server
    factory.return_value.__exit__.return_value = False
    monkeypatch.setattr(email_verification.smtplib, "SMTP", factory)
    server.factory = factory
    return server